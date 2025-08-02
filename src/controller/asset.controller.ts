import { Address } from "viem";
import { BaseController } from "./base.controller";
import { DuckDBConnection } from '@duckdb/node-api';
import { Asset, AssetDB } from '../models/asset.model';
import { Reserve } from "../models/reserve.model";

export class AssetController extends BaseController {

    private tableName: string = 'assets';


    constructor(_connection: DuckDBConnection) {
        super();
        this.connection = _connection;
    }

    async init(reserves: Reserve[]): Promise<Asset[]> {
        try {
            console.info("[AssetController] :: initialisation");
            let assets = await this.fetchAssetsDB();
            if (assets.length === 0) {
                console.info("[AssetController] :: fetchAssetsData 🌐");
                for (const reserve of reserves) {
                    assets.push(new Asset(
                        reserve.assetAddress as Address,
                        reserve.decimals,
                        reserve.name,
                        reserve.symbol
                    ));
                }
                await this.insertAssetsDB(assets);

                // not necessary just to confirm data conformity
                assets = await this.fetchAssetsDB();
            } else {
                console.info("[AssetController] :: fetchAssetsDB 💾");
            }

            return assets;
        } catch (e) {
            console.error("[AssetController][init] :: Error initialising assets data:", e);
            throw e;
        }
    }


    async insertAssetsDB(assets: Asset[]) {
        try {
            const appender = await this.connection!.createAppender(this.tableName);

            for (const asset of assets) {
                const assetDB = asset.toDB();
                appender.appendVarchar(assetDB.address);
                appender.appendInteger(assetDB.decimals);
                appender.appendVarchar(assetDB.name);
                appender.appendVarchar(assetDB.symbol);
                appender.appendBigInt(assetDB.created_at);
                appender.appendBigInt(assetDB.last_updated);
                appender.endRow();
                appender.flushSync();
            }
        } catch (e) {
            console.error('[AssetController][insertAssetsDB] :: Error inserting assets:', e);
            throw e;
        }
    }

    async fetchAssetsDB(): Promise<Asset[]> {
        try {
            const result = await this.connection!.run(`SELECT * FROM ${this.tableName}`);
            const rows: AssetDB[] = await result.getRowObjectsJson() as unknown as AssetDB[];
            return rows.map((row: AssetDB) => new Asset(
                row.address as Address,
                BigInt(row.decimals),
                row.name,
                row.symbol,
                new Date(Number(row.created_at)),
                new Date(Number(row.last_updated))
            ));
        } catch (e) {
            console.error('[AssetController][fetchAssetsDB] :: Error fetching assets:', e);
            throw e;
        }
    }

    // async update//TODO
    // watch assetPrice;
}