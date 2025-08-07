import { DuckDBService } from "../../services/duckdb.service";

export abstract class DbRepository {

    constructor(
        protected dbService: DuckDBService,
        protected table: string
    ) { }


    protected async fetchTable(where?: string, limit?: number): Promise<any> {
        try {
            let query = `SELECT * FROM ${this.table}`;

            if (where != undefined) {
                query += ` WHERE ${where}`;
            }

            if (limit != undefined) {
                query += ` LIMIT ${limit}`;
            }

            const result = await this.dbService.connection!.run(query);
            const rows: [] = await result.getRowObjectsJson() as unknown as [];

            return rows;

        } catch (error) {
            console.error("[DbRepository][fetchTable] %s, %s", this.table, error);
            throw error;
        }
    }

    protected async getCount(where?: string): Promise<number> {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.table}`;

            if (where != undefined) {
                query += ` WHERE ${where}`;
            }

            const result = await this.dbService.connection!.run(query);
            const count = await result.getRowObjectsJson();

            return Number(count[0].count);
        } catch (error) {
            console.error("[DbRepository][getCount] %s, %s", this.table, error);
            throw error;
        }
    }

    protected async bulkInsert<T>(
        data: T[],
        appendFunction: (appender: any, item: T) => void
    ) {
        {
            const appender = await this.dbService.connection!.createAppender(this.table);

            try {
                for (const item of data) {
                    appendFunction(appender, item);
                    appender.endRow();
                }

            } finally {
                appender.flushSync();
            }
        }
    }

    protected async updateTable(where: string, fields: Record<string, any>): Promise<any> {
        try {
            const setters: string = Object.entries(fields).map(([key, value]) =>
                `${key} = ${value}`).join(', ');

            const query = `UPDATE ${this.table} SET ${setters} WHERE ${where}`;

            return await this.dbService.connection?.run(query);
        } catch (error) {
            console.error("[DbRepository][update] %s, %s", this.table, error);
            throw error;
        }
    }
}