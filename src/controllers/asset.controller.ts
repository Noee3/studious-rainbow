import { Address } from "viem";
import { Asset } from "../models/asset.model";
import { Reserve } from "../models/reserve.model";
import { AssetRepository } from "../repositories/asset.repository";

export class AssetController {
    private assetRepository: AssetRepository;

    constructor(assetRepository: AssetRepository) {
        this.assetRepository = assetRepository;
    }

    async init(): Promise<Asset[]> {
        try {
            console.info("[AssetController] :: initialisation");
            let assets = await this.fetchAllAssets();
            if (assets.length === 0) {
                console.info("[AssetController] :: fetchAssetsData 🌐");
                const assetList: Address[] = await this.assetRepository.fetchAssetList();
                assets = await this.assetRepository.fetchAssetData(assetList);

                await this.insertAssets(assets);

            } else {
                console.info("[AssetController] :: fetchAssetsDB 💾");
            }

            return assets;
        } catch (e) {
            console.error("[AssetController][init] :: Error initialising assets data:", e);
            throw e;
        }
    }

    async getAssetsCount(where?: string): Promise<number> {
        try {
            return await this.assetRepository.getTableCount(where);
        } catch (error) {
            console.error("[AssetController][getAssetsCount] :: Error fetching asset count:", error);
            throw error;
        }
    }

    async fetchAllAssets(): Promise<Asset[]> {
        try {
            return await this.assetRepository.fetchAll();
        } catch (error) {
            console.error("[AssetController][fetchAllAssets] :: Error fetching assets:", error);
            throw error;
        }
    }

    async updateAsset(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.assetRepository.update(where, fields);
        } catch (error) {
            console.error("[AssetController][updateAsset] :: Error updating asset:", error);
            throw error;
        }
    }

    async insertAssets(assets: Asset[]): Promise<any> {
        try {
            await this.assetRepository.insertMany(assets);
        } catch (error) {
            console.error("[AssetController][insertAssets] :: Error inserting assets:", error);
            throw error;
        }
    }
}