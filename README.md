
Verify interface : https://defisim.xyz/?address=0x00000002d88f9b3f4eb303564817fff4adcde46f
SUBGRAPH : https://thegraph.com/explorer/subgraphs/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF?view=Query&chain=arbitrum-one
getUserAccountData(0x00000655388d579492cf53ca6f490eaa30711112) : https://basescan.org/address/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5#readProxyContract 

1. Pool.getUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/main/src/contracts/protocol/pool/Pool.sol
    1.1 PoolLogic.executeGetUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/logic/PoolLogic.sol#L195
        - DataType.reserveData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L42
        - DataType.eModeCategory : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L140
        - DataType.CalculateUserAccountDataParams : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L284
        - DataType.userConfigurationMap : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/types/DataTypes.sol#L107
    1.2 GenericLogic.calculateUserAccountData : https://github.com/aave-dao/aave-v3-origin/blob/312a899aaa9f7f4685d051d13185ada1902a2730/src/contracts/protocol/libraries/logic/GenericLogic.sol#L64



- Etapes : 
    1. Récupérer toutes les addresses de user via subgraph ✅
    2. Récupérer les reservesData ✅
        - ltv
        - liquidationThreshold
        - decimals
        - oracle
    3. Pour chaque user, récupérer les données de collatéral et de dette
        - address collateralAsset (underlying)
        - scaledATokenBalance (collateral balance)
        - scaledVariableDebt (debt balance)
        - usageAsCollteralEnabledOnUser (bool, is scaledAToken can be used for collateral)
    4. Pour chaque user récupérer eModeCategoryId (s'il existe) pour avoir les ltv et liquidationThreshold en eMode
    


    underlyingAsset: any;
    scaledATokenBalance: any;
    scaledVariableDebt: any;
    usageAsCollateralEnabledOnUser: any;

    3. Récupérer les données utilisateurs pour chaque addresse : 
        - address collateralAsset (underlying) 
        - scaledATokenBalance (collateral balance)
        - scaledVariableDebt (debt balance)
        - usageAsCollteralEnabledOnUser (bool, is scaledAToken can be used for collateral)

    3. Récupérer le prix de l'asset underlying : 
        - 