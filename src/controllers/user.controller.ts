import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import { Address } from "viem";
import { UserAccountData } from "../models/user_account_data.model";

export class UserController {
    public userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async init(param: number | Address[]): Promise<User[]> {
        try {
            console.info("[UserController] :: initialisation");

            if (typeof param === 'number') {
                let users = await this.fetchAllUsers(param);
                if (users.length == 0) {
                    console.info("[UserController] :: fetchUsersDataByNum 🌐");
                    users = await this.userRepository.fetchUsersData(param);
                } else {
                    console.info("[UserController] :: fetchUsersDBbyNum 💾");
                }
                return users;
            } else {
                let users = await this.fetchAllUsersByAddress(param);
                if (users.length == 0) {
                    console.info("[UserController] :: fetchUsersDataByAddresses 🌐");
                    users = await this.userRepository.fetchUsersDataByAddresses(param);
                } else {
                    console.info("[UserController] :: fetchUsersDBbyAddress💾");
                }
                return users;
            }

        } catch (e) {
            console.error("[UserController][init] :: Error initialising users data:", e);
            throw e;
        }
    }

    async getUsersCount(where?: string): Promise<number> {
        try {
            return await this.userRepository.getTableCount(where);
        } catch (error) {
            console.error("[UserController][getUsersCount] :: Error fetching user count:", error);
            throw error;
        }
    }


    async fetchAllUsers(limit?: number): Promise<User[]> {
        try {
            return await this.userRepository.fetchAll(undefined, limit);
        } catch (error) {
            console.error("[UserController][fetchAllUsers] :: Error fetching users:", error);
            throw error;
        }
    }

    async fetchAllUsersByAddress(addresses: Address[]): Promise<User[]> {
        try {
            const where = `address IN ('${addresses.join(`', '`)}')`;
            return await this.userRepository.fetchAll(where);
        } catch (error) {
            console.error("[UserController][fetchAllUsersByAddress] :: Error fetching users:", error);
            throw error;
        }
    }

    async usersExists(userAddresses: Address[]): Promise<Record<Address, boolean>> {
        try {
            const results = await this.userRepository.usersExists(userAddresses);
            const foundAddresses = new Set(results.map(user => user.address));
            return userAddresses.reduce((acc, address) => {
                acc[address] = foundAddresses.has(address);
                return acc;
            }, {} as Record<Address, boolean>);
        } catch (error) {
            console.error("[UserController][usersExists] :: Error checking user existence:", error);
            throw error;
        }
    }


    async fetchUserAccountData(userAddress: Address, blockNumber?: bigint): Promise<UserAccountData> {
        try {
            return await this.userRepository.fetchUserAccountData(userAddress, blockNumber);
        } catch (error) {
            console.error("[UserController][fetchUserAccountData] :: Error fetching user account data:", error);
            throw error;
        }
    }

    async updateUser(where: string, fields: Record<string, any>): Promise<any> {
        try {
            return await this.userRepository.update(where, fields);
        } catch (error) {
            console.error("[UserController][updateUser] :: Error updating user:", error);
            throw error;
        }
    }

    async insertUsers(users: User[]): Promise<any> {
        try {
            return await this.userRepository.insertMany(users);
        } catch (error) {
            console.error("[UserController][insertUsers] :: Error inserting users:", error);
            throw error;
        }
    }
}