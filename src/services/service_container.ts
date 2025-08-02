import assert from 'assert';

import { AssetController } from "../controllers/asset.controller";
import { AssetPriceController } from "../controllers/asset_price.controller";
import { EModeCategoryController } from "../controllers/emode_category.controller";
import { ReserveController } from "../controllers/reserve.controller";
import { UserController } from "../controllers/user.controller";
import { UserReserveController } from "../controllers/user_reserve.controller";
import { AssetRepository } from "../repositories/asset.repository";
import { AssetPriceRepository } from "../repositories/asset_price.repository";
import { EModeCategoryRepository } from "../repositories/emode_category.repository";
import { ReserveRepository } from "../repositories/reserve.repository";
import { UserRepository } from "../repositories/user.repository";
import { UserReserveRepository } from "../repositories/user_reserve.repository";
import { DuckDBService } from "./duckdb.service";
import { SubgraphService } from "./subgraph.service";
import { ViemService } from "./viem.service";

export class ServiceContainer {

    public static dbService: DuckDBService;
    private static viemService: ViemService;
    private static subgraphService: SubgraphService;

    // SingleTon
    private static reserveRepository: ReserveRepository;
    public static reserveController: ReserveController;

    private static userReserveRepository: UserReserveRepository;
    public static userReserveController: UserReserveController;

    private static userRepository: UserRepository;
    public static userController: UserController;

    private static assetRepository: AssetRepository;
    public static assetController: AssetController;

    private static assetPriceRepository: AssetPriceRepository;
    public static assetPriceController: AssetPriceController;

    private static eModeCategoryRepository: EModeCategoryRepository;
    public static eModeCategoryController: EModeCategoryController;

    static async initialize() {
        try {
            this.dbService = new DuckDBService();
            this.viemService = new ViemService();
            this.subgraphService = new SubgraphService();

            // Connections async 
            await this.dbService.connect();
            await this.subgraphService.initialize();


            // Initialize repositories
            this.reserveRepository = new ReserveRepository(this.dbService, this.viemService, this.subgraphService);
            this.reserveController = new ReserveController(this.reserveRepository);

            this.assetRepository = new AssetRepository(this.dbService, this.viemService, this.subgraphService);
            this.assetController = new AssetController(this.assetRepository);

            this.userReserveRepository = new UserReserveRepository(this.dbService, this.viemService, this.subgraphService);
            this.userReserveController = new UserReserveController(this.userReserveRepository);

            this.userRepository = new UserRepository(this.dbService, this.viemService, this.subgraphService);
            this.userController = new UserController(this.userRepository);


            this.assetPriceRepository = new AssetPriceRepository(this.dbService, this.viemService, this.subgraphService);
            this.assetPriceController = new AssetPriceController(this.assetPriceRepository);

            this.eModeCategoryRepository = new EModeCategoryRepository(this.dbService, this.viemService, this.subgraphService);
            this.eModeCategoryController = new EModeCategoryController(this.eModeCategoryRepository);

            console.info("[ServiceContainer] :: Services initialized successfully");

            await this.run(100);


        } catch (error) {
            console.error("[ServiceContainer][initialize] :: Error initializing services:", error);
            throw error;
        }
    }

    static async run(userNumber: number): Promise<void> {
        try {
            await this.dbService.resetDatabase();

            let userReserves: [] = [];

            const { reservesData, assets } = await this.reserveController.init(this.assetController);


            const assetPrices = await this.assetPriceController.init(assets);


            const eModeCategories = await this.eModeCategoryController.init();
            const users = await this.userController.init(userNumber);

            for (const user of users) {
                const userReserves = await this.userReserveController!.init(user.address);
                userReserves.push(...userReserves);
            }

            assert(reservesData.length > 0, "Reserves data is empty");
            assert(assets.length > 0, "Assets data is empty");
            assert(assetPrices.length > 0, "Asset prices data is empty");
            assert(eModeCategories.length > 0, "Emode categories data is empty");
            assert(users.length > 0, "Users data is empty");
            assert(userReserves.length > 0, "User reserves data is empty");

            console.info("[LiquidationController] :: Data fetched successfully");

        } catch (error) {
            console.error("[ServiceContainer][run] :: Error running services:", error);
            throw error;
        }
    }


}