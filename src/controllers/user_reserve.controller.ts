import { Address } from "viem";
import { UserReserve } from "../models/user_reserve.model";
import { UserReserveRepository } from "../repositories/user_reserve.repository";

export class UserReserveController {
    private userReserveRepository: UserReserveRepository;

    constructor(userReserveRepository: UserReserveRepository) {
        this.userReserveRepository = userReserveRepository;
    }

    async init(userAddress: Address): Promise<UserReserve[]> {
        try {
            console.info("[UserReservesController] :: initialisation for user:", userAddress);
            let userReserves = await this.fetchAllUserReserves(userAddress);
            if (userReserves.length === 0) {
                console.info("[UserReservesController] :: fetchUserReservesData 🌐");
                userReserves = await this.userReserveRepository.fetchUserReservesData(userAddress);
                await this.insertUserReserves(userReserves);

                // not necessary just to confirm data conformity
                userReserves = await this.fetchAllUserReserves(userAddress);
            } else {
                console.info("[UserReservesController] :: fetchUserReservesDB 💾");
            }
            return userReserves;
        } catch (e) {
            console.error("[UserReservesController][init] :: Error initialising user reserves data:", e);
            throw e;
        }
    }

    async fetchAllUserReserves(userAddress: Address): Promise<UserReserve[]> {
        try {
            return await this.userReserveRepository.fetchAll(`user_address = '${userAddress}'`);
        } catch (error) {
            console.error("[UserReserveController][fetchAllUserReserves] :: Error fetching user reserves:", error);
            throw error;
        }
    }

    async updateUserReserves(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.userReserveRepository.update(where, fields);
        } catch (error) {
            console.error("[UserReserveController][updateUserReserves] :: Error updating user reserves:", error);
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