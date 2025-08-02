import { Address } from "viem";
import { queryAaveUsers } from "../typechain/queries/query";
import { aave_poolAbi } from "../typechain/aave.abi";
import { BaseController } from "./base.controller";
import { DuckDBConnection } from '@duckdb/node-api';
import { User, UserDB } from "../models/user.model";
import { UserAccountData } from "../models/userAccountData.model";

export class UserController extends BaseController {

    private tableName: string = 'users';
    private limitByCall: number = 1000; // Max number of users in one call


    constructor(_connection: DuckDBConnection) {
        super();
        this.connection = _connection;
    }

    async init(max: number): Promise<User[]> {
        try {
            console.info("[UserController] :: initialisation");
            let users = await this.fetchUsersDB(max);
            if (users.length == 0) {
                console.info("[UserController] :: fetchUsersData 🌐");
                users = await this.fetchUsersData(max);

                //not necessary just to confirm data conformity
                users = await this.fetchUsersDB();
            } else {
                console.info("[UserController] :: fetchUsersDB 💾");
            }
            return users;
        } catch (e) {
            console.error("[UserController][init] :: Error initialising users data:", e);
            throw e;
        }
    }

    async fetchUsersData(max: number): Promise<User[]> {
        try {
            const { request } = await import('graphql-request');

            let users: User[] = [];

            if (max > this.limitByCall) {
                const maxCalls = Math.ceil(max / this.limitByCall);
                let count: number = 1;

                while (count < maxCalls) {
                    console.log(`Fetching users: call ${count} of ${maxCalls}`);
                    const data: any = await request(this.base_subEndpoint, queryAaveUsers(Number(this.blockNumber), this.limitByCall, (this.limitByCall * count)), {}, this.headers) as any;
                    const _users = data.users.map((e: any) => {
                        return new User(
                            e.id as Address,
                            Number(e.eModeCategoryId?.id),
                        );
                    });

                    count++;

                    users.push(..._users);
                    await this.insertUsersDB(_users);


                    if (data.users.length < this.limitByCall) {
                        console.log('No more users found, stopping pagination');
                        break;
                    }

                    await new Promise(resolve => setTimeout(resolve, 10_000)); // Delay to avoid rate limiting 10 sec
                }
            } else {
                const data: any = await request(this.base_subEndpoint, queryAaveUsers(Number(this.blockNumber), max), {}, this.headers) as any;
                const _users = data.users.map((e: any) => {
                    return new User(
                        e.id as Address,
                        e.eModeCategoryId?.id ? Number(e.eModeCategoryId?.id) : undefined,
                    );
                });

                await this.insertUsersDB(_users);
            }

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

    async fetchUsersDB(limit?: number): Promise<User[]> {
        try {

            let query = `SELECT * FROM ${this.tableName}`;
            if (limit) {
                query += ` LIMIT ${limit}`;
            }
            const result = await this.connection!.run(query);
            const rows: UserDB[] = await result.getRowObjectsJson() as unknown as UserDB[];

            const users = rows.map((row: UserDB) => new User(
                row.address as Address,
                row.emode_category_id,
                new Date(Number(row.created_at)),
                new Date(Number(row.last_updated))
            ));
            return users;

        } catch (e) {
            console.error('[UserController][fetchUsersDB] :: Error fetching users:', e);
            throw e;
        }
    }

    async getUserAccountData(userAddress: Address): Promise<UserAccountData> {
        try {
            const result: any = await this.client.readContract({
                blockNumber: this.blockNumber as bigint,
                address: this.base_pool,
                abi: aave_poolAbi,
                functionName: 'getUserAccountData',
                args: [userAddress],
            });

            return new UserAccountData(
                BigInt(result[0]), // totalCollateralBase
                BigInt(result[1]), // totalDebtBase
                BigInt(result[3]), // currentLiquidationThreshold
                BigInt(result[4]), // ltv
                BigInt(result[5])  // healthFactor
            );
        } catch (error) {
            console.error("[UserController][getUserAccountData] :: Error getting user account data:", error);
            throw error;
        }
    }


}