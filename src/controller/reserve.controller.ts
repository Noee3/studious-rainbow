import { Address } from "viem";
import { BaseController } from "./base.controller";
import { AssetController } from "./asset.controller";
import { Asset } from "../models/asset.model";
import { DuckDBConnection } from '@duckdb/node-api'; import { Reserve, ReserveDB } from "../models/reserve.model";
import { aave_uiPoolDataProviderAbi } from "../typechain/aave.abi";


export class ReserveController extends BaseController {

    private tableName: string = 'reserves';

    constructor(_connection: DuckDBConnection) {
        super();
        this.connection = _connection;
    }

    async init(assetController: AssetController): Promise<{ reserves: Reserve[], assets: Asset[] }> {
        try {
            console.info("[ReserveController] :: initialisation");
            let reservesData = await this.fetchReservesDB();
            let assetsData: Asset[] = [];
            if (reservesData.length === 0) {
                reservesData = await this.fetchReservesData();
                assetsData = await assetController.init(reservesData);
                await this.insertReservesDB(reservesData);

                //not necessary just to confirm data conformity
                reservesData = await this.fetchReservesDB();
            }

            return { reserves: reservesData, assets: assetsData };

        } catch (e) {
            console.error("[ReserveController][init] :: Error initialising reserves data:", e);
            throw e;
        }
    }

    async fetchReservesData(): Promise<Reserve[]> {
        try {
            const result: unknown | [] = await this.client.readContract({
                blockNumber: this.blockNumber as bigint,
                address: this.base_uiPoolDataProvider,
                abi: aave_uiPoolDataProviderAbi,
                functionName: 'getReservesData',
                args: [this.base_addressProvider],
            });

            if (result && Array.isArray(result)) {
                return result[0].map((e: any) => new Reserve(
                    e.underlyingAsset as Address,
                    e.name,
                    e.symbol,
                    BigInt(e.decimals),
                    e.reserveLiquidationThreshold,
                    e.liquidityIndex,
                    e.variableBorrowIndex,
                    e.baseLTVasCollateral,
                    e.reserveLiquidationBonus,
                    e.reserveFactor,
                    e.isActive,
                    e.isFrozen,
                ));
            }

            throw new Error("No user reserves data found ");

        } catch (error) {
            console.error("[ReserveController][fetchReservesData] :: Error fetching reserves data:", error);
            throw error;
        }
    }

    async insertReservesDB(reserves: Reserve[]) {
        try {
            const appender = await this.connection!.createAppender(this.tableName);

            for (const reserve of reserves) {
                const reserveDB = reserve.toDB();
                appender.appendVarchar(reserveDB.asset_address);
                appender.appendVarchar(reserveDB.name);
                appender.appendVarchar(reserveDB.symbol);
                appender.appendInteger(reserveDB.decimals);
                appender.appendInteger(reserveDB.liquidation_threshold);
                appender.appendVarchar(reserveDB.liquidity_index);
                appender.appendVarchar(reserveDB.variable_borrow_index);
                appender.appendInteger(reserveDB.ltv);
                appender.appendInteger(reserveDB.liquidation_bonus);
                appender.appendInteger(reserveDB.reserve_factor);
                appender.appendBoolean(reserveDB.is_active);
                appender.appendBoolean(reserveDB.is_frozen);
                appender.appendBigInt(reserveDB.last_updated);
                appender.endRow();
                appender.flushSync();
            }
        } catch (e) {
            console.error('[ReserveController][insertReservesDB] :: Error inserting reserve:', e);
            throw e;
        }
    }

    async fetchReservesDB(): Promise<Reserve[]> {
        try {
            const result = await this.connection!.run(`SELECT * FROM ${this.tableName}`);
            const rows: ReserveDB[] = await result.getRowObjectsJson() as unknown as ReserveDB[];

            const userReserves = rows.map((row: ReserveDB) => new Reserve(
                row.asset_address as Address,
                row.name,
                row.symbol,
                BigInt(row.decimals),
                BigInt(row.liquidation_threshold),
                BigInt(row.liquidity_index),
                BigInt(row.variable_borrow_index),
                BigInt(row.ltv),
                BigInt(row.liquidation_bonus),
                BigInt(row.reserve_factor),
                row.is_active,
                row.is_frozen,
                new Date(Number(row.last_updated))
            ));
            return userReserves;
        } catch (e) {
            console.error('[ReserveController][fetchReservesDB] :: Error fetching reserves:', e);
            throw e;
        }
    }
    // async update//TODO
}