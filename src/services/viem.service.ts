import * as dotenv from 'dotenv';
import * as path from 'path';
import { createPublicClient, http, webSocket, Address } from "viem";
import { base } from 'viem/chains';

dotenv.config({ path: path.join(__dirname, '../../.env'), quiet: true });
const { RPC_URL, GRAPH_API_KEY } = process.env;

export class ViemService {
    protected client;
    protected clientWatch;
    protected blockNumber: BigInt;

    constructor() {
        this.client = createPublicClient({
            chain: base,
            transport: http(RPC_URL),
        });

        this.clientWatch = createPublicClient({
            chain: base,
            transport: webSocket(RPC_URL)
        })

        this.blockNumber = BigInt(33413241);
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