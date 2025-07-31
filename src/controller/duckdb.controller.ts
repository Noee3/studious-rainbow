import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import fs from 'fs/promises';
import path from 'path';

export class DuckDBController {
    public connection: DuckDBConnection | null = null;
    public tables: string[] = [];

    async connect(dbName: string): Promise<DuckDBConnection> {
        try {
            const instance = await DuckDBInstance.create(`./database/${dbName}.db`);
            this.connection = await DuckDBConnection.create(instance);
            this.tables = ['assets', 'asset_prices', 'emode_categories', 'reserves', 'users', 'user_reserves'];
            console.info(' 📀 [DB] Connected to DuckDB instance %s', dbName);
            return this.connection;
        } catch (e) {
            console.error('[DB][connect] :: Error connecting to DuckDB:', e);
            throw e;
        }
    }

    async resetDatabase(): Promise<void> {
        await this.dropTable();
        await this.executeSQLFile();
        console.log('✅ Database reset successfully');
    }

    async dropTable(): Promise<void> {
        const dropOrder = [...this.tables].reverse();

        for (const table of dropOrder) {
            try {
                await this.connection!.run(`DROP TABLE IF EXISTS ${table}`);
            } catch (error) {
                console.error(`❌ Failed to drop ${table}:`, error);
            }
        }
        console.log(`✅ Dropped tables: ${dropOrder.join(', ')}`);
    }

    async clearTable(): Promise<void> {
        let inverseTables = [...this.tables].reverse();
        for (const table of inverseTables) {
            await this.connection!.run(`DELETE FROM ${table}`);
        }
        console.log(`✅ Cleared tables: ${inverseTables.join(', ')}`);

    }

    async executeSQLFile(): Promise<void> {
        try {

            const filePath = path.join(__dirname, '../../src/database/schema.sql');
            const sqlContent = await fs.readFile(filePath, 'utf-8');

            console.log(sqlContent);
            console.log(`📂 Executing SQL file: ${filePath}`);

            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            for (const statement of statements) {
                if (statement) {
                    await this.connection!.run(statement);
                }
            }
            console.log('✅ Executed statement');

            console.log(`✅ SQL file executed successfully: ${filePath}`);

        } catch (error) {
            console.error(`❌ Error executing SQL file `, error);
            throw error;
        }
    }

}