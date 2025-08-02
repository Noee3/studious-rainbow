import { AssetPrice, AssetPriceDB } from "../models/asset_price.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { SubgraphService } from "../services/subgraph.service";
import { oracleAbi } from "../typechain/abis/aaveOracle.abi";
import { Address } from "viem";

export class AssetPriceRepository extends BaseRepository<AssetPrice, AssetPriceDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "asset_prices",
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

    async fetchAssetsPricesData(assetsAddress: Address[]): Promise<AssetPrice[]> {
        const result = await this.blockChainRepository.readContract<bigint[]>(
            this.viemService.aaveOracle,
            oracleAbi,
            'getAssetsPrices',
            [assetsAddress],
        );

        console.log(result);

        return result.map((price, index) => new AssetPrice(
            assetsAddress[index],
            price,
        ));
    }

    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: AssetPriceDB): AssetPrice {
        return AssetPrice.fromDB(dbRecord);
    }


    protected toDB(model: AssetPrice): AssetPriceDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: AssetPriceDB): void {
        appender.appendVarchar(dbRecord.asset_address);
        appender.appendVarchar(dbRecord.price_base_currency);
        appender.appendBigInt(dbRecord.timestamp);
    }
}