import assert from 'assert';

import { UserReserve } from "../models/user_reserve.model";
import { ServiceContainer } from "../services/service_container";
import { Reserve } from '../models/reserve.model';
import { Asset } from '../models/asset.model';
import { AssetPrice } from '../models/asset_price.model';
import { EmodeCategory } from '../models/emode_category.model';
import { ReportData } from '../models/report.model';
import { User } from '../models/user.model';
import { UserAccountData } from '../models/user_account_data.model';
import { Constants } from '../utils/constants.utils';
import { ValidationUtils } from '../utils/validation.utils';
import { _fetchData } from 'ethers/lib/utils';
import { Address } from 'viem';

export class ArbitrageMonitor {
    public reports: ReportData[] = [];

    ///@notice data
    public reserves: Reserve[] = [];
    public assets: Asset[] = [];
    public assetPrices: AssetPrice[] = [];
    public eModeCategories: EmodeCategory[] = [];
    public users: User[] = [];
    public usersReserves: UserReserve[] = [];



    async start(number: number, reset: boolean): Promise<void> {
        await this.initializeServices();

        await this.fetchData(number, reset);

        await this.computeLiquidationOpportunities();
    }

    async initializeServices(): Promise<void> {
        await ServiceContainer.initialize();
    }

    async fetchData(users: number | Address[], reset: boolean = false): Promise<boolean> {
        try {

            if (reset) {
                await ServiceContainer.dbService.resetDatabase();
            }

            this.assets = await ServiceContainer.assetController.init();
            this.reserves = await ServiceContainer.reserveController.init();
            this.assetPrices = await ServiceContainer.assetPriceController.init(this.assets);
            this.eModeCategories = await ServiceContainer.eModeCategoryController.init();
            this.users = await ServiceContainer.userController.init(users);

            for (const user of this.users) {
                const userReservesData = await ServiceContainer.userReserveController!.init(user.address);
                this.usersReserves.push(...userReservesData);
            }

            assert(this.reserves.length > 0, "Reserves data is empty");
            assert(this.assets.length > 0, "Assets data is empty");
            assert(this.assetPrices.length > 0, "Asset prices data is empty");
            assert(this.eModeCategories.length > 0, "Emode categories data is empty");
            assert(this.users.length > 0, "Users data is empty");
            assert(this.usersReserves.length > 0, "User reserves data is empty");

            console.info("[ServiceContainer] :: Data fetched successfully");
            return true;
        } catch (error) {
            console.error("[ServiceContainer][fetchData] :: Error running services:", error);
            throw error;
        }
    }

    async computeLiquidationOpportunities(): Promise<void> {
        for (const user of this.users) {
            const userAccountDataFromCalculation: UserAccountData = await this.computeLiquidationOpportunitiesForUser(user);
            const userAccountDataFromChain: UserAccountData = await ServiceContainer.userController!.fetchUserAccountData(user.address);

            const report: ReportData = new ReportData(
                user.address,
                userAccountDataFromCalculation,
                userAccountDataFromChain,
            );

            this.reports.push(report);
        }
        // Validate the reports
        await ValidationUtils.assertionWithTolerance(this.reports);
        console.log("[ArbitrageMonitor] :: Liquidation opportunities computed successfully");
    }

    async computeLiquidationOpportunitiesForUser(user: User): Promise<UserAccountData> {
        let totalCollateralBalanceInBaseCurrency: bigint = 0n;
        let totalDebtBalanceInBaseCurrency: bigint = 0n;

        let userEModeLtv: bigint = 0n;
        let userEModeLiquidtionThreshold: bigint = 0n;
        let userEModeBitmap: bigint = 0n;

        let avgLtv: bigint = 0n;
        let avgLiquidationThreshold: bigint = 0n;

        if (user.eModeCategory != undefined && user.eModeCategory != 0 && user.eModeCategory != null) {
            const eModeCategory: EmodeCategory = this.eModeCategories!.find(e => e.id == user.eModeCategory)!;
            ({ ltv: userEModeLtv, liquidationThreshold: userEModeLiquidtionThreshold, bitmap: userEModeBitmap } = eModeCategory);
        }

        const userReservesData: UserReserve[] = this.usersReserves.filter(e => e.userAddress == user.address);
        assert(userReservesData.length > 0, "User reserves data is empty");

        for (const userReserve of userReservesData) {

            if (userReserve.usageAsCollateralEnabled || userReserve.scaledVariableDebt > 0n) {
                const currentReserve: Reserve = this.reserves.find((e) => e.assetAddress == userReserve.assetAddress)!;
                console.log('reserve', userReserve.assetAddress);
                assert(currentReserve, `Current reserve not found for asset: ${userReserve.assetAddress}`);

                const { ltv, liquidationThreshold, liquidityIndex, variableBorrowIndex } = currentReserve;

                const asset: Asset = this.assets.find((e) => e.address === userReserve.assetAddress)!;
                assert(asset, `Asset not found for reserve: ${userReserve.assetAddress}`);

                const assetPrice: AssetPrice = this.assetPrices.find((e) => e.assetAddress == asset.address)!;
                assert(assetPrice, `Asset price not found for asset: ${asset.address}`);

                let userBalanceInBaseCurrency = 0n;

                if (userReserve.usageAsCollateralEnabled && liquidationThreshold != 0n) {
                    userBalanceInBaseCurrency = ((userReserve.scaledATokenBalance * liquidityIndex / Constants.RAY) * assetPrice.priceBaseCurrency) / (10n ** BigInt(asset.decimals));
                    totalCollateralBalanceInBaseCurrency += userBalanceInBaseCurrency;
                }

                if (ltv != 0n) {
                    avgLtv += userBalanceInBaseCurrency * (user.eModeCategory != undefined ? BigInt(userEModeLtv) : BigInt(ltv));
                }

                avgLiquidationThreshold += userBalanceInBaseCurrency * (user.eModeCategory != undefined ? BigInt(userEModeLiquidtionThreshold) : BigInt(liquidationThreshold));
                if (userReserve.scaledVariableDebt > 0n) {
                    totalDebtBalanceInBaseCurrency += ((userReserve.scaledVariableDebt * variableBorrowIndex / Constants.RAY) * assetPrice.priceBaseCurrency) / (10n ** BigInt(asset.decimals));
                }
            }
        }

        avgLtv = totalCollateralBalanceInBaseCurrency != 0n ? avgLtv / totalCollateralBalanceInBaseCurrency : 0n;
        avgLiquidationThreshold = totalCollateralBalanceInBaseCurrency != 0n ? avgLiquidationThreshold / totalCollateralBalanceInBaseCurrency : 0n;

        const healthFactor = totalDebtBalanceInBaseCurrency == 0n
            ? BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935n) // Max value for health factor
            : (totalCollateralBalanceInBaseCurrency * avgLiquidationThreshold * Constants.WAD) / (10000n * totalDebtBalanceInBaseCurrency);

        const userAccountDataFromCalculation: UserAccountData = new UserAccountData(
            totalCollateralBalanceInBaseCurrency,
            totalDebtBalanceInBaseCurrency,
            avgLiquidationThreshold,
            avgLtv,
            healthFactor,
        );

        return userAccountDataFromCalculation;
    }
}