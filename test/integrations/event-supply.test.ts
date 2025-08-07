import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';
import { poolAbi } from "@/typechain/abis/aavePool.abi";
import { EventHelper } from "@/utils/helpers/event.helper";
import { ArbitrageMonitor } from "@/scripts/arbitrage_monitor";
import { EventController } from "@/controllers/event.controller";
import { Helpers } from "@/utils/helpers.utils";

let arbitrageMonitor: ArbitrageMonitor;

const blockToAdd = 20n;
let fromBlockNumber;
let toBlockNumber: any;
let events: any;
let usersToAdd: any;

beforeAll(async () => {
    
    jest.spyOn(console, 'info').mockImplementation(() => { });
    await ServiceContainer.initialize();
    arbitrageMonitor = new ArbitrageMonitor();
   await ServiceContainer.dbService.resetDatabase();

    fromBlockNumber = ServiceContainer.viemService.blockNumber;
    toBlockNumber = fromBlockNumber + blockToAdd;

    events = await ServiceContainer.eventNewController.fetchContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 20n);
    await ServiceContainer.eventNewController.insertEvents(events);
    const newEvents = await ServiceContainer.eventNewController.fetchAllEvents();
    console.log(newEvents);

    // events = await ServiceContainer.eventController.fetchContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 20n);

    // console.log(events.filter((e: any) => e.eventName === "withdraw"));
    // usersToAdd = await EventHelper.extractUsersFromEvents(events);
    
    // await arbitrageMonitor.fetchData(usersToAdd, true);

    // for (const user of arbitrageMonitor.users) {
    //     expect(usersToAdd.includes(user.address)).toBeTruthy();
    //     // let userEvents = events.filter((e: any) => e.onBehalfOf === user.address || e.user === user.address);
    //     // console.log("events for user %s, %s", user.address, userEvents.length,);
    // }
    console.log(EventHelper.eventCounts(events));

}, 50000);



test("user reserves from chain and bdd should be exactly the same when events update data (Supply events)", async () => {

//   for (const user of arbitrageMonitor.users) {
//     expect(usersToAdd.includes(user.address)).toBeTruthy();
//   }
  
//   for (const user of arbitrageMonitor.users) {
//       const userReservesBeforeFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//       const userReservesBeforeFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address);

//       expect(userReservesBeforeFromDB.length).toEqual(userReservesBeforeFromChain.length);
    
//         for (const reserve of userReservesBeforeFromDB) {
//             const reserveBeforeFromChain = userReservesBeforeFromChain.find(r => r.assetAddress === reserve.assetAddress);
//             expect({ ...reserveBeforeFromChain, lastUpdated: 0 }).toEqual({ ...reserve, lastUpdated: 0 });

//             console
            
//             await ServiceContainer.eventController.processEvents(events);

//             const userReservesAfterFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}' AND asset_address = '${reserve.assetAddress}'`);
//             const userReservesAfterFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//             const reserveFromChain = userReservesAfterFromChain.find(r => r.assetAddress === reserve.assetAddress);
//             expect(reserveFromChain).toBeTruthy();
//             expect({ ...userReservesAfterFromDB[0], lastUpdated: 0 }).toEqual({ ...reserveFromChain, lastUpdated: 0 });
//             console.log('Passed : ', user.address, 'BDD', userReservesAfterFromDB[0].scaledATokenBalance, ' CHAIN ', reserveFromChain?.scaledATokenBalance);
//         }
//   }
//     return true;
}, 50000);


// test("user reserves from chain and bdd should be exactly the same when events update data (All events)", async () => {
//   await ServiceContainer.eventController.processEvents(events);

//   for (const user of arbitrageMonitor.users) {
//     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//     for (const reserve of userReservesFromDB) {
//       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
//         expect(reserveFromChain).toBeTruthy();
//         expect({ ...reserve, lastUpdated: 0 }).toEqual({ ...reserveFromChain, lastUpdated: 0 });
//     }
//   }
// });















//need to test reserve with event update;
//need to test userReserve with Update;

// test("should fetch data from protocol", async () => {

//   await ServiceContainer.initialize();
//   arbitrageMonitor = new ArbitrageMonitor();
//   const events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 20n);
//   const usersToAdd = await EventHelper.extractUsersFromEvents(events);

//   await arbitrageMonitor.fetchData(usersToAdd, false);

//   ServiceContainer.eventController.processEvents(events);

//   for (const user of arbitrageMonitor.users) {
//     const userAccountDataCalculation = await arbitrageMonitor.computeLiquidationOpportunitiesForUser(user);
//     const userAccountDataOnChain = await ServiceContainer.userController.fetchUserAccountData(user.address);
//   }




//   // process events;
//   // getUserReserveData at blocknumber + 100n and compare with arbitageMonitor user reserve data;
//   // do the same for reserve;
//   // do the same for user accountData when computing;



//   // const { reservesData, assets } = await ServiceContainer.reserveController.init(ServiceContainer.assetController);
//   // this.reserves = reservesData;
//   // this.assets = assets;

//   // const events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 100n);
//   // expect(events.length).toBeGreaterThan(0);


//   // const usersToAdd = await EventHelper.extractUsersFromEvents(events);
//   // expect(usersToAdd.length).toBeGreaterThan(0);

//   // await ServiceContainer.userController.fetchAllUsersByAddress(usersToAdd);


//   /*
 
//   donc d'abord récupérer les events, les users associé;
//   créer les users;
//   refaire le tour des events;
 
//   EN gros, il faut que je recupère tous les events de block x à block x + 500 (via viem rpc) et je compare avec les données récupéré depuis accountData;
//   step 1, écouter tout les events
//   step 2, faire bdd de test,
//   step 3, test;
  
//   */
// });
