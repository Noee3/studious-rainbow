import { Address } from "viem";



export interface EventDB {
    event_name: string;
    reserve: string;
    liquidity_rate: string;
    variable_borrow_rate: string;
    liquidity_index: string;
    variable_borrow_index: string;
    interestRateMode: number;
    borrowRate: string;
    onBehalfOf: string;
    user: string;
    repayer: string;
    to: string;
    amount: string,
    use_aToken: boolean;
    contract_address: string;
    block_number: string;
    transaction_hash: string;
}

export class Event {
    eventName: string;
    reserve: Address;
    liquidityRate: bigint;
    variableBorrowRate: bigint;
    liquidityIndex: bigint;
    variableBorrowIndex: bigint;
    interestRateMode: number;
    borrowRate: string;
    onBehalfOf: Address;
    user: Address;
    repayer: Address;
    to: Address;
    amount: bigint;
    useAToken: boolean;
    contractAddress: Address;
    blockNumber: bigint;
    transactionHash: string;

    constructor(eventName: string, reserve: Address, liquidityRate: bigint, variableBorrowRate: bigint, liquidityIndex: bigint, variableBorrowIndex: bigint, interestRateMode: number, borrowRate: string, onBehalfOf: Address, user: Address, repayer: Address, to: Address, amount: bigint, useAToken: boolean, contractAddress: Address, blockNumber: bigint, transactionHash: string) {
        this.eventName = eventName;
        this.reserve = reserve;
        this.liquidityRate = liquidityRate;
        this.variableBorrowRate = variableBorrowRate;
        this.liquidityIndex = liquidityIndex;
        this.variableBorrowIndex = variableBorrowIndex;
        this.interestRateMode = interestRateMode;
        this.borrowRate = borrowRate;
        this.onBehalfOf = onBehalfOf;
        this.user = user;
        this.repayer = repayer;
        this.to = to;
        this.amount = amount;
        this.useAToken = useAToken;
        this.contractAddress = contractAddress;
        this.blockNumber = blockNumber;
        this.transactionHash = transactionHash;
    }

    toDB(): EventDB {
        return {
            event_name: this.eventName,
            reserve: this.reserve,
            liquidity_rate: this.liquidityRate.toString(),
            variable_borrow_rate: this.variableBorrowRate.toString(),
            liquidity_index: this.liquidityIndex.toString(),
            variable_borrow_index: this.variableBorrowIndex.toString(),
            interestRateMode: this.interestRateMode,
            borrowRate: this.borrowRate,
            onBehalfOf: this.onBehalfOf,
            user: this.user,
            repayer: this.repayer,
            to: this.to,
            amount: this.amount.toString(),
            use_aToken: this.useAToken,
            contract_address: this.contractAddress,
            block_number: this.blockNumber.toString(),
            transaction_hash: this.transactionHash
        };
    }

    static fromDB(eventDB: EventDB): Event {
        return new Event(
            eventDB.event_name,
            eventDB.reserve as Address,
            BigInt(eventDB.liquidity_rate),
            BigInt(eventDB.variable_borrow_rate),
            BigInt(eventDB.liquidity_index),
            BigInt(eventDB.variable_borrow_index),
            eventDB.interestRateMode,
            eventDB.borrowRate,
            eventDB.onBehalfOf as Address,
            eventDB.user as Address,
            eventDB.repayer as Address,
            eventDB.to as Address,
            BigInt(eventDB.amount),
            eventDB.use_aToken,
            eventDB.contract_address as Address,
            BigInt(eventDB.block_number),
            eventDB.transaction_hash,
        );
    }

}