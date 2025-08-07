import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import { dbConfigs } from '../config/database.config';
import fs from 'fs/promises';
import path from 'path';

export class DuckDBService {
    private config = dbConfigs.development;

    public connection: DuckDBConnection | null = null;
    public tables: string[] = [];

    async connect(): Promise<DuckDBConnection> {
        try {
            const instance = await DuckDBInstance.create(this.config.path);
            this.connection = await DuckDBConnection.create(instance);
            this.tables = ['assets', 'asset_prices', 'emode_categories', 'reserves', 'users', 'user_reserves'];
            console.info('[DuckDBService] Connected to DuckDB instance %s', this.config.name);
            return this.connection;
        } catch (e) {
            console.error('[DuckDBService][connect] ::', e);
            throw e;
        }
    }

    async resetDatabase(): Promise<void> {
        await this.dropTable();
        await this.executeSQLFile();
        console.info('✅ Database reset successfully');
    }

    async dropTable(): Promise<void> {
        const dropOrder = [...this.tables].reverse();

        for (const table of dropOrder) {
            try {
                await this.connection!.run(`DROP TABLE IF EXISTS ${table}`);
            } catch (error) {
                console.error(`[DuckDBService][dropTable] :: Failed to drop ${table}:`, error);
                throw error;
            }
        }
    }

    async clearTable(): Promise<void> {
        let inverseTables = [...this.tables].reverse();
        for (const table of inverseTables) {
            await this.connection!.run(`DELETE FROM ${table}`);
        }
        console.log(`[DuckDBService] ✅ Cleared tables: ${inverseTables.join(', ')}`);
    }

    async executeSQLFile(): Promise<void> {
        try {

            const filePath = path.join(__dirname, '../data/schema.sql');
            const sqlContent = await fs.readFile(filePath, 'utf-8');

            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            for (const statement of statements) {
                if (statement) {
                    await this.connection!.run(statement);
                }
            }
            console.info(`[DuckDBService] 📂 SQL file executed successfully: ${filePath}`);

        } catch (error) {
            console.error(`[DuckDBService][executeSQLFile] ::`, error);
            throw error;
        }
    }

}