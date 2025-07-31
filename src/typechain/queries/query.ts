export const queryAaveUsers: any = (blockNumber: number, first: number, skip: number) => {
    return `
    {
        users(block: { number: ${blockNumber}}, first: ${first}, skip: ${skip}, where: {
            borrowedReservesCount_gt: 0}) {
                id
                eModeCategoryId{
                    id
                }
            } 
    }
`;
};


export const queryAaveEmodeCategoriesId: any = () => {
    return `   {
  emodeCategories {
            id
        }
    }
`;
}

export const queryAave: any = (blockNumber: number, first: number, skip: number) => {
    return `{
    users(block: { number: ${blockNumber}}, first: ${first}, skip: ${skip}, where: {
        borrowedReservesCount_gt: 0}) {
            id
            borrowedReservesCount
            eModeCategoryId {
                id
                liquidationThreshold
                ltv
            }
            collateralReserve: reserves (where: {currentATokenBalance_gt: 0}){
                currentATokenBalance
                scaledATokenBalance
                reserve {
                lastUpdateTimestamp
                usageAsCollateralEnabled
                reserveLiquidationThreshold
                reserveLiquidationBonus
                borrowingEnabled
                utilizationRate
                symbol
                underlyingAsset
                baseLTVasCollateral
                price {
                    priceInEth
                }
                eMode {
                id
                ltv
                liquidationThreshold
                liquidationBonus
                label
                }
                decimals
                isActive
                }
            }
            borrowReserve:reserves(where: {currentTotalDebt_gt: 0}){
                currentTotalDebt
                reserve {
                debtCeiling
                lastUpdateTimestamp
                liquidityIndex
                usageAsCollateralEnabled
                reserveLiquidationThreshold
                borrowingEnabled
                utilizationRate
                symbol
                underlyingAsset
                price {
                    priceInEth
                }
                decimals   
                isActive
                }
            }
        } 
    }
`;
};