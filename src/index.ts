
import { LiquidationController } from './controller/liquidation.controller';
import { BaseController } from "./controller/base.controller";
import { Address } from "viem";
import { aave_poolAbi } from "./typechain/aave.abi";
import { aavePool } from "./typechain/abis/aave_pool";



/* TODO update index.ts with new function from controller
 
 
+ listen event and update db (https://vscode.blockscan.com/8453/0xec202552f0c23bb0c19df2f3311e324bbf015703)
+ websocket alchemy;
- Pour test avec viem on peut simuler les events d'un contrat d'un block de départ a un block d'arrivé :: getContractEvents(fromBlock, toBlock);
 
+ Faire des tests avec marge d'erreur 0.001%;
 
+ Définir tous les paramètres qui doivent être des dynamiques pour créer des vues afin de faire des calculs vectorielles,
on peut créer des vues sur des vues (example calcul du healthFactor avec la vue liquidationThreshold)
 
 
+ Pas de triggers donc à l'écoute des events pour chaque ajout dans BDD, faire requête pour détecter healthFactor > 1 ou sinon faire une vues intelligente qui renvoies les users
avec une healthFactor < 1, ce qui permet de surveiller une vues ou une table si je stocke plutôt que l'ensemble de la bdd, à voir.
*/



export interface Event {
    eventName: string;
    args: any;
    address: Address;
    topics: string[],
    data: string,
    blockHash: string,
    blockNumber: bigint,
    blockTimestamp: string,
    transactionHash: string,
    transactionIndex: number,
    logIndex: number,
    removed: boolean
};



(async () => {

    const liquidationController: LiquidationController = new LiquidationController();

    await liquidationController.init();

    await liquidationController.fetchData(10);

    await liquidationController.computeLiquidationsOpportunities();


    // async getContractEvents(contractAddress: Address, abi: any): Promise<any> {
    //     return this.client.getContractEvents({
    //         address: contractAddress,
    //         abi: abi,
    //         fromBlock: this.blockNumber as bigint,
    //         toBlock: this.blockNumber as bigint + 1n,
    //     })
    // }

    // const baseController = new BaseController();
    // const logs: Event[] = await baseController.getContractEvents(baseController!.base_pool, aavePool);
    // // console.log(logs);

    // const query = `UPDATE reserves SET liquidityIndex = ? SET variableBorrowIndex = ? WHERE asset_address = ?`;

    // for (const log of logs) {
    //     console.log(log);
    //     switch (log.eventName) {
    //         case "ReserveDataUpdated":
    //             break;

    //             if (log.removed) break;

    //             await liquidationController.reserveController?.updateReserve(log.args.reserve, {
    //                 liquidity_index: log.args.liquidityIndex,
    //                 variable_borrow_index: log.args.variableBorrowIndex,
    //                 last_updated: Number(log.blockTimestamp)
    //             });
    //         case "Supply":
    //             if (log.removed) break;



    //             break;
    //     }
    // }
})();