import { Address } from "viem";

export interface UserReserveDB {
    user_address: string,
    asset_address: string;
    usage_as_collateral_enabled: boolean;
    scaled_atoken_balance: string;
    scaled_variable_debt: string;
    last_updated: bigint;
}

export class UserReserve {
    userAddress: Address;
    assetAddress: Address;
    usageAsCollateralEnabled: boolean;
    scaledATokenBalance: bigint;
    scaledVariableDebt: bigint;
    lastUpdated: Date;

    constructor(userAddress: Address, assetAddress: Address, usageAsCollateralEnabled: boolean, scaledATokenBalance: bigint, scaledVariableDebt: bigint, lastUpdated?: Date) {
        this.userAddress = userAddress;
        this.assetAddress = assetAddress;
        this.usageAsCollateralEnabled = usageAsCollateralEnabled;
        this.scaledATokenBalance = scaledATokenBalance;
        this.scaledVariableDebt = scaledVariableDebt;
        this.lastUpdated = lastUpdated ?? new Date();
    }

    toDB(): UserReserveDB {
        return {
            user_address: this.userAddress,
            asset_address: this.assetAddress,
            usage_as_collateral_enabled: this.usageAsCollateralEnabled,
            scaled_atoken_balance: this.scaledATokenBalance.toString(),
            scaled_variable_debt: this.scaledVariableDebt.toString(),
            last_updated: BigInt(this.lastUpdated.getTime())
        };
    }

    static fromDB(db: UserReserveDB): UserReserve {
        return new UserReserve(
            db.user_address as Address,
            db.asset_address as Address,
            db.usage_as_collateral_enabled,
            BigInt(db.scaled_atoken_balance),
            BigInt(db.scaled_variable_debt),
            new Date(Number(db.last_updated))
        );
    }
}