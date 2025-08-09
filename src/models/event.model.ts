import { Address } from "viem";

export interface EventDB {
    event_name: string;
    contract_address: string;
    block_number: bigint;
    transaction_hash: string;
    event_args: string;
    block_timestamp: bigint;
}

export class Event {
    eventName: string;
    contractAddress: Address;
    blockNumber: bigint;
    transactionHash: string;
    eventArgs: Record<string, any>;
    blockTimestamp: bigint;

    constructor(eventName: string, contractAddress: Address, blockNumber: bigint, transactionHash: string, eventArgs: Record<string, any>, timestamp: bigint) {
        this.eventName = eventName;
        this.contractAddress = contractAddress;
        this.blockNumber = blockNumber;
        this.transactionHash = transactionHash;
        this.eventArgs = eventArgs;
        this.blockTimestamp = timestamp;
    }

    toDB(): EventDB {
        this.eventArgs = Object.fromEntries(
            Object.entries(this.eventArgs).map(([key, value]) => [
                key,
                typeof value === 'bigint' ? value.toString() : value
            ])
        );

        return {
            event_name: this.eventName,
            contract_address: this.contractAddress,
            block_number: this.blockNumber,
            transaction_hash: this.transactionHash,
            event_args: JSON.stringify(this.eventArgs),
            block_timestamp: this.blockTimestamp
        };
    }

    static fromDB(EventDB: EventDB): Event {
        return new Event(
            EventDB.event_name,
            EventDB.contract_address as Address,
            BigInt(EventDB.block_number),
            EventDB.transaction_hash,
            JSON.parse(EventDB.event_args),
            BigInt(EventDB.block_timestamp),
        );
    }
}