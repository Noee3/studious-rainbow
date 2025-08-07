import { EventNew, EventNewDB } from "../models/event.new.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { uiPoolDataProviderAbi } from "../typechain/abis/aaveUiPoolDataProvider.abi";
import { Address } from "viem";
import { SubgraphService } from "../services/subgraph.service";


export class EventNewRepository extends BaseRepository<EventNew, EventNewDB> {

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


    public async fetchContractEventsData(contractAddress: Address, abi: any, blockToAdd: bigint, eventName?: string, args?: {}): Promise<EventNew[]> {
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
            return new EventNew(
                e.eventName,
                e.address,
                e.blockNumber,
                e.transactionHash,
                e.args
            );
        })
    }


    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    protected fromDB(dbRecord: EventNewDB): EventNew {
        return EventNew.fromDB(dbRecord);
    }

    protected toDB(model: EventNew): EventNewDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: EventNewDB): void {
        appender.appendVarchar(dbRecord.event_name);
        appender.appendVarchar(dbRecord.contract_address);
        appender.appendVarchar(dbRecord.block_number);
        appender.appendVarchar(dbRecord.transaction_hash);
        appender.appendVarchar(dbRecord.event_args);
    }
}