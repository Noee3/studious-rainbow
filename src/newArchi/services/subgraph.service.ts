import { chainConfigs } from '../config/blockchain.config';

export class SubgraphService {
    private config = chainConfigs;
    private request: any;

    constructor(
        private endpoint: string = chainConfigs.base.subgraph,
        private headers: Record<string, string> = { Authorization: `Bearer ${chainConfigs.base.graphApiKey}` }
    ) { }

    async initialize() {
        try {
            const { request } = await import('graphql-request');
            this.request = request;
        } catch (error) {
            console.error("[SubgraphService][Initialize] ::", error);
            throw error;
        }
    }

    async query(query: string, variables: Record<string, any> = {}): Promise<any> {
        try {
            if (!this.request) {
                throw new Error("[SubgraphService][Query] :: NOT INITIALIZED");
            }
            return await this.request(this.endpoint, query, variables, this.headers);
        } catch (error) {
            console.error('[SubgraphService][Query] ::', error);
            throw error;
        }
    }

}