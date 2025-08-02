import { Address } from "viem";

export interface UserDB {
    address: string,
    emode_category_id?: number;
    created_at: bigint;
    last_updated: bigint;
}

export class User {
    address: Address;
    eModeCategory?: number;
    createdAt: Date;
    lastUpdated: Date;

    constructor(address: Address, eModeCategory?: number, createdAt?: Date, lastUpdated?: Date) {
        this.address = address;
        this.eModeCategory = eModeCategory;
        this.createdAt = createdAt ?? new Date();
        this.lastUpdated = lastUpdated ?? new Date();
    }

    toDB(): UserDB {
        return {
            address: this.address,
            emode_category_id: this.eModeCategory,
            created_at: BigInt(this.createdAt.getTime()),
            last_updated: BigInt(this.lastUpdated.getTime())
        };
    }

}