import { Address } from "viem";

export interface UserReserveData {
    userAddress: Address; // PRIMARY
    underlyingAsset: Address;
    scaledATokenBalance: bigint;
    usageAsCollateralEnabledOnUser: boolean;
    scaledVariableDebt: bigint;
}

export interface ReserveDataDB {
    underlying_asset: string
    name: string
    symbol: string
    decimals: bigint
    base_ltv_as_collateral: bigint
    reserve_liquidation_threshold: bigint
    reserve_liquidation_bonus: bigint
    reserve_factor: bigint
    usage_as_collateral_enabled: boolean
    borrowing_enabled: boolean
    is_active: boolean
    is_frozen: boolean
    liquidity_index: bigint
    variable_borrow_index: bigint
    liquidity_rate: bigint
    variable_borrow_rate: bigint
    last_update_timestamp: number
    a_token_address: string
    variable_debt_token_address: string
    interest_rate_strategy_address: string
    available_liquidity: bigint
    total_scaled_variable_debt: bigint
    price_in_market_reference_currency: bigint
    price_oracle: string
}

export interface ReserveData {
    underlyingAsset: string
    name: string
    symbol: string
    decimals: bigint
    baseLTVasCollateral: bigint
    reserveLiquidationThreshold: bigint
    reserveLiquidationBonus: bigint
    reserveFactor: bigint
    usageAsCollateralEnabled: boolean
    borrowingEnabled: boolean
    isActive: boolean
    isFrozen: boolean
    liquidityIndex: bigint
    variableBorrowIndex: bigint
    liquidityRate: bigint
    variableBorrowRate: bigint
    lastUpdateTimestamp: number
    aTokenAddress: string
    variableDebtTokenAddress: string
    interestRateStrategyAddress: string
    availableLiquidity: bigint
    totalScaledVariableDebt: bigint
    priceInMarketReferenceCurrency: bigint
    priceOracle: string
}

export function dbToReserve(dbData: ReserveDataDB): ReserveData {
    return {
        underlyingAsset: dbData.underlying_asset as Address,
        name: dbData.name,
        symbol: dbData.symbol,
        decimals: BigInt(dbData.decimals),
        baseLTVasCollateral: BigInt(dbData.base_ltv_as_collateral),
        reserveLiquidationThreshold: BigInt(dbData.reserve_liquidation_threshold),
        reserveLiquidationBonus: BigInt(dbData.reserve_liquidation_bonus),
        reserveFactor: BigInt(dbData.reserve_factor),
        usageAsCollateralEnabled: Boolean(dbData.usage_as_collateral_enabled),
        borrowingEnabled: Boolean(dbData.borrowing_enabled),
        isActive: Boolean(dbData.is_active),
        isFrozen: Boolean(dbData.is_frozen),
        liquidityIndex: BigInt(dbData.liquidity_index),
        variableBorrowIndex: BigInt(dbData.variable_borrow_index),
        liquidityRate: BigInt(dbData.liquidity_rate),
        variableBorrowRate: BigInt(dbData.variable_borrow_rate),
        lastUpdateTimestamp: Number(dbData.last_update_timestamp),
        aTokenAddress: dbData.a_token_address as Address,
        variableDebtTokenAddress: dbData.variable_debt_token_address as Address,
        interestRateStrategyAddress: dbData.interest_rate_strategy_address as Address,
        availableLiquidity: BigInt(dbData.available_liquidity),
        totalScaledVariableDebt: BigInt(dbData.total_scaled_variable_debt),
        priceInMarketReferenceCurrency: BigInt(dbData.price_in_market_reference_currency),
        priceOracle: dbData.price_oracle as Address,
    }
}
