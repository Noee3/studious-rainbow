import { Address } from "viem";

export interface AssetPriceDB {
    asset_address: string,
    price_base_currency: string,
    timestamp: bigint,
}

export class AssetPrice {
    assetAddress: Address;
    priceBaseCurrency: bigint;
    timestamp: Date;

    constructor(assetAddress: Address, priceBaseCurrency: bigint, timestamp?: Date) {
        this.assetAddress = assetAddress;
        this.priceBaseCurrency = priceBaseCurrency;
        this.timestamp = timestamp ?? new Date();
    };


    toDB(): AssetPriceDB {
        return {
            asset_address: this.assetAddress,
            price_base_currency: this.priceBaseCurrency.toString(),
            timestamp: BigInt(this.timestamp.getTime())
        };
    }

    static fromDB(assetPriceDB: AssetPriceDB): AssetPrice {
        return new AssetPrice(
            assetPriceDB.asset_address as Address,
            BigInt(assetPriceDB.price_base_currency),
            new Date(Number(assetPriceDB.timestamp))
        );
    }
};

