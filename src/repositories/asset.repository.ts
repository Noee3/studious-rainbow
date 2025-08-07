import { Asset, AssetDB } from "../models/asset.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { SubgraphService } from "../services/subgraph.service";
import { Call } from "./base/blockchain.repository";
import { poolAbi } from "../typechain/abis/aavePool.abi";
import { Address, erc20Abi } from "viem";


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
                            BLOCKCHAIN
    //////////////////////////////////////////////////////////////*/

    async fetchAssetList(): Promise<Address[]> {
        const result = await this.blockChainRepository.readContract<Address[]>(
            this.viemService.poolContract,
            poolAbi,
            'getReservesList',
        );
        return result;
    }

    async fetchAssetData(assetsAddress: Address[]): Promise<any[]> {

        const calls: Call[] = assetsAddress.flatMap((address) => [
            {
                address,
                abi: erc20Abi,
                functionName: 'name',
            },
            {
                address,
                abi: erc20Abi,
                functionName: 'decimals',
            },
            {
                address,
                abi: erc20Abi,
                functionName: 'symbol',
            }
        ]);

        const result = await this.blockChainRepository.multiCall(calls);

        const assets: Asset[] = [];

        for (let i = 0; i < assetsAddress.length; i++) {
            const baseIndex = i * 3;

            const name = result[baseIndex] as string;       // name
            const decimals = result[baseIndex + 1] as bigint; // decimals
            const symbol = result[baseIndex + 2] as string;   // symbol

            assets.push(new Asset(
                assetsAddress[i], // address correcte
                decimals,
                name,
                symbol,
            ));
        }

        return assets;
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