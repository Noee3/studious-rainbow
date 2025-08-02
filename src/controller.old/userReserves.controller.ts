// import { Address } from "viem";
// import { BaseController } from "./base.controller";
// import { DuckDBConnection } from '@duckdb/node-api';
// import { UserReserve, UserReserveDB } from "../models/userReserve.model";
// import { aave_uiPoolDataProviderAbi } from "../typechain/aave.abi";


// export class UserReservesController extends BaseController {

//     private tableName: string = 'user_reserves';


//     constructor(_connection: DuckDBConnection) {
//         super();
//         this.connection = _connection;
//     }

//     async init(userAddress: Address): Promise<UserReserve[]> {
//         try {
//             console.info("[UserReservesController] :: initialisation for user:", userAddress);
//             let userReserves = await this.fetchUserReservesDB(userAddress);
//             if (userReserves.length === 0) {
//                 console.info("[UserReservesController] :: fetchUserReservesData 🌐");
//                 userReserves = await this.fetchUserReservesData(userAddress);
//                 await this.insertUserReservesDB(userReserves);

//                 // not necessary just to confirm data conformity
//                 userReserves = await this.fetchUserReservesDB(userAddress);
//             } else {
//                 console.info("[UserReservesController] :: fetchUserReservesDB 💾");
//             }
//             return userReserves;
//         } catch (e) {
//             console.error("[UserReservesController][init] :: Error initialising user reserves data:", e);
//             throw e;
//         }
//     }


//     async fetchUserReservesData(userAddress: Address): Promise<UserReserve[]> {
//         try {
//             const result: unknown | [] = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_uiPoolDataProvider,
//                 abi: aave_uiPoolDataProviderAbi,
//                 functionName: 'getUserReservesData',
//                 args: [this.base_addressProvider, userAddress],
//             });

//             if (result && Array.isArray(result)) {
//                 return result[0].map((e: any) => new UserReserve(
//                     userAddress,
//                     e.underlyingAsset as Address,
//                     e.usageAsCollateralEnabledOnUser,
//                     e.scaledATokenBalance as bigint,
//                     e.scaledVariableDebt as bigint,
//                 ));
//             }

//             throw new Error("No user reserves data found userAddress: " + userAddress);

//         } catch (error) {
//             console.error("[UserReserveController][fetchUserReservesData] :: Error fetching user reserves data:", error);
//             throw error;
//         }
//     }

//     async insertUserReservesDB(userReserve: UserReserve[]) {
//         try {
//             const appender = await this.connection!.createAppender(this.tableName);

//             for (const reserve of userReserve) {
//                 const reserveDB = reserve.toDB();
//                 appender.appendVarchar(reserveDB.user_address);
//                 appender.appendVarchar(reserveDB.asset_address);
//                 appender.appendBoolean(reserveDB.usage_as_collateral_enabled);
//                 appender.appendVarchar(reserveDB.scaled_atoken_balance);
//                 appender.appendVarchar(reserveDB.scaled_variable_debt);
//                 appender.appendBigInt(reserveDB.last_updated);
//                 appender.endRow();
//                 appender.flushSync();
//             }
//         } catch (e) {
//             console.error('[UserReserveController][insertUserReservesDB] :: Error inserting user reserves:', e);
//             throw e;
//         }
//     }

//     async fetchUserReservesDB(userAddress?: Address): Promise<UserReserve[]> {
//         try {
//             let query = `SELECT * FROM ${this.tableName}`;
//             if (userAddress) {
//                 query += ` WHERE user_address = '${userAddress}'`;
//             }
//             const result = await this.connection!.run(query);
//             const rows: UserReserveDB[] = await result.getRowObjectsJson() as unknown as UserReserveDB[];

//             const userReserves = rows.map((row: UserReserveDB) => new UserReserve(
//                 row.user_address as Address,
//                 row.asset_address as Address,
//                 row.usage_as_collateral_enabled,
//                 BigInt(row.scaled_atoken_balance),
//                 BigInt(row.scaled_variable_debt),
//                 new Date(Number(row.last_updated))
//             ));
//             console.log(userReserves);
//             return userReserves;
//         } catch (e) {
//             console.error('[UserReserveController][fetchUserReservesDB] :: Error fetching user reserves:', e);
//             throw e;
//         }
//     }
//     // async update//TODO
// }