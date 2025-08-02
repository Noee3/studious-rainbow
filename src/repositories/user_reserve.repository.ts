import { Address } from "viem";
import { UserReserve, UserReserveDB } from "../models/user_reserve.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { uiPoolDataProviderAbi } from "../typechain/abis/aaveUiPoolDataProvider.abi";
import { SubgraphService } from "../services/subgraph.service";


export class UserReserveRepository extends BaseRepository<UserReserve, UserReserveDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "user_reserves",
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

    public async fetchUserReservesData(userAddress: Address): Promise<UserReserve[]> {
        const result = await this.blockChainRepository.readContract<any>(
            this.viemService.uiPoolDataProvider,
            uiPoolDataProviderAbi,
            'getUserReservesData',
            [this.viemService.addressProvider, userAddress]
        );

        return result[0].map((e: any) =>
            new UserReserve(
                userAddress,
                e.underlyingAsset as Address,
                e.usageAsCollateralEnabledOnUser,
                e.scaledATokenBalance as bigint,
                e.scaledVariableDebt as bigint,
            )
        );
    }


    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: UserReserveDB): UserReserve {
        return UserReserve.fromDB(dbRecord);
    }


    protected toDB(model: UserReserve): UserReserveDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: UserReserveDB): void {
        appender.appendVarchar(dbRecord.user_address);
        appender.appendVarchar(dbRecord.asset_address);
        appender.appendBoolean(dbRecord.usage_as_collateral_enabled);
        appender.appendVarchar(dbRecord.scaled_atoken_balance);
        appender.appendVarchar(dbRecord.scaled_variable_debt);
        appender.appendBigInt(dbRecord.last_updated);
    }
}