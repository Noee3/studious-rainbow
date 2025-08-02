import { DuckDBService } from "../../services/duckdb.service";
import { ViemService } from "../../services/viem.service";
import { DbRepository } from "./db.repository";

export abstract class BaseRepository<TModel, TDB> extends DbRepository {

    constructor(
        protected dbService: DuckDBService,
        protected viemService: ViemService,
        protected table: string,
    ) {
        super(dbService);
    }

    protected abstract fromDB(dbRecord: TDB): TModel;
    protected abstract toDB(model: TModel): TDB;
    protected abstract appendItem(appender: any, dbRecord: TDB): void;


    async fetchAll(where?: string, limit?: number): Promise<TModel[]> {
        const data: TDB[] = await this.fetchTable(this.table, where, limit);
        return data.map(item => this.fromDB(item));
    }

    async insertMany(items: TModel[]): Promise<void> {
        return await this.bulkInsert<TModel>(
            this.table,
            items,
            (appender, item) => {
                this.appendItem(appender, this.toDB(item));
            }
        );
    }

    async update(where: string, fields: Record<string, any>): Promise<any> {
        return await this.updateTable(this.table, where, fields);
    }
}