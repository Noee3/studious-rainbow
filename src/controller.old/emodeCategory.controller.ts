// import { BaseController } from "./base.controller";
// import { queryAaveEmodeCategoriesId } from "../typechain/queries/query";
// import { DuckDBConnection } from '@duckdb/node-api';
// import { EmodeCategory, EmodeCategoryDB } from '../models/emodeCategory.model';
// import { aave_poolAbi } from "../typechain/aave.abi";


// export class EmodeCategoryController extends BaseController {

//     private tableName: string = 'emode_categories';


//     constructor(_connection: DuckDBConnection) {
//         super();
//         this.connection = _connection;
//     }

//     async init(): Promise<EmodeCategory[]> {
//         try {
//             console.info("[EmodeCategoryController] :: initialisation");
//             let emodeCategories = await this.fetchEmodeCategoriesDB();
//             if (emodeCategories.length === 0) {
//                 console.info("[EmodeCategoryController] :: fetchEmodeCategoriesData 🌐");
//                 const categories = await this.fetchEmodeCategoriesId();
//                 for (let i = 0; i < categories.length; i++) {
//                     const emodeCategory = await this.fetchEmodeCategoryData(categories[i]);
//                     emodeCategories.push(emodeCategory);
//                 }
//                 await this.insertEmodeCategoriesDB(emodeCategories);
//             } else {
//                 console.info("[EmodeCategoryController] :: fetchEmodeCategoriesDB 💾");
//             }

//             return emodeCategories;
//         } catch (e) {
//             console.error("[EmodeCategoryController][init] :: Error initialising emode categories data:", e);
//             throw e;
//         }
//     }

//     async fetchEmodeCategoriesId(): Promise<number[]> {
//         try {
//             const { request } = await import('graphql-request');
//             const data: any = await request(this.base_subEndpoint, queryAaveEmodeCategoriesId(), {}, this.headers) as any;
//             const emodeCategories = data.emodeCategories.map((e: any) => {
//                 return e.id;
//             });
//             return emodeCategories;
//         } catch (error) {
//             console.error("[EmodeCategoryController][fetchEmodeCategoriesId] :: Error fetching emode categories id:", error);
//             throw error;
//         }
//     }


//     // Get id from the subgraph (let i = 1; i < 10; i++);
//     async fetchEmodeCategoryData(id: number): Promise<EmodeCategory> {
//         try {
//             const emodeCategoryData: any = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getEModeCategoryData',
//                 args: [id],
//             });

//             const bitmap = await this.client.readContract({
//                 blockNumber: this.blockNumber as bigint,
//                 address: this.base_pool,
//                 abi: aave_poolAbi,
//                 functionName: 'getEModeCategoryCollateralBitmap',
//                 args: [id],
//             }) as bigint;

//             const eModeCategory = new EmodeCategory(
//                 id,
//                 emodeCategoryData.ltv as bigint,
//                 emodeCategoryData.liquidationThreshold as bigint,
//                 emodeCategoryData.liquidationBonus as bigint,
//                 emodeCategoryData.label,
//                 bitmap as bigint
//             );

//             return eModeCategory;

//         } catch (error) {
//             console.error("[EmodeCategoryController][fetchEmodeCategoryData] :: Error fetching eMode category data:", error);
//             throw error;
//         }
//     }

//     async insertEmodeCategoriesDB(EmodeCategories: EmodeCategory[]) {
//         try {
//             const appender = await this.connection!.createAppender(this.tableName);

//             for (const category of EmodeCategories) {
//                 const categoryDB = category.toDB();
//                 appender.appendInteger(Number(category.id));
//                 appender.appendInteger(categoryDB.ltv);
//                 appender.appendInteger(categoryDB.liquidation_threshold);
//                 appender.appendInteger(categoryDB.liquidation_bonus);
//                 appender.appendVarchar(category.label);
//                 appender.appendBigInt(category.bitmap);
//                 appender.appendBigInt(categoryDB.last_updated);
//                 appender.endRow();
//                 appender.flushSync();
//             }
//         } catch (e) {
//             console.error('[EmodeCategoryController][insertEmodeCategoriesDB] :: Error inserting assets:', e);
//             throw e;
//         }
//     }

//     async fetchEmodeCategoriesDB(): Promise<EmodeCategory[]> {
//         try {
//             const result = await this.connection!.run(`SELECT * FROM ${this.tableName}`);
//             const rows: EmodeCategoryDB[] = await result.getRowObjectsJson() as unknown as EmodeCategoryDB[];

//             return rows.map((row: EmodeCategoryDB) => new EmodeCategory(
//                 row.id,
//                 BigInt(row.ltv),
//                 BigInt(row.liquidation_threshold),
//                 BigInt(row.liquidation_bonus),
//                 row.label,
//                 BigInt(row.bitmap),
//                 new Date(Number(row.last_updated))
//             ));
//         } catch (e) {
//             console.error('[EmodeCategoryController][fetchEmodeCategoriesDB] :: Error fetching emode categories:', e);
//             throw e;
//         }
//     }
// }