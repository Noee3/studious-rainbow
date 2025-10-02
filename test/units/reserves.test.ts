import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';
import { poolAbi } from "@/typechain/abis/aavePool.abi";
import { Reserve } from "@/models/reserve.model";


let reserves: Reserve[] = [];


beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
    await ServiceContainer.assetController.init();
    reserves = await ServiceContainer.reserveController.init();
    console.log(reserves);
});


test("should fetch reserve data from protocol and store it in bdd", async () => {
    const count = await ServiceContainer.reserveController.getReservesCount();
    expect(count).toEqual(reserves.length);
});


test("reserves from chain and bdd should be exactly the same", async () => {
    const reservesFetched = await ServiceContainer.reserveController.fetchAllReserves();

    for (const reserve of reserves) {
        const reserveFromFetch = reservesFetched.find(r => r.assetAddress === reserve.assetAddress);
        expect(reserveFromFetch).toBeTruthy();
        expect(reserve).toEqual(reserveFromFetch);
    }

    const count = await ServiceContainer.reserveController.getReservesCount();
    expect(count).toEqual(reserves.length);
    expect(count).toEqual(reservesFetched.length);
});

