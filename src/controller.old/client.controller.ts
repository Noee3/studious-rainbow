// import { createPublicClient, http, Block } from "viem";
// import { base } from 'viem/chains';
// import * as dotenv from 'dotenv';
// import * as path from 'path';

// dotenv.config({ path: path.join(__dirname, '../../.env'), quiet: true });
// const { RPC_URL, GRAPH_API_KEY } = process.env;

// export class ClientController {
//     public base_subEndpoint;
//     public client;
//     public blockNumber: BigInt;

//     headers = {
//         Authorization: `Bearer ${GRAPH_API_KEY}`,
//     };
//     constructor() {
//         this.client = createPublicClient({
//             chain: base,
//             transport: http(RPC_URL),
//         });
//         this.base_subEndpoint = 'https://gateway.thegraph.com/api/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF';
//         this.blockNumber = BigInt(33413241);
//     }
// }