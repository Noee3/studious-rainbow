
import { ServiceContainer } from "./services/service_container";

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



// export interface Event {
//     eventName: string;
//     args: any;
//     address: Address;
//     topics: string[],
//     data: string,
//     blockHash: string,
//     blockNumber: bigint,
//     blockTimestamp: string,
//     transactionHash: string,
//     transactionIndex: number,
//     logIndex: number,
//     removed: boolean
// };



(async () => {
    try {
        await ServiceContainer.initialize();

    } catch (e) {
        console.error(e);
    }
})();