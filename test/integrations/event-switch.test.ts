// import { ServiceContainer } from "@/services/service_container";
// import { expect, jest, test, beforeAll } from '@jest/globals';
// import { poolAbi } from "@/typechain/abis/aavePool.abi";
// import { EventHelper } from "@/utils/helpers/event.helper";
// import { ArbitrageMonitor } from "@/scripts/arbitrage_monitor";
// import { EventController } from "@/controllers/event.controller";

// let arbitrageMonitor: ArbitrageMonitor;

// const blockToAdd = 50n;
// let fromBlockNumber;
// let toBlockNumber: any;
// let events: any;

// beforeAll(async (
// ) => {
//     jest.spyOn(console, 'error').mockImplementation(() => { });
//     await ServiceContainer.initialize();
//     arbitrageMonitor = new ArbitrageMonitor();

//     fromBlockNumber = ServiceContainer.viemService.blockNumber;
//     toBlockNumber = ServiceContainer.viemService.blockNumber + blockToAdd;
//     events = await ServiceContainer.eventController.getContractEvents(ServiceContainer.viemService.poolContract, poolAbi, blockToAdd);
//     const usersToAdd = await EventHelper.extractUsersFromEvents(events);

//     await arbitrageMonitor.fetchData(usersToAdd, true);
//     await ServiceContainer.eventController.processEvents(events);
// }, 10000);

// test("reserves from chain and bdd should be exactly the same when events update data", async () => {
//     const reserveFromDB = await ServiceContainer.reserveController.fetchAllReserves();
//     const reserveFromChain = await ServiceContainer.reserveController.reserveRepository.fetchReservesData(toBlockNumber);

//     for (const event of events) {
//         switch (event.eventName) {
//             case EventNames.ReserveDataUpdated: // triggered each time reserve data is updated
//                 await ServiceContainer.reserveController?.updateReserve(`asset_address = '${event.args.reserve}'`, {
//                     liquidity_index: BigInt(event.args.liquidityIndex),
//                     variable_borrow_index: BigInt(event.args.variableBorrowIndex),
//                     last_updated: BigInt(event.blockTimestamp * 1000),
//                 });
//                 break;
//             case EventNames.Supply: // provide collateral
//                 console.log("Event %s :: + %s to %s, reserve atoken %s ", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
//                 await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.args.onBehalfOf}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'increment');
//                 break;
//             case EventNames.Withdraw: // recover collateral
//                 console.log("Event %s :: - %s to %s, reserve atoken %s", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
//                 await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'decrement');
//                 break;
//             case EventNames.Borrow: // borrow funds
//                 console.log("Event %s :: + %s to %s, reserve debtoken %s", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
//                 await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.onBehalfOf}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'increment');
//                 break;
//             case EventNames.Repay: // repay borrowed funds
//                 console.log("Event %s :: - %s to %s, reserve debtoken %s", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
//                 await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'decrement');
//                 break;
//             case EventNames.LiquidationCall:
//                 console.log("Event %s :: - %s to %s, reserve debtoken %s", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
//                 await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.collateralAsset}'`, BigInt(event.args.liquidatedCollateralAmount), 'decrement');
//                 await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.debtAsset}'`, BigInt(event.args.debtToCover), 'decrement');
//                 break;
//         };
//     }


//     expect(reserveFromDB.length).toEqual(reserveFromChain.length);

//     for (const reserve of reserveFromDB) {
//         const reserveFromFetch = reserveFromChain.find(r => r.assetAddress === reserve.assetAddress);
//         expect(reserveFromFetch).toBeTruthy();
//         expect(reserve).toEqual(reserveFromFetch);
//     }
// });