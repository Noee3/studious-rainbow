import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';


beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
});

test("should fetch assets data from protocol and store it in bdd", async () => {
    const assets = await ServiceContainer.assetController.init();
    const count = await ServiceContainer.assetController.getAssetsCount();
    expect(count).toEqual(assets.length);
});
