import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';
import { poolAbi } from "@/typechain/abis/aavePool.abi";
import { Event } from "@/models/event.model";


beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
});


test("should fetch reserve data from protocol and store it in bdd", async () => {
    const events: Event[] = await ServiceContainer.eventController.fetchContractEvents(ServiceContainer.viemService.poolContract, poolAbi, 20n, "Supply");
    await ServiceContainer.eventController.insertEvents(events);

    const eventsFromDB = await ServiceContainer.eventController.fetchAllEvents();

    console.log(eventsFromDB.length);

    for (const event of events) {
        const eventFromFetch = eventsFromDB.find(r => r.transactionHash === event.transactionHash);
        expect(eventFromFetch).toBeTruthy();
        expect(eventFromFetch).toEqual(event);
    }

    const count = await ServiceContainer.eventController.getEventsCount();

    expect(count).toEqual(events.length);
    expect(count).toEqual(eventsFromDB.length);
});