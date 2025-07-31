export interface UserAccountData {
    totalCollateralBase: bigint; // PRIMARY
    totalDebtBase: bigint;
    availableBorrowsBase: bigint;
    currentLiquidationThreshold: bigint;
    ltv: bigint;
    healthFactor: bigint;
}

export function convertUserAccountData(result: any[]) {

    return {
        totalCollateralBase: BigInt(result[0]),
        totalDebtBase: BigInt(result[1]),
        availableBorrowsBase: BigInt(result[2]),
        currentLiquidationThreshold: BigInt(result[3]),
        ltv: BigInt(result[4]),
        healthFactor: BigInt(result[5])
    } as UserAccountData;
}
