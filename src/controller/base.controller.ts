import { Address } from "viem";
import { DuckDBConnection } from '@duckdb/node-api';
import { ViemService } from "../services/viem.service";
import { DuckDBService } from "../services/duckdb.service";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env'), quiet: true });
const { GRAPH_API_KEY } = process.env;

export class BaseController extends ViemService {
    protected base_uiPoolDataProvider: Address;
    protected base_addressProvider: Address;
    public base_pool: Address;
    protected base_aaveOracle: Address;
    protected base_subEndpoint;

    protected connection: DuckDBConnection | null = null;

    headers = {
        Authorization: `Bearer ${GRAPH_API_KEY}`,
    };

    constructor() {
        super();

        this.base_subEndpoint = 'https://gateway.thegraph.com/api/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF';
        this.base_uiPoolDataProvider = "0x68100bD5345eA474D93577127C11F39FF8463e93";
        this.base_addressProvider = "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D";
        this.base_pool = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
        this.base_aaveOracle = "0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156";
    }
}