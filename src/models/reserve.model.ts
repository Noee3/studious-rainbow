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

    constructor(assetAddress: Address, name: string, symbol: string, decimals: bigint, liquidationThreshold: bigint, liquidityIndex: bigint, variableBorrowIndex: bigint, ltv: bigint, liquidationBonus: bigint, reserveFactor: bigint, isActive: boolean, isFrozen: boolean, lastUpdated?: Date) {
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
        this.lastUpdated = lastUpdated ?? new Date();
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
            last_updated: BigInt(this.lastUpdated.getTime())
        };
    }
}