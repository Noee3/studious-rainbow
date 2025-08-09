import { createPublicClient, erc20Abi, http } from 'viem';
import { uiPoolDataProviderAbi } from "./typechain/abis/aaveUiPoolDataProvider.abi";
import { poolAbi } from "./typechain/abis/aavePool.abi";

import { base } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();
const { BASE_RPC_URL } = process.env;

const blockNumber = 28610727n;
const toBlockNumber = 28610729n;
const poolContract = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
const uiPoolDataProviderAddress = "0x68100bD5345eA474D93577127C11F39FF8463e93";
const addressProvider = "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D";
const aBasUSDbC = "0x0a1d576f3eFeF75b330424287a95A366e8281D54";

const user = "0x259bde8429c62e48bf9bb781baae572677a65f42";

const client = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
});

(async () => {
    try {
        const result = await getBalanceOf();
        console.log(result);
    } catch (error) {
        console.error("Sender failed:", JSON.stringify(error));
    }
})();

async function getBalanceOf() {
    return await client.readContract({
        address: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca",
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: ["0xF6C0A374a483101e04EF5F7Ac9Bd15d9142BAC95"],
        // blockNumber: 28610729n,
    });
}

async function readUserReserveData() {
    return await client.readContract({
        address: uiPoolDataProviderAddress,
        abi: uiPoolDataProviderAbi,
        functionName: 'getUserReservesData',
        args: [addressProvider, '0x259bde8429c62e48bf9bb781baae572677a65f42'], // Example user address
        blockNumber: 28610727n,
    });
}
/*
    0x259bde8429c62e48bf9bb781baae572677a65f42
    à block 28610728n;
    {
      underlyingAsset: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      scaledATokenBalance: 175394196n,
      usageAsCollateralEnabledOnUser: true,
      scaledVariableDebt: 0n
    },
    {
      underlyingAsset: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
      scaledATokenBalance: 0n,
      usageAsCollateralEnabledOnUser: false,
      scaledVariableDebt: 41387619743239444n
    },
     à block 28610729n;
    {
      underlyingAsset: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      scaledATokenBalance: 108828794n,
      usageAsCollateralEnabledOnUser: true,
      scaledVariableDebt: 0n
    },
    {
      underlyingAsset: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
      scaledATokenBalance: 0n,
      usageAsCollateralEnabledOnUser: false,
      scaledVariableDebt: 0n
    },
    175394196n,
    73904418n
    175394196n - 73904418n = 101489078n
*/


async function fetchEvents() {
    return await client.getContractEvents({
        address: poolContract,
        abi: poolAbi,
        fromBlock: blockNumber,
        toBlock: toBlockNumber,
    });
}