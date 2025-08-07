import { chainConfigs } from '../config/blockchain.config';
import { createPublicClient, http, webSocket, Address } from "viem";

export class ViemService {

    private config = chainConfigs;
    public client;
    public clientWatch;
    public blockNumber: bigint;

    // contracts
    public poolContract: Address = this.config.base.contracts.pool;
    public uiPoolDataProvider: Address = this.config.base.contracts.uiPoolDataProvider;
    public addressProvider: Address = this.config.base.contracts.addressProvider;
    public aaveOracle: Address = this.config.base.contracts.aaveOracle;

    constructor() {
        try {
            this.client = createPublicClient({
                chain: this.config.base.chain,
                transport: http(this.config.base.rpcUrl),
            });

            this.clientWatch = createPublicClient({
                chain: this.config.base.chain,
                transport: webSocket(this.config.base.rpcUrl)
            })
            this.blockNumber = this.config.base.fromBlock;
        } catch (error) {
            console.error(
                "[ViemService] :: Error initializing ViemService",
                error
            )
            throw error;
        }
    }
}