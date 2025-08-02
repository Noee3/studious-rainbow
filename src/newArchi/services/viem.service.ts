import { chainConfigs } from '../config/blockchain.config';
import { createPublicClient, http, webSocket, Address } from "viem";

export class ViemService {

    private config = chainConfigs;
    public client;
    public clientWatch;
    public blockNumber: BigInt;

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

            this.blockNumber = BigInt(33413241);
        } catch (error) {
            console.error(
                "[ViemService] :: Error initializing ViemService",
                error
            )
            throw error;
        }
    }


    async getContractEvents(contractAddress: Address, abi: any): Promise<any> {
        return this.client.getContractEvents({
            address: contractAddress,
            abi: abi,
            fromBlock: BigInt(33413241),
            // toBlock: this.blockNumber as bigint + 1n,
            toBlock: BigInt(33413242)
            //limit 500
        })
    }

    // async watchContractEvents(contractAddress: address) {
    //     this.clientWatch.watchContractEvent(

    //     )
    // }

}