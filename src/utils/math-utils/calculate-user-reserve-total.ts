import BigNumber from 'bignumber.js';
import { valueToBigNumber, valueToZDBigNumber } from './bignumber';
// import { any } from '../reserve';
// import { any } from './generate-user-reserve-summary';

// interface UserReserveTotalsRequest {
//     userReserves: any[];
//     userEmodeCategoryId: number;
// }

// interface UserReserveTotalsResponse {
//     totalLiquidityMarketReferenceCurrency;
//     totalBorrowsMarketReferenceCurrency: BigNumber;
//     totalCollateralMarketReferenceCurrency: BigNumber;
//     currentLtv: BigNumber;
//     currentLiquidationThreshold: BigNumber;
//     isInIsolationMode: boolean;
//     isolatedReserve?: any;
// }

export function calculateUserReserveTotals(
    userReserves: any[],
    userEmodeCategoryId: number | undefined,
) {
    let totalLiquidityMarketReferenceCurrency = valueToZDBigNumber('0');
    let totalCollateralMarketReferenceCurrency = valueToZDBigNumber('0');
    let totalBorrowsMarketReferenceCurrency = valueToZDBigNumber('0');
    let currentLtv = valueToBigNumber('0');
    let currentLiquidationThreshold = valueToBigNumber('0');
    let isInIsolationMode = false;
    let isolatedReserve: any | undefined;


    userReserves.forEach(userReserveSummary => {
        totalLiquidityMarketReferenceCurrency =
            totalLiquidityMarketReferenceCurrency.plus(
                userReserveSummary.underlyingBalanceMarketReferenceCurrency,
            );
        totalBorrowsMarketReferenceCurrency =
            totalBorrowsMarketReferenceCurrency.plus(
                userReserveSummary.variableBorrowsMarketReferenceCurrency,
            );
        if (
            userReserveSummary.reserve.reserveLiquidationThreshold !==
            '0' &&
            userReserveSummary.usageAsCollateralEnabledOnUser
        ) {
            if (userReserveSummary.reserve.debtCeiling !== '0') {
                isolatedReserve = userReserveSummary.reserve;
                isInIsolationMode = true;
            }

            totalCollateralMarketReferenceCurrency =
                totalCollateralMarketReferenceCurrency.plus(
                    userReserveSummary.underlyingBalanceMarketReferenceCurrency,
                );
            const selectedEModeCategory =
                userReserveSummary.reserve.eModes.find(
                    (elem: { id: number; }) => elem.id === userEmodeCategoryId,
                );
            if (
                userEmodeCategoryId &&
                selectedEModeCategory &&
                selectedEModeCategory.collateralEnabled
            ) {
                currentLtv = currentLtv.plus(
                    valueToBigNumber(
                        userReserveSummary.underlyingBalanceMarketReferenceCurrency,
                    ).multipliedBy(selectedEModeCategory.eMode.ltv),
                );
                currentLiquidationThreshold = currentLiquidationThreshold.plus(
                    valueToBigNumber(
                        userReserveSummary.underlyingBalanceMarketReferenceCurrency,
                    ).multipliedBy(selectedEModeCategory.eMode.liquidationThreshold),
                );
            } else {
                currentLtv = currentLtv.plus(
                    valueToBigNumber(
                        userReserveSummary.underlyingBalanceMarketReferenceCurrency,
                    ).multipliedBy(
                        userReserveSummary.reserve.baseLTVasCollateral,
                    ),
                );
                currentLiquidationThreshold = currentLiquidationThreshold.plus(
                    valueToBigNumber(
                        userReserveSummary.underlyingBalanceMarketReferenceCurrency,
                    ).multipliedBy(
                        userReserveSummary.reserve.reserveLiquidationThreshold,
                    ),
                );
            }
        }
    });

    if (currentLtv.gt(0)) {
        currentLtv = valueToZDBigNumber(
            currentLtv.div(totalCollateralMarketReferenceCurrency),
        );
    }

    if (currentLiquidationThreshold.gt(0)) {
        console.log("HERE", currentLiquidationThreshold);
        currentLiquidationThreshold = valueToZDBigNumber(
            currentLiquidationThreshold.div(totalCollateralMarketReferenceCurrency),
        );
    }

    console.log("HERE", currentLiquidationThreshold);


    return {
        totalLiquidityMarketReferenceCurrency,
        totalBorrowsMarketReferenceCurrency,
        totalCollateralMarketReferenceCurrency,
        currentLtv,
        currentLiquidationThreshold,
        isInIsolationMode,
        isolatedReserve,
    };
}