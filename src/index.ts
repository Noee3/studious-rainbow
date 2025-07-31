import { Address } from 'viem';
import assert from 'assert';
import { Constants } from "./utils/constants";
import { ReserveData, UserReserveData } from "../src/typechain/interfaces/reserveData.interface";
import { DuckDBController } from "./controller/duckdb.controller";
import { Helpers } from "./utils/helpers";
import { Asset, AssetDB } from "./models/asset.model";
import { AssetController } from './controller/asset.controller';
import { EmodeCategoryController } from './controller/emodeCategory.controller';
import { EmodeCategory, EmodeCategoryDB } from './models/emodeCategory.model';
import { UserController } from './controller/user.controller';
import { User } from './models/user.model';
import { UserReservesController } from './controller/userReserves.controller';
import { ReserveController } from './controller/reserve.controller';
import { Reserve } from './models/reserve.model';
import { UserReserve } from './models/userReserve.model';
import { AssetPriceController } from './controller/assetPrice.controller';


/* TODO update index.ts with new function from controller

+ listen event and update db (https://vscode.blockscan.com/8453/0xec202552f0c23bb0c19df2f3311e324bbf015703)
+ websocket alchemy;
- Pour test avec viem on peut simuler les events d'un contrat d'un block de départ a un block d'arrivé :: getContractEvents(fromBlock, toBlock);

+ Faire des tests avec marge d'erreur 0.001%;

+ Définir tous les paramètres qui doivent être des dynamiques pour créer des vues afin de faire des calculs vectorielles,
on peut créer des vues sur des vues (example calcul du healthFactor avec la vue liquidationThreshold)


+ Pas de triggers donc à l'écoute des events pour chaque ajout dans BDD, faire requête pour détecter healthFactor > 1 ou sinon faire une vues intelligente qui renvoies les users
avec une healthFactor < 1, ce qui permet de surveiller une vues ou une table si je stocke plutôt que l'ensemble de la bdd, à voir.
*/


(async () => {
    const duckController: DuckDBController = new DuckDBController();
    const connection = await duckController.connect('aave_base');

    const reserveController = new ReserveController(connection);
    const assetController: AssetController = new AssetController(connection);

    const assetPriceController = new AssetPriceController(connection);
    const emodeCategoryController = new EmodeCategoryController(connection);

    const userController = new UserController(connection);
    const userReserveController = new UserReservesController(connection);

    await duckController.resetDatabase();

    const { reserves, assets } = await reserveController.init(assetController);

    const assetPrices = await assetPriceController.init(assets);
    const eModeCategories = await emodeCategoryController.init();



    // const userss: User[] = await userController.fetchUserData(10, 1);

    // for (let user of userss) {
    //     let p = await userReserveController.fetchUserReservesData(user.address);
    //     console.log(p);;
    //     await userReserveController.insertUserReservesDB(p);
    // }

    // await userReserveController.fetchUserReservesDB();

    return;

    // let reservesData = await reserveController.fetchReservesDB();
    // let assets: Asset[] = await assetController.fetchAssetsDB();

    // if (reservesData.length === 0) {
    //     console.log("[DB] no data found, start fetching reserves data");
    //     const fetchedReservesData: Reserve[] = await reserveController.fetchReservesData();
    //     await reserveController.insertReservesDB(fetchedReservesData);
    //     reservesData = await reserveController.fetchReservesDB();
    // }

    // if (assets.length === 0) {
    //     for (const reserve of reservesData) {
    //         assets.push(new Asset(
    //             reserve.assetAddress as Address,
    //             reserve.decimals,
    //             reserve.name,
    //             reserve.symbol
    //         ));
    //     }
    // }


    // let eModeCategories = await emodeCategoryController.fetchEmodeCategoriesDB();

    // if (eModeCategories.length === 0) {
    //     console.log("[DB] no data found, start fetching reserves data");
    //     for (let i = 1; i < 10; i++) {
    //         let tmp = await emodeCategoryController.fetchEmodeCategoryData(i);
    //         eModeCategories.push(tmp);
    //     }
    // }

    // const users = await userController.fetchUserData(10, 1);


    // for (const user of users) {
    //     let totalCollateralBalanceInBaseCurrency: bigint = 0n;
    //     let totalDebtBalanceInBaseCurrency: bigint = 0n;

    //     let userEModeCategory: number;
    //     let userEModeLtv: bigint = 0n;
    //     let userEModeLiquidtionThreshold: bigint = 0n;
    //     let userEModeBitmap: bigint;

    //     let avgLtv: bigint = 0n;
    //     let avgLiquidationThreshold: bigint = 0n;

    //     userEModeCategory = user.eModeCategory;

    //     if (userEModeCategory != 0 || userEModeCategory != undefined) {

    //         const eModeCategory: EmodeCategory = eModeCategories.find((e) => e.id == user.eModeCategory)!;

    //         const { ltv, liquidationThreshold, bitmap } = eModeCategory;

    //         userEModeLtv = ltv;
    //         userEModeLiquidtionThreshold = liquidationThreshold;
    //         userEModeBitmap = bitmap;
    //     }

    //     const userReservesData: UserReserve[] = await userReserveController.fetchUserReservesData(user.address);
    //     //TODO find it from db; import all from db ??


    //     for (const userReserve of userReservesData) {



    //         if (userReserve.usageAsCollateralEnabled || userReserve.scaledVariableDebt > 0n) {

    //             const currentReserve: Reserve = reservesData.find((e) => e.assetAddress == userReserve.assetAddress)!;

    //             assert(currentReserve, `Reserve data not found for asset: ${userReserve.assetAddress}`);

    //             const { ltv, liquidationThreshold, liquidityIndex, variableBorrowIndex } = currentReserve;

    //             const assetPrice: bigint = await assetController.getAssetPrice(userReserve.underlyingAsset);

    //             let userBalanceInBaseCurrency = 0n;

    //             if (userReserve.usageAsCollateralEnabled && liquidationThreshold != 0n) {
    //                 //TODO need to ge ASSET FROM DB to get decimals;
    //                 userBalanceInBaseCurrency = ((userReserve.scaledATokenBalance * liquidityIndex / Constants.RAY) * assetPrice) / (10n ** decimals);
    //             }


    //             totalCollateralBalanceInBaseCurrency += userBalanceInBaseCurrency;

    //             if (ltv != 0n) {
    //                 avgLtv += userBalanceInBaseCurrency * (userEModeCategory != 0 ? BigInt(userEModeLtv) : BigInt(ltv));
    //             }

    //             avgLiquidationThreshold += userBalanceInBaseCurrency * (userEModeCategory != 0 ? BigInt(userEModeLiquidtionThreshold) : BigInt(liquidationThreshold));


    //             if (userReserve.scaledVariableDebt > 0n) {
    //                 totalDebtBalanceInBaseCurrency += ((userReserve.scaledVariableDebt * variableBorrowIndex / Constants.RAY) * assetPrice) / (10n ** decimals);
    //             }
    //         }
    //     }

    //     avgLtv = totalCollateralBalanceInBaseCurrency != 0n ? avgLtv / totalCollateralBalanceInBaseCurrency : 0n;
    //     avgLiquidationThreshold = totalCollateralBalanceInBaseCurrency != 0n ? avgLiquidationThreshold / totalCollateralBalanceInBaseCurrency : 0n;


    //     const healthFactor = totalDebtBalanceInBaseCurrency === 0n
    //         ? BigInt(Number.MAX_SAFE_INTEGER)
    //         : (totalCollateralBalanceInBaseCurrency * avgLiquidationThreshold * Constants.WAD) / (10000n * totalDebtBalanceInBaseCurrency);

    //     const userAccountData = await aaveController.getUserAccountData(user.id);


    //     let header: string[] = [
    //         "User", "CollateralBalanceInBaseCurrency", "DebtBalanceInBaseCurrency", "avgLiquidationThreshold", "avgLTV", "healthFactor"
    //     ];

    //     let row1: any[] = [
    //         Helpers.short(user.address),
    //         totalCollateralBalanceInBaseCurrency,
    //         totalDebtBalanceInBaseCurrency,
    //         avgLiquidationThreshold,
    //         avgLtv,
    //         healthFactor / BigInt(Constants.PRECISION_14)
    //     ];

    //     let row2: any[] = [
    //         "contrat",
    //         userAccountData.totalCollateralBase,
    //         userAccountData.totalDebtBase,
    //         userAccountData.currentLiquidationThreshold,
    //         userAccountData.ltv,
    //         userAccountData.healthFactor / BigInt(Constants.PRECISION_14)
    //     ]

    //     Helpers.consoleTable(header, [row1, row2]);
    // }
})();