import { DuckDBService } from "../../../services/duckdb.service";

export abstract class DbRepository {

    constructor(
        protected dbService: DuckDBService
    ) { }


    protected async fetchTable(table: string, where?: string, limit?: number): Promise<any> {
        try {
            let query = `SELECT * FROM ${table}`;

            if (where != undefined) {
                query += ` WHERE ${where}`;
            }

            if (limit) {
                query += ` LIMIT ${limit}`;
            }

        } catch (error) {
            console.error("[DbRepository][fetchTable] %s, %s", table, error);
        }

    }

    protected async bulkInsert<T>(
        table: string,
        data: T[],
        appendFunction: (appender: any, item: T) => void
    ) {
        {
            const appender = await this.dbService.connection!.createAppender(table);

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

    protected async updateTable(table: string, where: string, fields: Record<string, any>): Promise<any> {
        try {
            const setters: string = Object.entries(fields).map(([key, value]) =>
                `${key} = ${value}`).join(', ');

            const query = `UPDATE ${table} SET ${setters} WHERE ${where}`;

            return await this.dbService.connection?.run(query);
        } catch (error) {
            console.error("[DbRepository][update] %s, %s", table, error);
        }
    }
}