import { Reserve, ReserveDB } from "../models/reserve.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { uiPoolDataProviderAbi } from "../typechain/abis/aaveUiPoolDataProvider.abi";
import { Address } from "viem";
import { SubgraphService } from "../services/subgraph.service";


export class ReserveRepository extends BaseRepository<Reserve, ReserveDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "reserves",
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

    public async fetchReservesData(blockNumber?: bigint): Promise<Reserve[]> {
        const result = await this.blockChainRepository.readContract<any>(
            this.viemService.uiPoolDataProvider,
            uiPoolDataProviderAbi,
            'getReservesData',
            [this.viemService.addressProvider],
            blockNumber ?? this.viemService.blockNumber
        );


        return result[0].map((e: any) => {
            e = this.normalizeAddresses(e);
            return new Reserve(
                e.underlyingAsset as Address,
                e.name,
                e.symbol,
                BigInt(e.decimals),
                e.reserveLiquidationThreshold,
                e.liquidityIndex,
                e.variableBorrowIndex,
                e.baseLTVasCollateral,
                e.reserveLiquidationBonus,
                e.reserveFactor,
                e.aTokenAddress as Address,
                e.variableDebtTokenAddress as Address,
                e.isActive,
                e.isFrozen,
                new Date(e.lastUpdateTimestamp * 1000),
            )
        });
    }


    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: ReserveDB): Reserve {
        return Reserve.fromDB(dbRecord);
    }


    protected toDB(model: Reserve): ReserveDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: ReserveDB): void {
        appender.appendVarchar(dbRecord.asset_address);
        appender.appendVarchar(dbRecord.name);
        appender.appendVarchar(dbRecord.symbol);
        appender.appendInteger(dbRecord.decimals);
        appender.appendInteger(dbRecord.liquidation_threshold);
        appender.appendVarchar(dbRecord.liquidity_index);
        appender.appendVarchar(dbRecord.variable_borrow_index);
        appender.appendInteger(dbRecord.ltv);
        appender.appendInteger(dbRecord.liquidation_bonus);
        appender.appendInteger(dbRecord.reserve_factor);
        appender.appendVarchar(dbRecord.a_token_address);
        appender.appendVarchar(dbRecord.variable_debt_token_address);
        appender.appendBoolean(dbRecord.is_active);
        appender.appendBoolean(dbRecord.is_frozen);
        appender.appendBigInt(dbRecord.last_updated);
    }
}