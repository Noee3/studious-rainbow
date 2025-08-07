// import { ServiceContainer } from "@/services/service_container";
// import { expect, jest, test, beforeAll } from '@jest/globals';
// import { poolAbi } from "@/typechain/abis/aavePool.abi";
// import { EventHelper } from "@/utils/helpers/event.helper";
// import { ArbitrageMonitor } from "@/scripts/arbitrage_monitor";
// import { EventController } from "@/controllers/event.controller";
// import { Helpers } from "@/utils/helpers.utils";

// let arbitrageMonitor: ArbitrageMonitor;

// const blockToAdd = 20n;
// let fromBlockNumber;
// let toBlockNumber: any;
// let events: any;
// let usersToAdd: any;

// beforeAll(async (
// ) => {
//   jest.spyOn(console, 'info').mockImplementation(() => { });
//   await ServiceContainer.initialize();
//   arbitrageMonitor = new ArbitrageMonitor();
//   fromBlockNumber = ServiceContainer.viemService.blockNumber;
//   toBlockNumber = ServiceContainer.viemService.blockNumber + blockToAdd;
//   events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, blockToAdd);
//   usersToAdd = await EventHelper.extractUsersFromEvents(events);
//   await arbitrageMonitor.fetchData(usersToAdd, true);

//   console.log(EventHelper.eventCounts(events));
//   // const eventuser = events.map((e: any) => (e.args.onBehalfOf === '0x02425ff30c1e06ca1387a1c98698b4df973232cd' || e.args.user === '0x02425ff30c1e06ca1387a1c98698b4df973232cd' || e.args.to === '0x02425ff30c1e06ca1387a1c98698b4df973232cd') ? e : null).filter((e: any) => e);

//   // console.log("Event user", eventuser);
// }, 50000);


// test("reserves from chain and bdd should be exactly the same when events update data (ReserveUpdateData events)", async () => {
//   await arbitrageMonitor.fetchData(usersToAdd, true);
//   for (const user of arbitrageMonitor.users) {
//     expect(usersToAdd.includes(user.address)).toBeTruthy();
//   }
//   return true;
// }, 20000);


// test("arbitrageMonitor.users should have correct structure after fetchData", async () => {
//   let eventsReserveDataUpdated = events.filter((event: { eventName: string; }) => event.eventName === 'ReserveDataUpdated');
//   await ServiceContainer.eventController.processEvents(eventsReserveDataUpdated);

//   const reserveFromDB = await ServiceContainer.reserveController.fetchAllReserves();
//   const reserveFromChain = await ServiceContainer.reserveController.reserveRepository.fetchReservesData(toBlockNumber);
//   expect(reserveFromDB.length).toEqual(reserveFromChain.length);
   
//   for (const reserve of reserveFromDB) {
//     const reserveFromFetch = reserveFromChain.find(r => r.assetAddress === reserve.assetAddress);
//       expect(reserveFromFetch).toBeTruthy();
//       expect(reserve).toEqual(reserveFromFetch);
//   }
//   return true;
// });


// test("user reserves from chain and bdd should be exactly the same when events update data (Withdraw events)", async () => {
//   const eventsSupply = events.filter((event: { eventName: string; }) => event.eventName === 'Withdraw');
//   const usersAddress = eventsSupply.map((e: any) => e.user);
//   const users = arbitrageMonitor.users.filter((u: any) => usersAddress.includes(u.address));
  
//   await ServiceContainer.eventController.processEvents(eventsSupply);
  
//   for (const user of users) {
//     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//     for (const reserve of userReservesFromDB) {
//       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
//       expect(reserveFromChain).toBeTruthy();
//       expect(reserve).toEqual(reserveFromChain);
//     }
//   }
// }); 


// test("user reserves from chain and bdd should be exactly the same when events update data (Borrow events)", async () => {
//   const eventsSupply = events.filter((event: { eventName: string; }) => event.eventName === 'Borrow');
//   const usersAddress = eventsSupply.map((e: any) => e.onBehalfOf);
//   const users = arbitrageMonitor.users.filter((u: any) => usersAddress.includes(u.address));

//   await ServiceContainer.eventController.processEvents(eventsSupply);

//   for (const user of users) {
//     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//     for (const reserve of userReservesFromDB) {
//       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
//       expect(reserveFromChain).toBeTruthy();
//       expect(reserve).toEqual(reserveFromChain);
//     }
//   }
// });



// test("user reserves from chain and bdd should be exactly the same when events update data (Repay events)", async () => {
//   const eventsSupply = events.filter((event: { eventName: string; }) => event.eventName === 'Repay');
//   const usersAddress = eventsSupply.map((e: any) => e.user);
//   const users = arbitrageMonitor.users.filter((u: any) => usersAddress.includes(u.address));

//   await ServiceContainer.eventController.processEvents(eventsSupply);

//   for (const user of users) {
//     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//     for (const reserve of userReservesFromDB) {
//       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
//       expect(reserveFromChain).toBeTruthy();
//       expect(reserve).toEqual(reserveFromChain);
//     }
//   }
// });


// test("user reserves from chain and bdd should be exactly the same when events update data (LiquidationCall events)", async () => {
//   const eventsSupply = events.filter((event: { eventName: string; }) => event.eventName === 'LiquidationCall');
//   const usersAddress = eventsSupply.map((e: any) => e.user);
//   const users = arbitrageMonitor.users.filter((u: any) => usersAddress.includes(u.address));

//   await ServiceContainer.eventController.processEvents(eventsSupply);

//   for (const user of users) {
//     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
//     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

//     for (const reserve of userReservesFromDB) {
//       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
//       expect(reserveFromChain).toBeTruthy();
//       expect(reserve).toEqual(reserveFromChain);
//     }
//   }
// });


// // test("user reserves from chain and bdd should be exactly the same when events update data (Supply events)", async () => {

// //   events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, blockToAdd);

// //   const eventsSupply = events.filter((event: { eventName: string; }) => event.eventName === 'Supply');
// //   const usersAddress = eventsSupply.map((e: any) => e.args.onBehalfOf);
// //   console.log("ADDRESS", usersAddress);
  
  

// //   for (const user of arbitrageMonitor.users) {
// //     expect(usersToAdd.includes(user.address)).toBeTruthy();
// //   }
  
// //   for (const user of arbitrageMonitor.users) {
// //       const userReservesBeforeFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
// //       const userReservesBeforeFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address);
    
// //     for (const reserve of userReservesBeforeFromDB) {

// //       const reserveBeforeFromChain = userReservesBeforeFromChain.find(r => r.assetAddress === reserve.assetAddress);
// //       const reserveBeforeFromDB = userReservesBeforeFromDB.find(r => r.assetAddress === reserve.assetAddress);
// //       expect(reserveBeforeFromChain).toEqual(reserveBeforeFromDB);

// //       // await ServiceContainer.eventController.processEvents(eventsSupply.filter((e: any) => e.args.onBehalfOf === user.address && e.args.reserve === reserve.assetAddress));

// //       // const userReservesAfterFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}' AND asset_address = '${reserve.assetAddress}'`);
// //       // const userReservesAfterFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

// //       // const reserveFromChain = userReservesAfterFromChain.find(r => r.assetAddress === reserve.assetAddress);
// //       //     console.log(reserve);
// //       //     console.log(reserveFromChain);
// //       //     expect(reserveFromChain).toBeTruthy();
// //       // expect(userReservesAfterFromDB[0]).toEqual(reserveFromChain);
// //         }
// //     }
// // });


// // test("user reserves from chain and bdd should be exactly the same when events update data (All events)", async () => {
// //   await ServiceContainer.eventController.processEvents(events);

// //   for (const user of arbitrageMonitor.users) {
// //     const userReservesFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
// //     const userReservesFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

// //     for (const reserve of userReservesFromDB) {
// //       const reserveFromChain = userReservesFromChain.find(r => r.assetAddress === reserve.assetAddress);
// //         expect(reserveFromChain).toBeTruthy();
// //         expect({ ...reserve, lastUpdated: 0 }).toEqual({ ...reserveFromChain, lastUpdated: 0 });
// //     }
// //   }
// // });















// //need to test reserve with event update;
// //need to test userReserve with Update;

// // test("should fetch data from protocol", async () => {

// //   await ServiceContainer.initialize();
// //   arbitrageMonitor = new ArbitrageMonitor();
// //   const events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 20n);
// //   const usersToAdd = await EventHelper.extractUsersFromEvents(events);

// //   await arbitrageMonitor.fetchData(usersToAdd, false);

// //   ServiceContainer.eventController.processEvents(events);

// //   for (const user of arbitrageMonitor.users) {
// //     const userAccountDataCalculation = await arbitrageMonitor.computeLiquidationOpportunitiesForUser(user);
// //     const userAccountDataOnChain = await ServiceContainer.userController.fetchUserAccountData(user.address);
// //   }




// //   // process events;
// //   // getUserReserveData at blocknumber + 100n and compare with arbitageMonitor user reserve data;
// //   // do the same for reserve;
// //   // do the same for user accountData when computing;



// //   // const { reservesData, assets } = await ServiceContainer.reserveController.init(ServiceContainer.assetController);
// //   // this.reserves = reservesData;
// //   // this.assets = assets;

// //   // const events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 100n);
// //   // expect(events.length).toBeGreaterThan(0);


// //   // const usersToAdd = await EventHelper.extractUsersFromEvents(events);
// //   // expect(usersToAdd.length).toBeGreaterThan(0);

// //   // await ServiceContainer.userController.fetchAllUsersByAddress(usersToAdd);


// //   /*
 
// //   donc d'abord récupérer les events, les users associé;
// //   créer les users;
// //   refaire le tour des events;
 
// //   EN gros, il faut que je recupère tous les events de block x à block x + 500 (via viem rpc) et je compare avec les données récupéré depuis accountData;
// //   step 1, écouter tout les events
// //   step 2, faire bdd de test,
// //   step 3, test;
  
// //   */
// // });
