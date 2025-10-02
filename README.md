
Aave V3 monitoring bot
=================

Verify : https://defisim.xyz/?address=0x00000002d88f9b3f4eb303564817fff4adcde46f
SUBGRAPH : https://thegraph.com/explorer/subgraphs/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF?view=Query&chain=arbitrum-one

1. Pool.getUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/main/src/contracts/protocol/pool/Pool.sol
    1.1 PoolLogic.executeGetUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/logic/PoolLogic.sol#L195
        - DataType.reserveData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L42
        - DataType.eModeCategory : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L140
        - DataType.CalculateUserAccountDataParams : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L284
        - DataType.userConfigurationMap : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L107
    1.2 GenericLogic.calculateUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/logic/GenericLogic.sol#L64


- Need to fork the blockchain at a block T, until a block X where there were liquidations! to see if the script detects the opportunity ( filter selector 0x00a718a9)
- e.g : https://etherscan.io/advanced-filter?fadd=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2&tadd=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2&mtd=0x00a718a9%7eLiquidation+Call