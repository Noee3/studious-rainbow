import { Address, Chain } from "viem";
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';
import * as path from 'path';
// dotenv.config({ path: path.join(__dirname, '../.env'), quiet: true });

dotenv.config();

export interface ContractAddresses {
    pool: Address;
    uiPoolDataProvider: Address;
    addressProvider: Address;
    aaveOracle: Address
}

export interface ChainConfig {
    chain: Chain;
    rpcUrl: string;
    graphApiKey: string;
    subgraph: string;
    contracts: ContractAddresses
}

export const chainConfigs = {
    base: {
        chain: base,
        rpcUrl: process.env.BASE_RPC_URL,
        graphApiKey: process.env.GRAPH_API_KEY,
        subgraph: 'https://gateway.thegraph.com/api/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF',
        contracts: {
            pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
            uiPoolDataProvider: '0x68100bD5345eA474D93577127C11F39FF8463e93',
            addressProvider: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
            aaveOracle: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156'
        } as ContractAddresses
    } as ChainConfig
};