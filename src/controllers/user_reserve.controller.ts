import { Address } from "viem";
import { UserReserve } from "../models/user_reserve.model";
import { UserReserveRepository } from "../repositories/user_reserve.repository";

export class UserReserveController {
    public userReserveRepository: UserReserveRepository;

    constructor(userReserveRepository: UserReserveRepository) {
        this.userReserveRepository = userReserveRepository;
    }

    async init(userAddress: Address): Promise<UserReserve[]> {
        try {
            // console.info("[UserReservesController] :: initialisation for user:", userAddress);
            let userReserves = await this.fetchAllUserReserves(`user_address = '${userAddress}'`);
            if (userReserves.length === 0) {
                // console.info("[UserReservesController] :: fetchUserReservesData 🌐");
                userReserves = await this.userReserveRepository.fetchUserReservesData(userAddress);
                await this.insertUserReserves(userReserves);
            } else {
                console.info("[UserReservesController] :: fetchUserReservesDB 💾");
            }
            return userReserves;
        } catch (e) {
            console.error("[UserReservesController][init] :: Error initialising user reserves data:", e);
            throw e;
        }
    }

    async getUserReservesCount(where?: string): Promise<number> {
        try {
            return await this.userReserveRepository.getTableCount(where);
        } catch (error) {
            console.error("[UserReserveController][getUserReservesCount] :: Error fetching user reserve count:", error);
            throw error;
        }
    }

    async fetchAllUserReserves(where?: string): Promise<UserReserve[]> {
        try {
            return await this.userReserveRepository.fetchAll(where);
        } catch (error) {
            console.error("[UserReserveController][fetchAllUserReserves] :: Error fetching user reserves:", error);
            throw error;
        }
    }

    async fetchUserScaledTokenBalance(userAddress: Address, tokenAddress: Address, blockNumber?: bigint): Promise<bigint> {
        try {
            return await this.userReserveRepository.fetchScaledTokenBalance(userAddress, tokenAddress, blockNumber);
        } catch (error) {
            console.error("[UserReserveController][fetchUserScaledTokenBalance] :: Error fetching user scaled token balance:", error);
            throw error;
        }
    }

    async updateUserReserves(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.userReserveRepository.update(where, fields);
        } catch (error) {
            console.error("[UserReserveController][updateUserReserves] :: Error updating user reserves:", where, error);
            throw error;
        }
    }

    async updateAtokenBalance(where: string, amount: bigint, operation: "increment" | "decrement" | "replace"): Promise<any> {
        try {

            const userReserve = await this.userReserveRepository.fetchAll(where);

            // if (userReserve[0].scaledATokenBalance == 0n && operation === "decrement") return;

            let total: bigint;
            let event: string;

            switch (operation) {
                case "increment":
                    total = userReserve[0].scaledATokenBalance + amount;
                    event = "Supply";
                    break;
                case "decrement":
                    total = userReserve[0].scaledATokenBalance - amount;
                    event = "Withdraw";
                    break;
                case "replace":
                    total = amount;
                    event = "Replace";
                    break;
            }

            console.log(`User :: ${userReserve[0].userAddress} \n ${event} :: ${userReserve[0].scaledATokenBalance} ${operation === "increment" ? ('+ ' + amount) : operation === "decrement" ? ('- ' + amount) : ''} = ${total}`);
            await this.userReserveRepository.update(where, { scaled_aToken_balance: total, last_updated: BigInt(Date.now()) });
        } catch (error) {
            console.error("[UserReserveController][updateAtokenBalance] :: Error updating aToken balance:", where, error);
            throw error;
        }
    }

    async updateVariableDebtBalance(where: string, amount: bigint, operation: "increment" | "decrement" | "replace"): Promise<any> {
        try {
            const userReserve = await this.userReserveRepository.fetchAll(where);
            let total: bigint;
            let event: string;


            switch (operation) {
                case "increment":
                    total = userReserve[0].scaledVariableDebt + amount;
                    event = "Borrow";
                    break;
                case "decrement":
                    total = userReserve[0].scaledVariableDebt - amount;
                    event = "Repay";
                    break;
                case "replace":
                    total = amount;
                    event = "Replace";
                    break;
            }

            console.log(`User :: ${userReserve[0].userAddress}\n ${event} :: ${userReserve[0].scaledVariableDebt} ${operation === "increment" ? ('+ ' + amount) : '- ' + amount} = ${total}`);
            await this.userReserveRepository.update(where, { scaled_variable_debt: total, last_updated: BigInt(Date.now()) });
        } catch (error) {
            console.error("[UserReserveController][updateVariableDebtBalance] :: Error updating variable debt balance :", where, error);
            throw error;
        }
    }

    async insertUserReserves(userReserves: UserReserve[]): Promise<any> {
        try {
            await this.userReserveRepository.insertMany(userReserves);
        } catch (error) {
            console.error("[UserReserveController][insertUserReserves] :: Error inserting user reserves:", error);
            throw error;
        }
    }
}