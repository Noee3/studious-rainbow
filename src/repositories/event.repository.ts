import { Event, EventDB } from "../models/event.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { uiPoolDataProviderAbi } from "../typechain/abis/aaveUiPoolDataProvider.abi";
import { Address } from "viem";
import { SubgraphService } from "../services/subgraph.service";


export class EventRespository extends BaseRepository<Event, EventDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "events",
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


    public async fetchContractEventsData(contractAddress: Address, abi: any, blockToAdd: bigint, eventName?: string, args?: {}): Promise<Event[]> {
        let result = await this.blockChainRepository.getContractEvents<any[]>(
            contractAddress,
            abi,
            this.viemService.blockNumber + blockToAdd,
            this.viemService.blockNumber as bigint,
            eventName,
            args
        );

        result = result.filter(e => e.removed == false);
        console.log(result.filter(e => e.eventName === "Withdraw"));

        return result.map(e => {
            e = this.normalizeAddresses(e);
            e.args = this.normalizeAddresses(e.args);
            return new Event(
                e.eventName,
                e.args.reserve,
                e.args.liquidityRate ? BigInt(e.args.liquidityRate) : e.args.liquidityRate,
                e.args.variableBorrowRate ? BigInt(e.args.variableBorrowRate) : e.args.variableBorrowRate,
                e.args.liquidityIndex ? BigInt(e.args.liquidityIndex) : e.args.liquidityIndex,
                e.args.variableBorrowIndex ? BigInt(e.args.variableBorrowIndex) : e.args.variableBorrowIndex,
                e.args.interestRateMode,
                e.args.borrowRate,
                e.args.onBehalfOf,
                e.args.user,
                e.args.repayer,
                e.args.to,
                e.args.amount,
                e.args.useATokens,
                e.address,
                e.blockNumber,
                e.transactionHash,
            )
        });
    }


    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: EventDB): Event {
        return Event.fromDB(dbRecord);
    }


    protected toDB(model: Event): EventDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: EventDB): void {
        appender.appendVarchar(dbRecord.event_name);
        appender.appendVarchar(dbRecord.reserve);
        appender.appendVarchar(dbRecord.onBehalfOf);
        appender.appendVarchar(dbRecord.user);
        appender.appendVarchar(dbRecord.amount);
        appender.appendVarchar(dbRecord.contract_address);
        appender.appendVarchar(dbRecord.block_number);
        appender.appendVarchar(dbRecord.transaction_hash);
    }
}