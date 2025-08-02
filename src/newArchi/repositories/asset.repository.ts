import { Asset, AssetDB } from "../models/asset.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { SubgraphService } from "../services/subgraph.service";


export class AssetRepository extends BaseRepository<Asset, AssetDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "assets",
    ) {
        super(
            dbService,
            viemService,
            table,
        );
    }

    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: AssetDB): Asset {
        return Asset.fromDB(dbRecord);
    }


    protected toDB(model: Asset): AssetDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: AssetDB): void {
        appender.appendVarchar(dbRecord.address);
        appender.appendInteger(dbRecord.decimals);
        appender.appendVarchar(dbRecord.name);
        appender.appendVarchar(dbRecord.symbol);
        appender.appendBigInt(dbRecord.created_at);
        appender.appendBigInt(dbRecord.last_updated);
    }
}