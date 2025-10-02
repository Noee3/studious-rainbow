import { User } from "@/models/user.model";
import { ServiceContainer } from "@/services/service_container";
import { rayDiv } from "@/utils/math.utils";
import { expect, jest, test, beforeAll } from '@jest/globals';
import { Address } from "viem";


const usersAddress = [
    '0xa089f783c32f694d4cea66fd03c88971766a3c26',
    '0xf564ed378b90b40c82dd909358b03ec616404373',
    '0x0d0e319054c5a87f4631dd488e37f44d696e4d9b',
    '0x25a7cc2a243cdb9a4475d3d86d51d3c60df72049',
    '0xa0d9c1e9e48ca30c8d8c3b5d69ff5dc1f6dffc24',
] as Address[];

let users: User[] = [];

beforeAll(async (
) => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    await ServiceContainer.initialize();
    await ServiceContainer.dbService.resetDatabase();
    await ServiceContainer.assetController.init();
    await ServiceContainer.reserveController.init();
    users = await ServiceContainer.userController.init(usersAddress);
});


test("should fetch user reserves data from protocol and store it in bdd", async () => {

    for (const user of users) {
        const userReserves = await ServiceContainer.userReserveController.init(user.address);
        const userCount = await ServiceContainer.userReserveController.getUserReservesCount(`user_address = '${user.address}'`);
        expect(userReserves.length).toEqual(userCount);
    }
});

test("user reserves from chain and bdd should be exactly the same", async () => {
    for (const user of users) {
        const userReserves = await ServiceContainer.userReserveController.init(user.address);
        const userReservesFetch = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);
        const count = await ServiceContainer.userReserveController.getUserReservesCount(`user_address = '${user.address}'`);

        for (const userReserve of userReserves) {
            const userReserveFromFetch = userReservesFetch.find(r => r.userAddress === userReserve.userAddress && r.assetAddress === userReserve.assetAddress);
            expect(userReserveFromFetch).toBeTruthy();
            expect(userReserve).toEqual(userReserveFromFetch);
        }

        expect(userReserves.length).toEqual(count);
    }
});


test("user reserve balance from chain and bdd should be exactly the same", async () => {
    const reserves = await ServiceContainer.reserveController.fetchAllReserves();

    for (const user of users) {
        const userReservesFromChain = await ServiceContainer.userReserveController.init(user.address);
        const userReservesFetchFromDB = await ServiceContainer.userReserveController.fetchAllUserReserves(`user_address = '${user.address}'`);

        for (const userReserve of userReservesFromChain) {

            const userReserveFromFetch = userReservesFetchFromDB.find(r => r.userAddress === userReserve.userAddress && r.assetAddress === userReserve.assetAddress);

            const currentReserve = reserves.find(r => r.assetAddress === userReserve.assetAddress);
            const aTokenAddress = currentReserve!.aTokenAddress;
            const variableDebtTokenAddress = currentReserve!.variableDebtTokenAddress;

            const scaledATokenBalance = await ServiceContainer.userReserveController.fetchUserScaledTokenBalance(user.address, aTokenAddress);
            const scaledVariableDebtTokenBalance = await ServiceContainer.userReserveController.fetchUserScaledTokenBalance(user.address, variableDebtTokenAddress);

            expect(scaledVariableDebtTokenBalance).toEqual(userReserveFromFetch!.scaledVariableDebt);
            expect(scaledATokenBalance).toEqual(userReserveFromFetch!.scaledATokenBalance);
        }
    }
}, 50000);