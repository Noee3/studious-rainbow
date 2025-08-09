
import assert from 'assert';
import { ArbitrageMonitor } from "./scripts/arbitrage_monitor";
import { ServiceContainer } from "./services/service_container";
import { poolAbi } from "./typechain/abis/aavePool.abi";
// import { EventHelper } from './utils/helpers/event.helper';
import { ReportData } from './models/report.model';
import { ValidationUtils } from './utils/validation.utils';
import { dateFromTimestampValue } from '@duckdb/node-api';


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
(async () => {
    //do it in test, verify data directly, arbitrage monitor is to start the script;

    await ServiceContainer.initialize();

    const blockToAdd = 50n;
    const fromBlockNumber = ServiceContainer.viemService.blockNumber;
    const toBlockNumber = ServiceContainer.viemService.blockNumber + blockToAdd;

    const arbitrageMonitor: ArbitrageMonitor = new ArbitrageMonitor();
    // await arbitrageMonitor.start(100, true);

    // return;

    const events = await ServiceContainer.eventController.fetchContractEvents(ServiceContainer.viemService.poolContract, poolAbi, blockToAdd);
    const usersToAdd = await ServiceContainer.eventController.extractUsersFromEvents(events);

    await arbitrageMonitor.fetchData(usersToAdd, false);
    await ServiceContainer.eventController.processEvents(events);


    // Compare reserve;
    const reserveStored = await ServiceContainer.reserveController.fetchAllReserves();
    const reserveFetch = await ServiceContainer.reserveController.reserveRepository.fetchReservesData(toBlockNumber);
    // console.log(reserveStored[0], reserveFetch[0]);

    // console.log(reserveStored);
    // console.log(reserveFetch);

    for (const reserve of reserveStored) {
        const reserveFromFetch = reserveFetch.find(r => r.assetAddress === reserve.assetAddress);
        assert(reserveFromFetch, `Reserve not found in fetched data for asset: ${reserve.assetAddress}`);
        // assert.equal({ ...reserve, lastUpdated: 0 }, { ...reserveFromFetch, lastUpdated: 0 }, `Reserve data mismatch for asset: ${reserve.assetAddress}`);
        assert.deepEqual(reserve, reserveFromFetch, `Reserve data mismatch for asset: ${reserve.assetAddress}`);
    }

    assert.equal(reserveStored.length, reserveFetch.length, "Reserve count mismatch between stored and fetched data");

    for (const user of arbitrageMonitor.users) {
        const userReservesFromBDD = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
        const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address);

        for (const reserve of userReservesFromBDD) {
            const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
            assert(reserveFromChain, `Reserve not found in fetched data for asset: ${reserve.assetAddress}`);

        }

        // assert(userReserves.length > 0, `No user reserves found for user: ${user.address}`);
        // assert.deepEqual(reserve, reserveFromFetch, `Reserve data mismatch for asset: ${reserve.assetAddress}`);

    }

    return;
    let reports: ReportData[] = [];

    for (const user of arbitrageMonitor.users) {
        const userAccountDataFromCalculation = await arbitrageMonitor.computeLiquidationOpportunitiesForUser(user);
        const userAccountDataFromChain = await ServiceContainer.userController.fetchUserAccountData(user.address, toBlockNumber);
        console.log(userAccountDataFromCalculation + '\n------');
        console.log(userAccountDataFromChain);

        const report: ReportData = new ReportData(
            user.address,
            userAccountDataFromCalculation,
            userAccountDataFromChain,
        );
        reports.push(report);

    }

    await ValidationUtils.assertionWithTolerance(reports);
    console.log("[ArbitrageMonitor] :: Liquidation opportunities computed successfully");





    // get account data to verify if data get from event are correctly store
    // get user reserve data to verify if data get from event are correctly store;




    // const userReserveAfter = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '0x00000002d88f9b3f4eb303564817fff4adcde46f' AND asset_address = '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22'`);
    // console.log(userReserveAfter);
    return;

})();