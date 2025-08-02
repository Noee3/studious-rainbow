import { Address } from "viem";
import { BaseController } from "./base.controller";
import { DuckDBConnection } from '@duckdb/node-api';
import { AssetPrice, AssetPriceDB } from '../models/assetPrice.model';
import { aave_oracleAbi } from "../typechain/aave.abi";
import { Asset } from "../models/asset.model";


export class AssetPriceController extends BaseController {

    private tableName: string = 'asset_prices';


    constructor(_connection: DuckDBConnection) {
        super();
        this.connection = _connection;
    }

    async init(assets: Asset[]): Promise<AssetPrice[]> {
        try {
            console.info("[AssetPriceController] :: initialisation");
            let assetsPrices = await this.fetchAssetsPricesDB();
            if (assetsPrices.length === 0) {
                console.info("[AssetPriceController] :: fetchAssetsPricesData 🌐");
                assetsPrices = await this.fetchAssetsPricesData(assets.map(asset => asset.address));
                await this.insertAssetsPricesDB(assetsPrices);

                //not necessary just to confirm data conformity
                assetsPrices = await this.fetchAssetsPricesDB();
            } else {
                console.info("[AssetPriceController] :: fetchAssetsPricesDB 💾");
            }
            return assetsPrices;
        } catch (e) {
            console.error("[AssetPriceController][init] :: Error initialising asset prices data:", e);
            throw e;
        }
    }

    async fetAssetPriceData(assetAddress: Address): Promise<AssetPrice> {
        try {
            const price = await this.client.readContract({
                blockNumber: this.blockNumber as bigint,
                address: this.base_aaveOracle,
                abi: aave_oracleAbi,
                functionName: 'getAssetPrice',
                args: [assetAddress],
            }) as bigint;

            return new AssetPrice(
                assetAddress,
                price,
            );

        } catch (e) {
            console.error('[AssetPriceController][fetAssetPriceData] :: Error fetching asset price:', e);
            throw e;
        }
    }


    async fetchAssetsPricesData(assetsAddress: Address[]): Promise<AssetPrice[]> {
        try {
            const result = await this.client.readContract({
                blockNumber: this.blockNumber as bigint,
                address: this.base_aaveOracle,
                abi: aave_oracleAbi,
                functionName: 'getAssetsPrices',
                args: [assetsAddress],
            }) as bigint[];

            return result.map((price, index) => new AssetPrice(
                assetsAddress[index],
                price,
            ));
        } catch (e) {
            console.error('[AssetPriceController][fetchAssetsPricesData] :: Error fetching assets prices:', e);
            throw e;
        }
    }


    async insertAssetsPricesDB(assetsPrices: AssetPrice[]) {
        try {
            const appender = await this.connection!.createAppender(this.tableName);

            for (const price of assetsPrices) {
                const priceDB = price.toDB();
                appender.appendVarchar(priceDB.asset_address);
                appender.appendVarchar(priceDB.price_base_currency);
                appender.appendBigInt(priceDB.timestamp);
                appender.endRow();
                appender.flushSync();
            }

        } catch (e) {
            console.error('[AssetPriceController][insertAssetsPricesDB] :: Error inserting asset prices:', e);
            throw e;
        }
    }

    async fetchAssetsPricesDB(): Promise<AssetPrice[]> {
        try {
            const result = await this.connection!.run(`SELECT * FROM ${this.tableName}`);
            const rows: AssetPriceDB[] = await result.getRowObjectsJson() as unknown as AssetPriceDB[];
            return rows.map((row: AssetPriceDB) => new AssetPrice(
                row.asset_address as Address,
                BigInt(row.price_base_currency),
                new Date(Number(row.timestamp)),
            ));
        } catch (e) {
            console.error('[AssetPrice][fetchAssetsPricesDB] :: Error fetching assets prices:', e);
            throw e;
        }
    }


    // async update//TODO
    // watch assetPrice;
}