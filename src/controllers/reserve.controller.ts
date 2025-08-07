import { Asset } from "../models/asset.model";
import { Reserve } from "../models/reserve.model";
import { ReserveRepository } from "../repositories/reserve.repository";
import { AssetController } from "./asset.controller";

export class ReserveController {
    public reserveRepository: ReserveRepository;

    constructor(reserveRepository: ReserveRepository) {
        this.reserveRepository = reserveRepository;
    }

    async init(): Promise<Reserve[]> {
        try {
            console.info("[ReserveController] :: initialisation");
            let reservesData = await this.fetchAllReserves();

            if (reservesData.length === 0) {
                console.info("[ReserveController] :: fetchReserveData 🌐");
                reservesData = await this.reserveRepository.fetchReservesData();
                await this.insertReserves(reservesData);

            } else {
                console.info("[ReserveController] :: fetchReserveDB 💾");
            }

            return reservesData;

        } catch (e) {
            console.error("[ReserveController][init] :: Error initialising reserves data:", e);
            throw e;
        }
    }

    async getReservesCount(where?: string): Promise<number> {
        try {
            return await this.reserveRepository.getTableCount(where);
        } catch (error) {
            console.error("[ReserveController][getReserveCount] :: Error fetching reserve count:", error);
            throw error;
        }
    }

    async fetchAllReserves(where?: string): Promise<Reserve[]> {
        try {
            return await this.reserveRepository.fetchAll(where);
        } catch (error) {
            console.error("[ReserveController][fetchAllReserves] :: Error fetching reserves:", error);
            throw error;
        }
    }

    async updateReserve(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.reserveRepository.update(where, fields);
        } catch (error) {
            console.error("[ReserveController][updateReserve] :: Error updating reserve:", error);
            throw error;
        }
    }


    async insertReserves(reserves: Reserve[]): Promise<any> {
        try {
            await this.reserveRepository.insertMany(reserves);
        } catch (error) {
            console.error("[ReserveController][insertReserves] :: Error inserting reserves:", error);
            throw error;
        }
    }
}