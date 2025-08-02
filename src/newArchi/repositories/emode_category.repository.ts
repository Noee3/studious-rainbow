import { EmodeCategory, EmodeCategoryDB } from "../models/emode_category.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { SubgraphService } from "../services/subgraph.service";
import { queryAaveEmodeCategoriesId } from "../typechain/subgraph_queries/queries";
import { poolAbi } from "../typechain/abis/aavePool.abi";


export class EModeCategoryRepository extends BaseRepository<EmodeCategory, EmodeCategoryDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "emode_categories",
    ) {
        super(
            dbService,
            viemService,
            table,
        );
    }

    /*//////////////////////////////////////////////////////////////
                           BLOCKCHAIN
    //////////////////////////////////////////////////////////////*/

    async fetchEmodeCategoryData(id: number): Promise<EmodeCategory> {
        const emodeCategoryData: any = await this.blockChainRepository.readContract(
            this.viemService.poolContract,
            poolAbi,
            'getEModeCategoryData',
            [id],
        );

        const bitmap = await this.blockChainRepository.readContract<bigint>(
            this.viemService.poolContract,
            poolAbi,
            'getEModeCategoryCollateralBitmap',
            [id],
        );

        const eModeCategory = new EmodeCategory(
            id,
            emodeCategoryData.ltv as bigint,
            emodeCategoryData.liquidationThreshold as bigint,
            emodeCategoryData.liquidationBonus as bigint,
            emodeCategoryData.label,
            bitmap as bigint
        );

        return eModeCategory;
    }


    async fetchEmodeCategoriesId(): Promise<number[]> {
        const data: any = await this.blockChainRepository.querySubgraph(queryAaveEmodeCategoriesId(), {});
        const emodeCategories = data.emodeCategories.map((e: any) => {
            return e.id;
        });
        return emodeCategories;
    }


    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: EmodeCategoryDB): EmodeCategory {
        return EmodeCategory.fromDB(dbRecord);
    }


    protected toDB(model: EmodeCategory): EmodeCategoryDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: EmodeCategoryDB): void {
        appender.appendInteger(Number(dbRecord.id));
        appender.appendInteger(dbRecord.ltv);
        appender.appendInteger(dbRecord.liquidation_threshold);
        appender.appendInteger(dbRecord.liquidation_bonus);
        appender.appendVarchar(dbRecord.label);
        appender.appendBigInt(dbRecord.bitmap);
        appender.appendBigInt(dbRecord.last_updated);
    }
}