import { Address } from "viem";

export interface EmodeCategoryData {
    ltv: bigint;
    liquidationThreshold: bigint;
    liquidationBonus: bigint;
    priceSource: Address;
    label: string;
    bitmap: bigint;
}