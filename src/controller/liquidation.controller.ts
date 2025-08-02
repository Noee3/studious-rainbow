import assert from 'assert';
import { DuckDBConnection } from "@duckdb/node-api";
import { ValidationUtils } from "../utils/validation.utils";
import { DuckDBService } from "../services/duckdb.service";
import { AssetController } from "./asset.controller";
import { ReserveController } from "./reserve.controller";
import { AssetPriceController } from "./assetPrice.controller";
import { EmodeCategoryController } from "./emodeCategory.controller";
import { UserController } from "./user.controller";
import { UserReservesController } from "./userReserves.controller";
import { Reserve } from "../models/reserve.model";
import { Asset } from "../models/asset.model";
import { AssetPrice } from "../models/assetPrice.model";
import { EmodeCategory } from "../models/emodeCategory.model";
import { User } from "../models/user.model";
import { UserReserve } from "../models/userReserve.model";
import { UserAccountData } from '../models/userAccountData.model';
import { Constants } from "../utils/constants.utils";
import { ReportData } from '../models/report.model';


export class LiquidationController {
    protected database: string = 'aave_base';
    protected reports: ReportData[] = [];

    ///@notice database
    protected duckController: DuckDBService;
    protected connection?: DuckDBConnection;

    ///@notice controllers
    public reserveController?: ReserveController;
    protected assetController?: AssetController;
    protected assetPriceController?: AssetPriceController;
    protected eModeCategoryController?: EmodeCategoryController;
    protected userController?: UserController;
    protected userReserveController?: UserReservesController;

    ///@notice data
    protected reserves: Reserve[] = [];
    protected assets: Asset[] = [];
    protected assetPrices: AssetPrice[] = [];
    protected eModeCategories: EmodeCategory[] = [];
    protected users: User[] = [];
    protected usersReserves: UserReserve[] = [];

    constructor() {
        this.duckController = new DuckDBService();
    }

    // 1
    async init(resetDatabase: boolean = false): Promise<void> {
        try {
            this.connection = await this.duckController.connect(this.database);

            if (resetDatabase) {
                await this.duckController.resetDatabase();
            }

            this.reserveController = new ReserveController(this.connection);
            this.assetController = new AssetController(this.connection);
            this.assetPriceController = new AssetPriceController(this.connection);
            this.eModeCategoryController = new EmodeCategoryController(this.connection);
            this.userController = new UserController(this.connection);
            this.userReserveController = new UserReservesController(this.connection);

            assert(this.reserveController, "ReserveController is not initialized");
            assert(this.assetController, "AssetController is not initialized");
            assert(this.assetPriceController, "AssetPriceController is not initialized");
            assert(this.eModeCategoryController, "EmodeCategoryController is not initialized");
            assert(this.userController, "UserController is not initialized");
            assert(this.userReserveController, "UserReservesController is not initialized");

            console.info("[LiquidationController] :: Controllers initialized successfully");
        } catch (e) {
            console.error("[LiquidationController][init] :: Error during initialization:", e);
        }
    }


    // 2
    async fetchData(userNumber: number): Promise<void> {
        try {
            if (!this.connection) {
                throw new Error("Database connection is not established.");
            }

            const { reservesData, assets } = await this.reserveController!.init(this.assetController!);
            this.reserves = reservesData;
            this.assets = assets;

            this.assetPrices = await this.assetPriceController!.init(this.assets);
            this.eModeCategories = await this.eModeCategoryController!.init();
            this.users = await this.userController!.init(userNumber);

            // Fetch user reserves data
            for (const user of this.users) {
                const userReserves = await this.userReserveController!.init(user.address);
                this.usersReserves.push(...userReserves);
            }

            assert(this.reserves.length > 0, "Reserves data is empty");
            assert(this.assets.length > 0, "Assets data is empty");
            assert(this.assetPrices.length > 0, "Asset prices data is empty");
            assert(this.eModeCategories.length > 0, "Emode categories data is empty");
            assert(this.users.length > 0, "Users data is empty");
            assert(this.usersReserves.length > 0, "User reserves data is empty");

            console.info("[LiquidationController] :: Data fetched successfully");
        } catch (e) {
            console.error("[LiquidationController][fetcData] :: Error fetching data:", e);
        }
    }

    // 3
    async computeLiquidationsOpportunities(): Promise<void> {
        try {

            for (const user of this.users) {
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

                const userReservesData: UserReserve[] = this.usersReserves.filter(e => e.userAddress === user.address);
                assert(userReservesData.length > 0, "User reserves data is empty");

                for (const userReserve of userReservesData) {

                    if (userReserve.usageAsCollateralEnabled || userReserve.scaledVariableDebt > 0n) {
                        const currentReserve: Reserve = this.reserves.find((e) => e.assetAddress == userReserve.assetAddress)!;
                        assert(currentReserve, `Current reserve not found for asset: ${userReserve.assetAddress}`);

                        const { ltv, liquidationThreshold, liquidityIndex, variableBorrowIndex } = currentReserve;

                        const asset: Asset = this.assets.find((e) => e.address === userReserve.assetAddress)!;
                        assert(asset, `Asset not found for reserve: ${userReserve.assetAddress}`);

                        const assetPrice: AssetPrice = this.assetPrices.find((e) => e.assetAddress == asset.address)!;
                        assert(assetPrice, `Asset price not found for asset: ${asset.address}`);

                        let userBalanceInBaseCurrency = 0n;

                        if (userReserve.usageAsCollateralEnabled && liquidationThreshold != 0n) {
                            userBalanceInBaseCurrency = ((userReserve.scaledATokenBalance * liquidityIndex / Constants.RAY) * assetPrice.priceBaseCurrency) / (10n ** asset.decimals);
                            totalCollateralBalanceInBaseCurrency += userBalanceInBaseCurrency;
                        }

                        if (ltv != 0n) {
                            avgLtv += userBalanceInBaseCurrency * (user.eModeCategory != undefined ? BigInt(userEModeLtv) : BigInt(ltv));
                        }

                        avgLiquidationThreshold += userBalanceInBaseCurrency * (user.eModeCategory != undefined ? BigInt(userEModeLiquidtionThreshold) : BigInt(liquidationThreshold));
                        if (userReserve.scaledVariableDebt > 0n) {
                            totalDebtBalanceInBaseCurrency += ((userReserve.scaledVariableDebt * variableBorrowIndex / Constants.RAY) * assetPrice.priceBaseCurrency) / (10n ** asset.decimals);
                        }
                    }
                }

                avgLtv = totalCollateralBalanceInBaseCurrency != 0n ? avgLtv / totalCollateralBalanceInBaseCurrency : 0n;
                avgLiquidationThreshold = totalCollateralBalanceInBaseCurrency != 0n ? avgLiquidationThreshold / totalCollateralBalanceInBaseCurrency : 0n;

                const healthFactor = totalDebtBalanceInBaseCurrency == 0n
                    ? BigInt(Number.MAX_SAFE_INTEGER)
                    : (totalCollateralBalanceInBaseCurrency * avgLiquidationThreshold * Constants.WAD) / (10000n * totalDebtBalanceInBaseCurrency);

                const userAccountDataFromCalculation: UserAccountData = new UserAccountData(
                    totalCollateralBalanceInBaseCurrency,
                    totalDebtBalanceInBaseCurrency,
                    avgLiquidationThreshold,
                    avgLtv,
                    healthFactor,
                );

                const userAccountDataFromChain: UserAccountData = await this.userController!.getUserAccountData(user.address);

                //reports
                const report: ReportData = new ReportData(
                    user.address,
                    userAccountDataFromCalculation,
                    userAccountDataFromChain,
                );

                this.reports.push(report);
            }

            // Validate the reports
            await ValidationUtils.assertionWithTolerance(this.reports);

        } catch (e) {
            console.error("[LiquidationController][computeLiquidationsOpportunities] :: Error computing liquidation opportunities:", e);
        }
    }

}