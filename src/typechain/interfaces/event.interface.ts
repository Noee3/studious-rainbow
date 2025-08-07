import { Address } from "viem";


export enum EventNames {
    ReserveDataUpdated = "reservedataupdated",
    Borrow = "borrow",
    Supply = "supply",
    Withdraw = "withdraw",
    Repay = "repay",
    LiquidationCall = "liquidationcall",
    MintedToTreasury = "mintedtotreasury",
    UserEModeSet = "useremodeSet",
}

// FULL
// export enum EventNames {
//     ReserveDataUpdated = "ReserveDataUpdated",
//     Supply = "Supply",
//     Withdraw = "Withdraw",
//     Borrow = "Borrow",
//     Repay = "Repay",
//     LiquidationCall = "LiquidationCall",
//     PositionManagerRevoked = "PositionManagerRevoked",
//     PositionManagerApproved = "PositionManagerApproved",
//     MintedToTreasury = "MintedToTreasury",
//     IsolationModeTotalDebtUpdated = "IsolationModeTotalDebtUpdated",
//     DeficitCreated = "DeficitCreated",
//     DeficitCovered = "DeficitCovered",
//     UserEModeSet = "UserEModeSet",
//     ReserveUsedAsCollateralEnabled = "ReserveUsedAsCollateralEnabled",
//     ReserveUsedAsCollateralDisabled = "ReserveUsedAsCollateralDisabled",
// }

export interface Event {
    eventName: string;
    args: any;
    address: Address;
    topics: string[],
    data: string,
    blockHash: string,
    blockNumber: bigint,
    blockTimestamp: string,
    transactionHash: string,
    transactionIndex: number,
    logIndex: number,
    removed: boolean
}