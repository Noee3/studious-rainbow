import { Address } from "viem";
import { ViemService } from "../../services/viem.service";
import { SubgraphService } from "../../services/subgraph.service";

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

        if (result && Array.isArray(result)) {
            return result[0] as T;
        }
        return result as T;
    }

    public async querySubgraph(query: string, variables: Record<string, any> = {}): Promise<any> {
        return await this.subgraphService.query(query, variables);
    }

}