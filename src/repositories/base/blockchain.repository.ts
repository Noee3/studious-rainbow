import { Address, MulticallContracts } from "viem";
import { ViemService } from "../../services/viem.service";
import { SubgraphService } from "../../services/subgraph.service";

export interface Call {
    address: Address;
    abi: any;
    functionName: string;
    args?: readonly any[];
}

export class BlockchainRepository {

    constructor(protected viemService: ViemService,
        protected subgraphService: SubgraphService
    ) { }

    public async readContract<T>(
        address: Address,
        abi: any,
        functionName: string,
        args: readonly any[] = [],
        blockNumber: bigint = this.viemService.blockNumber as bigint
    ): Promise<T> {
        const result = await this.viemService.client.readContract({
            blockNumber,
            address,
            abi,
            functionName,
            args
        });

        return result as T;
    }

    public async getContractEvents<T>(
        address: Address,
        abi: any,
        toBlock: bigint,
        fromBlock: bigint = this.viemService.blockNumber as bigint,
        eventName?: string,
        args?: {}
    ): Promise<T> {

        const result = await this.viemService.client.getContractEvents({
            address: address,
            abi: abi,
            eventName: eventName,
            args: args,
            fromBlock: fromBlock,
            toBlock: toBlock,
        });

        return result as T;
    }

    public async multiCall(calls: Call[]): Promise<any[]> {
        const result = await this.viemService.client.multicall({
            contracts: calls,
            allowFailure: false,
            blockNumber: this.viemService.blockNumber as bigint,
        });
        return result;
    }

    public async querySubgraph(query: string, variables: Record<string, any> = {}): Promise<any> {
        return await this.subgraphService.query(query, variables);
    }
}