import { Event, EventDB } from "../models/event.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { uiPoolDataProviderAbi } from "../typechain/abis/aaveUiPoolDataProvider.abi";
import { Address } from "viem";
import { SubgraphService } from "../services/subgraph.service";


export class EventRepository extends BaseRepository<Event, EventDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "eventsNew",
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


    public async fetchContractEventsData(contractAddress: Address, abi: any, fromBlock: bigint, toBlock: bigint, eventName?: string, args?: {}): Promise<Event[]> {
        let result = await this.blockChainRepository.getContractEvents<any[]>(
            contractAddress,
            abi,
            fromBlock,
            toBlock,
            eventName,
            args
        );

        result = result.filter(e => e.removed == false);

        return result.map(e => {
            e = this.normalizeAddresses(e);
            e.args = this.normalizeAddresses(e.args);
            return new Event(
                e.eventName,
                e.address,
                e.blockNumber,
                e.transactionHash,
                e.args,
                e.blockTimestamp ? BigInt(e.blockTimestamp) : BigInt(0)
            );
        })
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
        appender.appendVarchar(dbRecord.contract_address);
        appender.appendVarchar(dbRecord.block_number);
        appender.appendVarchar(dbRecord.transaction_hash);
        appender.appendVarchar(dbRecord.event_args);
    }
}