// import { Address } from "viem";
// import { ClientController } from "./client.controller";
// import { aave_uiPoolDataProviderAbi, aave_poolAbi, aave_oracleAbi } from "../typechain/aave.abi";
// import { queryAaveUsers } from "../typechain/queries/query";
// import { ReserveData, UserReserveData } from "../typechain/interfaces/reserveData.interface";
// import { convertUserAccountData, UserAccountData } from "../typechain/interfaces/userAccountData.interface";
// import { EmodeCategoryData } from "../typechain/interfaces/eModeCategory.interface";


// interface Call {
//     address: Address;
//     abi: any;
//     functionName: string;
//     args: any[];
// }

// export class AaveController extends ClientController {
//     public base_uiPoolDataProvider: Address;
//     public base_addressProvider: Address;
//     public base_pool: Address;
//     public base_aaveOracle: Address;

//     constructor() {
//         super();
//         this.base_uiPoolDataProvider = "0x68100bD5345eA474D93577127C11F39FF8463e93";
//         this.base_addressProvider = "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D";
//         this.base_pool = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
//         this.base_aaveOracle = "0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156";
//     }

//     /*//////////////////////////////////////////////////////////////
//                              RESERVES DATA
//     //////////////////////////////////////////////////////////////*/

//     async fetchReservesData(): Promise<ReserveData[]> {
//         try {
//             const result: unknown | [] = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_uiPoolDataProvider,
//                 abi: aave_uiPoolDataProviderAbi,
//                 functionName: 'getReservesData',
//                 args: [this.base_addressProvider],
//             });

//             if (result && Array.isArray(result)) {
//                 return result[0] as ReserveData[];
//             }

//             throw new Error("No reserves data found");

//         } catch (error) {
//             console.error("[AaveController][fetchReservesData] :: Error fetching reserves data:", error);
//             throw error;
//         }
//     }

//     /*//////////////////////////////////////////////////////////////
//                              USER DATA
//     //////////////////////////////////////////////////////////////*/

//     async getUserAccountData(userAddress: Address): Promise<UserAccountData> {
//         try {
//             const result: any = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getUserAccountData',
//                 args: [userAddress],
//             });

//             return convertUserAccountData(result) as UserAccountData;
//         } catch (error) {
//             console.error("[AaveController][getUserReservesData] :: Error fetching user reserves data:", error);
//             throw error;
//         }
//     }

//     async fetchUser(first: number, skip: number): Promise<any[]> {
//         try {
//             const { request } = await import('graphql-request');
//             const data = await request(this.base_subEndpoint, queryAaveUsers(Number(this.blockNumber), first, skip), {}, this.headers) as any;
//             console.log(data);
//             return data.users as any[];
//         } catch (error) {
//             console.error("[AaveController][fetchUser] :: Error fetching user data:", error);
//             throw error;
//         }
//     }

//     async getUserReservesData(userAddress: Address): Promise<UserReserveData[]> {
//         try {
//             const result: unknown | [] = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_uiPoolDataProvider,
//                 abi: aave_uiPoolDataProviderAbi,
//                 functionName: 'getUserReservesData',
//                 args: [this.base_addressProvider, userAddress],
//             });

//             if (result && Array.isArray(result)) {
//                 return result[0] as UserReserveData[];
//             }

//             throw new Error("No user reserves data found userAddress: " + userAddress);

//         } catch (error) {
//             console.error("[AaveController][getUserReservesData] :: Error fetching user reserves data:", error);
//             throw error;
//         }
//     }

//     async multiCallUserReservesData(userAddresses: Address[]): Promise<UserReserveData[][]> {
//         try {

//             let calls: Call[] = [];

//             for (const user of userAddresses) {
//                 calls.push({
//                     address: this.base_uiPoolDataProvider,
//                     abi: aave_uiPoolDataProviderAbi,
//                     functionName: 'getUserReservesData',
//                     args: [this.base_addressProvider, user],
//                 });
//             }

//             const result = await this.client.multicall({
//                 blockNumber: this.blockNumber as bigint,
//                 contracts: calls,
//                 allowFailure: false,
//             });

//             return result as UserReserveData[][];

//         } catch (error) {
//             console.error("[AaveController][multiCallUserReservesData] :: Error fetching user reserves data:", error);
//             throw error;
//         }
//     }


//     /*//////////////////////////////////////////////////////////////
//                              EMODE
//     //////////////////////////////////////////////////////////////*/

//     async getUserEmode(userAddress: Address): Promise<number> {
//         try {
//             const result = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getUserEMode',
//                 args: [userAddress],
//             });
//             return result as number;
//         } catch (error) {
//             console.error("[AaveController][getUserEmode] :: Error fetching user eMode:", error);
//             throw error;
//         }
//     }

//     async getEmodeCategoryData(id: number): Promise<EmodeCategoryData> {
//         try {
//             let emodeCategoryData = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getEModeCategoryData',
//                 args: [id],
//             }) as EmodeCategoryData;

//             const bitmap = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getEModeCategoryCollateralBitmap',
//                 args: [id],
//             }) as bigint;

//             emodeCategoryData.bitmap = bitmap;
//             return emodeCategoryData as EmodeCategoryData;
//         } catch (error) {
//             console.error("[AaveController][getEmodeCategoryData] :: Error fetching eMode category data:", error);
//             throw error;
//         }
//     }

//     /*//////////////////////////////////////////////////////////////
//                              ASSET
//     //////////////////////////////////////////////////////////////*/

//     async getAssetPrice(reserveAddress: Address): Promise<bigint> {
//         try {
//             const result = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_aaveOracle,
//                 abi: aave_oracleAbi,
//                 functionName: 'getAssetPrice',
//                 args: [reserveAddress],
//             }) as bigint;

//             return result;
//         } catch (error) {
//             console.error("[AaveController][getAssetPrice] :: Error fetching asset price:", error);
//             throw error;
//         }
//     }
// }