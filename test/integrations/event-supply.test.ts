import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';
import { poolAbi } from "@/typechain/abis/aavePool.abi";
// import { EventHelper } from "@/utils/helpers/event.helper";
import { ArbitrageMonitor } from "@/scripts/arbitrage_monitor";
import { Helpers } from "@/utils/helpers.utils";

let arbitrageMonitor: ArbitrageMonitor;

const blockToAdd = 2n;
let fromBlockNumber;
let toBlockNumber: any;
let events: any;
let usersToAdd: any;

// -   "scaledATokenBalance": 26971924n,
// +   "scaledATokenBalance": 27790371n,,,

beforeAll(async () => {
    jest.spyOn(console, 'info').mockImplementation(() => { });
    await ServiceContainer.initialize();
    arbitrageMonitor = new ArbitrageMonitor();
    await ServiceContainer.dbService.resetDatabase();
    
    fromBlockNumber = ServiceContainer.viemService.blockNumber + 1n;
    toBlockNumber = fromBlockNumber + blockToAdd;

    events = await ServiceContainer.eventController.fetchContractEvents(ServiceContainer.viemService.poolContract, poolAbi, fromBlockNumber, toBlockNumber);
    usersToAdd = await ServiceContainer.eventController.extractUsersFromEvents(events);

    expect(usersToAdd.length).toBeGreaterThan(0);
    
    await arbitrageMonitor.fetchData(usersToAdd, true);

    for (const user of arbitrageMonitor.users) {
        expect(usersToAdd.includes(user.address)).toBeTruthy();
    }
    const eventsCount = ServiceContainer.eventController.eventCounts(events)
    console.log("[EVENTS] :: %s fetch from chain\n", events.length, eventsCount);

}, 50000);

test("user reserves before events should be exactly the same as from chain", async () => { 
    for (const user of arbitrageMonitor.users) {
        const userReservesBeforeFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
        const userReservesBeforeFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address);
        expect(userReservesBeforeFromDB.length).toEqual(userReservesBeforeFromChain.length);

        for (const reserve of userReservesBeforeFromDB) {
            const reserveBeforeFromChain = userReservesBeforeFromChain.find(r => r.assetAddress === reserve.assetAddress);
            expect({ ...reserveBeforeFromChain, lastUpdated: 0 }).toEqual({ ...reserve, lastUpdated: 0 });
        }
    }
    return true;
});

test("user reserves from chain and bdd should be exactly the same when events update data (All events)", async () => {
    let count = 0;
    await ServiceContainer.eventController.processEventsWithBalance(events);

    for (const user of arbitrageMonitor.users) {

        const userReservesAfterFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
        const userReservesAfterFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

        for(const reserve of userReservesAfterFromDB) {
            const reserveFromChain = userReservesAfterFromChain.find(r => r.assetAddress === reserve.assetAddress);
            expect(reserveFromChain).toBeTruthy();
            expect({ ...reserve, lastUpdated: 0 }).toEqual({ ...reserveFromChain, lastUpdated: 0 });
            // console.log('Passed : ', user.address, 'BDD', reserve.scaledATokenBalance, ' CHAIN ', reserveFromChain?.scaledATokenBalance);
        }
        count++;
        console.log("[PASSED]", count);
    }

    return true;
}, 50000);



test.skip("user reserves from chain and bdd should be exactly the same when events update data (All events)", async () => {
    //TODO add event from paraswap swap and repay https://basescan.org/address/0x63dfa7c09dc2ff4030d6b8dc2ce6262bf898c8a4#writeContract
    // or understand it deeply
    let count = 0;
    await ServiceContainer.eventController.processEvents(events);
    console.log(events);


    for (const user of arbitrageMonitor.users) {

        const userReservesAfterFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
        const userReservesAfterFromChain = await ServiceContainer.userReserveController.userReserveRepository.fetchUserReservesData(user.address, toBlockNumber);

        for (const reserve of userReservesAfterFromDB) {
            const reserveFromChain = userReservesAfterFromChain.find(r => r.assetAddress === reserve.assetAddress);
            expect(reserveFromChain).toBeTruthy();
            expect({ ...reserve, lastUpdated: 0 }).toEqual({ ...reserveFromChain, lastUpdated: 0 });
            // console.log('Passed : ', user.address, 'BDD', reserve.scaledATokenBalance, ' CHAIN ', reserveFromChain?.scaledATokenBalance);
        }
        count++;
        console.log("[PASSED]", count);
    }

    return true;
}, 50000);















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
