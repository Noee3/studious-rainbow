import { Address } from "viem";
import { queryAaveUsers } from "../typechain/queries/query";
import { BaseController } from "./base.controller";
import { DuckDBConnection } from '@duckdb/node-api';
import { User, UserDB } from "../models/user.model";

export class UserController extends BaseController {

    private tableName: string = 'users';


    constructor(_connection: DuckDBConnection) {
        super();
        this.connection = _connection;
    }

    async fetchUserData(first: number, skip: number): Promise<User[]> {
        try {
            const { request } = await import('graphql-request');
            const data: any = await request(this.base_subEndpoint, queryAaveUsers(Number(this.blockNumber), first, skip), {}, this.headers) as any;
            const users = data.users.map((e: any) => {
                return new User(
                    e.id as Address,
                    Number(e.eModeCategoryId?.id),
                );
            });
            return users;
        } catch (error) {
            console.error("[AaveController][fetchUser] :: Error fetching user data:", error);
            throw error;
        }
    }

    async insertUsersDB(users: User[]) {
        try {
            const appender = await this.connection!.createAppender(this.tableName);

            for (const user of users) {
                const userDB = user.toDB();
                appender.appendVarchar(userDB.address);
                userDB.emode_category_id ? appender.appendInteger(userDB.emode_category_id) : appender.appendNull();
                appender.appendBigInt(userDB.created_at);
                appender.appendBigInt(userDB.last_updated);
                appender.endRow();
                appender.flushSync();
            }
        } catch (e) {
            console.error('[UserController][insertUsersDB] :: Error inserting users:', e);
            throw e;
        }
    }

    async fetchUsersDB(): Promise<User[]> {
        try {
            const result = await this.connection!.run(`SELECT * FROM ${this.tableName}`);
            const rows: UserDB[] = await result.getRowObjectsJson() as unknown as UserDB[];

            const users = rows.map((row: UserDB) => new User(
                row.address as Address,
                row.emode_category_id,
                new Date(Number(row.created_at)),
                new Date(Number(row.last_updated))
            ));

            console.log(users);
            return users;

        } catch (e) {
            console.error('[UserController][fetchUsersDB] :: Error fetching users:', e);
            throw e;
        }
    }
    // async update//TODO
}