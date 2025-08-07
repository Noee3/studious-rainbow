
import { Asset } from "../models/asset.model";
import { AssetPrice } from "../models/asset_price.model";
import { AssetPriceRepository } from "../repositories/asset_price.repository";


export class AssetPriceController {
    private assetPriceRepository: AssetPriceRepository;

    constructor(assetPriceRepository: AssetPriceRepository) {
        this.assetPriceRepository = assetPriceRepository;
    }

    async init(assets: Asset[]): Promise<AssetPrice[]> {
        try {
            console.info("[AssetPriceController] :: initialisation");
            let assetsPrices = await this.fetchAssetsPricesDB();
            if (assetsPrices.length === 0) {
                console.info("[AssetPriceController] :: fetchAssetsPricesData 🌐");

                assetsPrices = await this.assetPriceRepository.fetchAssetsPricesData(assets.map(asset => asset.address));
                await this.insertAssetsPricesDB(assetsPrices);

            } else {
                console.info("[AssetPriceController] :: fetchAssetsPricesDB 💾");
            }
            return assetsPrices;
        } catch (e) {
            console.error("[AssetPriceController][init] :: Error initialising asset prices data:", e);
            throw e;
        }
    }

    async getAssetPricesCount(where?: string): Promise<number> {
        try {
            return await this.assetPriceRepository.getTableCount(where);
        } catch (error) {
            console.error("[AssetPriceController][getAssetPricesCount] :: Error fetching asset prices count:", error);
            throw error;
        }
    }

    async fetchAssetsPricesDB(): Promise<AssetPrice[]> {
        try {
            return this.assetPriceRepository.fetchAll();
        } catch (error) {
            console.error("[AssetPriceController][fetchAssetsPricesDB] :: Error fetching asset prices:", error);
            throw error;
        }
    }

    async insertAssetsPricesDB(assetsPrices: AssetPrice[]): Promise<void> {
        try {
            await this.assetPriceRepository.insertMany(assetsPrices);
        } catch (error) {
            console.error("[AssetPriceController][insertAssetsPricesDB] :: Error inserting asset prices:", error);
            throw error;
        }
    }
}