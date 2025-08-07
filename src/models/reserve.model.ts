import { Address } from "viem";

export interface ReserveDB {
    asset_address: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidation_threshold: number;
    liquidity_index: string;
    variable_borrow_index: string;
    ltv: number;
    liquidation_bonus: number;
    reserve_factor: number;
    is_active: boolean;
    is_frozen: boolean;
    last_updated: bigint;
}

export class Reserve {
    assetAddress: Address;
    name: string;
    symbol: string;
    decimals: bigint;
    liquidationThreshold: bigint;
    liquidityIndex: bigint;
    variableBorrowIndex: bigint;
    ltv: bigint;
    liquidationBonus: bigint;
    reserveFactor: bigint;
    isActive: boolean;
    isFrozen: boolean;
    lastUpdated: Date;

    constructor(assetAddress: Address, name: string, symbol: string, decimals: bigint, liquidationThreshold: bigint, liquidityIndex: bigint, variableBorrowIndex: bigint, ltv: bigint, liquidationBonus: bigint, reserveFactor: bigint, isActive: boolean, isFrozen: boolean, lastUpdated: Date) {
        this.assetAddress = assetAddress;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.liquidationThreshold = liquidationThreshold;
        this.liquidityIndex = liquidityIndex;
        this.variableBorrowIndex = variableBorrowIndex;
        this.ltv = ltv;
        this.liquidationBonus = liquidationBonus;
        this.reserveFactor = reserveFactor;
        this.isActive = isActive;
        this.isFrozen = isFrozen;
        this.lastUpdated = lastUpdated;
    }

    toDB(): ReserveDB {
        return {
            asset_address: this.assetAddress,
            name: this.name,
            symbol: this.symbol,
            decimals: Number(this.decimals),
            liquidation_threshold: Number(this.liquidationThreshold),
            liquidity_index: this.liquidityIndex.toString(),
            variable_borrow_index: this.variableBorrowIndex.toString(),
            ltv: Number(this.ltv),
            liquidation_bonus: Number(this.liquidationBonus),
            reserve_factor: Number(this.reserveFactor),
            is_active: this.isActive,
            is_frozen: this.isFrozen,
            last_updated: BigInt(this.lastUpdated?.getTime())
        };
    }

    static fromDB(reserveDB: ReserveDB): Reserve {
        return new Reserve(
            reserveDB.asset_address as Address,
            reserveDB.name,
            reserveDB.symbol,
            BigInt(reserveDB.decimals),
            BigInt(reserveDB.liquidation_threshold),
            BigInt(reserveDB.liquidity_index),
            BigInt(reserveDB.variable_borrow_index),
            BigInt(reserveDB.ltv),
            BigInt(reserveDB.liquidation_bonus),
            BigInt(reserveDB.reserve_factor),
            reserveDB.is_active,
            reserveDB.is_frozen,
            new Date(Number(reserveDB.last_updated))
        );
    }
}