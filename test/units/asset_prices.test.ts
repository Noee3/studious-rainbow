import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';


beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
});


test("should fetch asset data from protocol and store it in bdd", async () => {
    const assets = await ServiceContainer.assetController.init();
    const assetPrices = await ServiceContainer.assetPriceController.init(assets);

    const count = await ServiceContainer.assetPriceController.getAssetPricesCount();
    expect(count).toEqual(assetPrices.length);
    expect(count).toEqual(assets.length);
});

