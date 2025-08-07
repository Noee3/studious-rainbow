
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
import { EventService } from './event.service';
import { EventController } from "../controllers/event.controller";
import { EventRespository } from "@/repositories/event.repository";
import { EventNewRepository } from "@/repositories/event.new.repository";
import { EventNewController } from "@/controllers/event.new.controller";

export class ServiceContainer {

    // services
    public static dbService: DuckDBService;
    public static viemService: ViemService;
    public static subgraphService: SubgraphService;

    // public static eventService: EventService;
    // public static eventController: EventController;

    // SingleTon

    private static eventNewRepository: EventNewRepository;
    public static eventNewController: EventNewController;

    private static eventRepository: EventRespository;
    public static eventController: EventController;

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


            this.eventNewRepository = new EventNewRepository(this.dbService, this.viemService, this.subgraphService);
            this.eventNewController = new EventNewController(this.eventNewRepository);

            this.eventRepository = new EventRespository(this.dbService, this.viemService, this.subgraphService);
            this.eventController = new EventController(this.eventRepository);
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

        } catch (error) {
            console.error("[ServiceContainer][initialize] :: Error initializing services:", error);
            throw error;
        }
    }
}