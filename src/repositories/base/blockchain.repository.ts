import { Address } from "viem";
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
        blockNumber: bigint,
    ): Promise<T> {

        const result = await this.viemService.client.readContract({
            address: address,
            abi: abi,
            blockNumber: blockNumber,
            functionName: functionName,
            args: args
        });
        return result as T;
    }

    public async getContractEvents<T>(
        address: Address,
        abi: any,
        fromBlock: bigint,
        toBlock: bigint,
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

        result.sort((a: any, b: any) => {
            const blockDiff = Number(a.blockNumber) - Number(b.blockNumber);
            if (blockDiff !== 0) return blockDiff;
            return a.transactionIndex - b.transactionIndex;
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