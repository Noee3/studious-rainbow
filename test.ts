import { DuckDBService } from "./src/services/duckdb.service";
import { ViemService } from "./src/services/viem.service";

// niveau 0
export abstract class DbRepository {

    constructor(
        protected dbService: DuckDBService
    ) { }

    protected update(table: string, setClause: string, where: string) {
        const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        this.dbService.connection?.run(query);
    }
}

// niveau 1
export abstract class BaseRepository extends DbRepository {

    constructor(
        protected dbService: DuckDBService,
        protected viemService: ViemService
    ) {
        super(dbService);
    }
}

//niveau 2
export class ReserveRepository extends BaseRepository {

    updateReserve() {
        this.update();
    }
}

// niveau 3
export class ReserveController {

    constructor(private reserveRepository: ReserveRepository) {
    }

    updateReserve(): void {
        this.reserveRepository.updateReserve();
    }

}

export class ServiceContainer {
    private static dbService: DuckDBService;
    private static viemService: ViemService;

    //SingleTon;
    private static reserveRepo: ReserveRepository;

    static async initialize() {
        this.dbService = new DuckDBService();
        this.viemService = new ViemService();

        // Connexions async si nécessaire
        await this.dbService.connect();
        await this.viemService.connect();
    }

    static getReserveController() {
        if (!this.dbService) throw new Error('Container not initialized');
        const repo = new ReserveRepository(this.dbService, this.viemService);
        return new ReserveController(repo);
    }
}

// code
async function main() {
    await ServiceContainer.initialize(); // Boot explicite


    //new autreController(duckdb, viem) pour instancer avec les mêmes instances;
}