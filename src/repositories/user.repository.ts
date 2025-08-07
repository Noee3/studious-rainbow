import { Address } from "viem";
import { User, UserDB } from "../models/user.model";
import { DuckDBService } from "../services/duckdb.service";
import { ViemService } from "../services/viem.service";
import { BaseRepository } from "./base/base.repository";
import { BlockchainRepository } from "./base/blockchain.repository";
import { SubgraphService } from "../services/subgraph.service";
import { queryAaveUsers, queryAaveUsersByAddress } from "../typechain/subgraph_queries/queries";
import { UserAccountData } from "../models/user_account_data.model";
import { poolAbi } from "../typechain/abis/aavePool.abi";


export class UserRepository extends BaseRepository<User, UserDB> {

    constructor(
        dbService: DuckDBService,
        viemService: ViemService,
        subgraphService: SubgraphService,
        private blockChainRepository: BlockchainRepository = new BlockchainRepository(viemService, subgraphService),
        protected table: string = "users",
    ) {
        super(
            dbService,
            viemService,
            table,
        );
    }

    /*//////////////////////////////////////////////////////////////
                          BLOCKCHAIN
    //////////////////////////////////////////////////////////////*/

    public async fetchUsersData(num: number): Promise<User[]> {
        let limit: number = 1000;

        let users: User[] = [];

        if (num > limit) {
            const maxCalls = Math.ceil(num / limit);
            let count: number = 1;

            while (count < maxCalls) {
                const data = await this.blockChainRepository.querySubgraph(queryAaveUsers(Number(this.viemService.blockNumber), limit, (limit * count)), {});
                const result = data.users.map((e: any) => {
                    return new User(
                        e.id as Address,
                        Number(e.eModeCategoryId?.id),
                    );
                });

                count++;
                await this.insertMany(result);
                users.push(...result);

                if (data.users.length < limit) {
                    console.log('No more users found, stopping pagination');
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 10_000)); // Delay to avoid rate limiting 10 sec
            }
        } else {
            const data: any = await this.blockChainRepository.querySubgraph(queryAaveUsers(Number(this.viemService.blockNumber), num), {});
            const result = data.users.map((e: any) => {
                return new User(
                    e.id as Address,
                    e.eModeCategoryId?.id ? Number(e.eModeCategoryId?.id) : undefined,
                );
            });

            users = result;

            await this.insertMany(result);
        }

        return users;
    }

    public async fetchUsersDataByAddresses(userAddresses: Address[]): Promise<User[]> {
        if (userAddresses.length === 0) {
            return [];
        }

        const users: string = `"${userAddresses.join('","')}"`;
        const data: any = await this.blockChainRepository.querySubgraph(queryAaveUsersByAddress(Number(this.viemService.blockNumber), users), {});

        const result = data.users.map((e: any) => {
            return new User(
                e.id as Address,
                e.eModeCategoryId?.id ? Number(e.eModeCategoryId?.id) : undefined,
            );
        });

        await this.insertMany(result);

        return result;
    }



    public async fetchUserAccountData(userAddress: Address, blockNumber?: bigint): Promise<UserAccountData> {
        const result = await this.blockChainRepository.readContract<any>(
            this.viemService.poolContract,
            poolAbi,
            'getUserAccountData',
            [userAddress],
            blockNumber
        );

        return new UserAccountData(
            BigInt(result[0]), // totalCollateralBase
            BigInt(result[1]), // totalDebtBase
            BigInt(result[3]), // currentLiquidationThreshold
            BigInt(result[4]), // ltv
            BigInt(result[5])  // healthFactor
        );
    }

    /*//////////////////////////////////////////////////////////////
                            DATABASE
    //////////////////////////////////////////////////////////////*/

    public async usersExists(userAddresses: Address[]): Promise<User[]> {
        const where = `address IN ('${userAddresses.join("','")}')`;
        const result = await this.fetchTable(where);
        return result;
    }


    protected fromDB(dbRecord: UserDB): User {
        return User.fromDB(dbRecord);
    }

    protected toDB(model: User): UserDB {
        return model.toDB();
    }

    protected appendItem(appender: any, dbRecord: UserDB): void {
        appender.appendVarchar(dbRecord.address);
        dbRecord.emode_category_id ? appender.appendInteger(dbRecord.emode_category_id) : appender.appendNull();
        appender.appendBigInt(dbRecord.created_at);
        appender.appendBigInt(dbRecord.last_updated);
    }
}


