import { Address } from "viem";

export interface EventNewDB {
    event_name: string;
    contract_address: string;
    block_number: string;
    transaction_hash: string;
    event_args: string;
}

export class EventNew {
    eventName: string;
    contractAddress: Address;
    blockNumber: bigint;
    transactionHash: string;
    eventArgs: Record<string, any>;

    constructor(eventName: string, contractAddress: Address, blockNumber: bigint, transactionHash: string, eventArgs: Record<string, any>) {
        this.eventName = eventName;
        this.contractAddress = contractAddress;
        this.blockNumber = blockNumber;
        this.transactionHash = transactionHash;
        this.eventArgs = eventArgs;
    }

    toDB(): EventNewDB {
        this.eventArgs = Object.fromEntries(
            Object.entries(this.eventArgs).map(([key, value]) => [
                key,
                typeof value === 'bigint' ? value.toString() : value
            ])
        );

        return {
            event_name: this.eventName,
            contract_address: this.contractAddress,
            block_number: this.blockNumber.toString(),
            transaction_hash: this.transactionHash,
            event_args: JSON.stringify(this.eventArgs)
        };
    }

    static fromDB(eventNewDB: EventNewDB): EventNew {
        return new EventNew(
            eventNewDB.event_name,
            eventNewDB.contract_address as Address,
            BigInt(eventNewDB.block_number),
            eventNewDB.transaction_hash,
            JSON.parse(eventNewDB.event_args)
        );
    }
}