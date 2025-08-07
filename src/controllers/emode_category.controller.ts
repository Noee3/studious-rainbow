import { EmodeCategory } from "../models/emode_category.model";
import { EModeCategoryRepository } from "../repositories/emode_category.repository";

export class EModeCategoryController {
    private emodeCategoryRepository: EModeCategoryRepository;

    constructor(emodeCategoryRepository: EModeCategoryRepository) {
        this.emodeCategoryRepository = emodeCategoryRepository;
    }

    async init(): Promise<EmodeCategory[]> {
        try {
            console.info("[EmodeCategoryController] :: initialisation");
            let emodeCategories = await this.fetchAllEModeCategories();
            if (emodeCategories.length === 0) {
                console.info("[EmodeCategoryController] :: fetchEmodeCategoriesData 🌐");
                const categories = await this.fetchEmodeCategoriesId();
                for (let i = 0; i < categories.length; i++) {
                    const emodeCategory = await this.emodeCategoryRepository.fetchEmodeCategoryData(categories[i]);
                    emodeCategories.push(emodeCategory);
                }
                await this.insertEModeCategories(emodeCategories);
            } else {
                console.info("[EmodeCategoryController] :: fetchEmodeCategoriesDB 💾");
            }

            return emodeCategories;
        } catch (e) {
            console.error("[EmodeCategoryController][init] :: Error initialising emode categories data:", e);
            throw e;
        }
    }

    async getEmodeCategoriesCount(where?: string): Promise<number> {
        try {
            return await this.emodeCategoryRepository.getTableCount(where);
        } catch (error) {
            console.error("[EModeCategoryController][getEmodeCategoriesCount] :: Error fetching eMode category count:", error);
            throw error;
        }
    }


    async fetchEmodeCategoriesId(): Promise<number[]> {
        try {
            return await this.emodeCategoryRepository.fetchEmodeCategoriesId();
        } catch (error) {
            console.error("[EModeCategoryController][fetchEmodeCategoriesId] :: Error fetching categories id:", error);
            throw error;
        }
    }


    async fetchAllEModeCategories(): Promise<EmodeCategory[]> {
        try {
            return await this.emodeCategoryRepository.fetchAll();
        } catch (error) {
            console.error("[EModeCategoryController][fetchAllEModeCategories] :: Error fetching eMode categories:", error);
            throw error;
        }
    }

    async updateEModeCategory(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.emodeCategoryRepository.update(where, fields);
        } catch (error) {
            console.error("[EModeCategoryController][updateEModeCategory] :: Error updating eMode category:", error);
            throw error;
        }
    }

    async insertEModeCategories(emodeCategories: EmodeCategory[]): Promise<any> {
        try {
            await this.emodeCategoryRepository.insertMany(emodeCategories);
        } catch (error) {
            console.error("[EModeCategoryController][insertEModeCategories] :: Error inserting eMode categories:", error);
            throw error;
        }
    }
}