import { DuckDBService } from "../../services/duckdb.service";
import { ViemService } from "../../services/viem.service";
import { DbRepository } from "./db.repository";

export abstract class BaseRepository<TModel, TDB> extends DbRepository {

    constructor(
        protected dbService: DuckDBService,
        protected viemService: ViemService,
        protected table: string,
    ) {
        super(dbService, table);
    }

    protected abstract fromDB(dbRecord: TDB): TModel;
    protected abstract toDB(model: TModel): TDB;
    protected abstract appendItem(appender: any, dbRecord: TDB): void;


    async fetchAll(where?: string, limit?: number): Promise<TModel[]> {
        const data: TDB[] = await this.fetchTable(where, limit);

        return data.map(item => this.fromDB(this.normalizeAddresses(item)));
    }


    async insertMany(items: TModel[]): Promise<void> {

        return await this.bulkInsert<TModel>(
            items,
            (appender, item) => {
                const dbItem = this.toDB(item);
                const normalizedItem = this.normalizeAddresses(dbItem);
                this.appendItem(appender, normalizedItem);
            }
        );
    }

    async getTableCount(where?: string): Promise<number> {
        return await this.getCount(where);
    }


    async update(where: string, fields: Record<string, any>): Promise<any> {
        return await this.updateTable(where, fields);
    }

    protected normalizeAddresses(dbObject: any): any {
        const normalized = { ...dbObject } as any;

        Object.keys(normalized).forEach(key => {
            if (typeof normalized[key] === 'string') {
                normalized[key] = normalized[key].toLowerCase();
            }
        });

        return normalized;
    }
}