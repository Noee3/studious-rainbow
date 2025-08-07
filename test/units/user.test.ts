import { ServiceContainer } from "@/services/service_container";
import { expect, jest, test, beforeAll, beforeEach } from '@jest/globals';
import { Address } from "viem";

const usersAddress = [
    '0xa089f783c32f694d4cea66fd03c88971766a3c26',
    '0xf564ed378b90b40c82dd909358b03ec616404373',
    '0x0d0e319054c5a87f4631dd488e37f44d696e4d9b',
    '0x25a7cc2a243cdb9a4475d3d86d51d3c60df72049',
    '0xa0d9c1e9e48ca30c8d8c3b5d69ff5dc1f6dffc24',
] as Address[];

beforeEach(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
    await ServiceContainer.eModeCategoryController.init();
});


test("should fetch users data from protocol by address and store it in bdd", async () => {

    const users = await ServiceContainer.userController.init(usersAddress)
    const count = await ServiceContainer.userController.getUsersCount();


    expect(count).toEqual(users.length);
    expect(count).toEqual(usersAddress.length);
});


test("should fetch users data by limit and store it in bdd", async () => {
    const limit = 5;
    const users = await ServiceContainer.userController.init(limit);
    const count = await ServiceContainer.userController.getUsersCount();

    expect(count).toEqual(users.length);
    expect(count).toEqual(limit);
});

