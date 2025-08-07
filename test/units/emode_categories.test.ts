import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll } from '@jest/globals';


beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
});

test("should fetch emode categories data from protocol and store it in bdd", async () => {
    const categories = await ServiceContainer.eModeCategoryController.init();
    const count = await ServiceContainer.eModeCategoryController.getEmodeCategoriesCount();
    expect(count).toEqual(categories.length);
});
