
import { Constants } from "../utils/constants.utils";

export interface UserAccountDataNormalized {
    totalCollateralBase: string;
    totalDebtBase: string;
    currentLiquidationThreshold: number;
    ltv: number;
    healthFactor: string;
}

export class UserAccountData {
    totalCollateralBase: bigint;
    totalDebtBase: bigint;
    currentLiquidationThreshold: bigint;
    ltv: bigint;
    healthFactor: bigint;

    constructor(totalCollateralBase: bigint, totalDebtBase: bigint, currentLiquidationThreshold: bigint, ltv: bigint, healthFactor: bigint) {
        this.totalCollateralBase = totalCollateralBase;
        this.totalDebtBase = totalDebtBase;
        this.currentLiquidationThreshold = currentLiquidationThreshold;
        this.ltv = ltv;
        this.healthFactor = healthFactor;
    }

    normalize(): UserAccountDataNormalized {
        const userAccountDataNormalized: UserAccountDataNormalized = {
            totalCollateralBase: (Number(this.totalCollateralBase) / Number(Constants.PRICE_FEED)).toFixed(4),
            totalDebtBase: (Number(this.totalDebtBase) / Number(Constants.PRICE_FEED)).toFixed(4),
            currentLiquidationThreshold: Number(this.currentLiquidationThreshold),
            ltv: Number(this.ltv),
            healthFactor: (Number(this.healthFactor) / Number(Constants.WAD)).toFixed(4),
        } as UserAccountDataNormalized;

        return userAccountDataNormalized;
    }
}