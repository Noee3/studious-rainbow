import { Address } from "viem";
import { EmodeCategoryData } from "./eModeCategory.interface";

export class User {
    address: Address; // PRIMARY
    eModeCategory?: EmodeCategoryData;
    healthFactor?: bigint;
    totalCollateralBalanceInBaseCurrency?: bigint;
    totalDebtBalanceInBaseCurrency?: bigint;
    avgLiquidationThreshold?: bigint;
    avgLTV?: bigint;

    constructor(
        address: Address,
        eModeCategory?: EmodeCategoryData,
        healthFactor?: bigint,
        totalCollateralBalanceInBaseCurrency?: bigint,
        totalDebtBalanceInBaseCurrency?: bigint,
        avgLiquidationThreshold?: bigint,
        avgLTV?: bigint
    ) {
        this.address = address;
        this.eModeCategory = eModeCategory;
        this.healthFactor = healthFactor;
        this.totalCollateralBalanceInBaseCurrency = totalCollateralBalanceInBaseCurrency;
        this.totalDebtBalanceInBaseCurrency = totalDebtBalanceInBaseCurrency;
        this.avgLiquidationThreshold = avgLiquidationThreshold;
        this.avgLTV = avgLTV;
    }
}