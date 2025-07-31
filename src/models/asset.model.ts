import { Address } from "viem";

export interface AssetDB {
    address: string,
    decimals: number,
    name: string,
    symbol: string,
    created_at: bigint,
    last_updated: bigint
}

export class Asset {
    address: Address;
    decimals: bigint;
    name: string;
    symbol: string;
    createdAt: Date;
    lastUpdated: Date;

    constructor(address: Address, decimals: bigint, name: string, symbol: string, createdAt?: Date, lastUpdated?: Date) {
        this.address = address;
        this.decimals = decimals;
        this.name = name;
        this.symbol = symbol;
        this.createdAt = createdAt ?? new Date();
        this.lastUpdated = lastUpdated ?? new Date();
    };

    toDB(): AssetDB {
        return {
            address: this.address,
            decimals: Number(this.decimals),
            name: this.name,
            symbol: this.symbol,
            created_at: BigInt(this.createdAt.getTime()),
            last_updated: BigInt(this.lastUpdated.getTime())
        };
    }
}