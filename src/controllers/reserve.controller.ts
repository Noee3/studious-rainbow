import { Asset } from "../models/asset.model";
import { Reserve } from "../models/reserve.model";
import { ReserveRepository } from "../repositories/reserve.repository";
import { AssetController } from "./asset.controller";

export class ReserveController {
    private reserveRepository: ReserveRepository;

    constructor(reserveRepository: ReserveRepository) {
        this.reserveRepository = reserveRepository;
    }

    async init(assetController: AssetController): Promise<{ reservesData: Reserve[], assets: Asset[] }> {
        try {
            console.info("[ReserveController] :: initialisation");
            let reservesData = await this.fetchAllReserves();

            let assetsData: Asset[] = [];

            if (reservesData.length === 0) {
                console.info("[ReserveController] :: fetchReserveData 🌐");
                reservesData = await this.reserveRepository.fetchReservesData();
                assetsData = await assetController.init(reservesData);
                await this.insertReserves(reservesData);

                //not necessary just to confirm data conformity
                reservesData = await this.fetchAllReserves();
            } else {
                console.info("[ReserveController] :: fetchReserveDB 💾");
                assetsData = await assetController.init(reservesData);
            }

            return { reservesData: reservesData, assets: assetsData };

        } catch (e) {
            console.error("[ReserveController][init] :: Error initialising reserves data:", e);
            throw e;
        }
    }

    async fetchAllReserves(): Promise<Reserve[]> {
        try {
            return await this.reserveRepository.fetchAll();
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