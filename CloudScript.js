// #######################################################################################################################
/*   
 _____ _   _    _____         _____  _____   ____  _____   __          ________   _______ _____  _    _  _____ _______ 
|_   _| \ | |  / ____|  /\   |  __ \|  __ \ / __ \|  __ \  \ \        / /  ____| |__   __|  __ \| |  | |/ ____|__   __|
  | | |  \| | | (___   /  \  | |__) | |  | | |  | | |__) |  \ \  /\  / /| |__       | |  | |__) | |  | | (___    | |   
  | | | . ` |  \___ \ / /\ \ |  _  /| |  | | |  | |  _  /    \ \/  \/ / |  __|      | |  |  _  /| |  | |\___ \   | |   
 _| |_| |\  |  ____) / ____ \| | \ \| |__| | |__| | | \ \     \  /\  /  | |____     | |  | | \ \| |__| |____) |  | |   
|_____|_| \_| |_____/_/    \_\_|  \_\_____/ \____/|_|  \_\     \/  \/   |______|    |_|  |_|  \_\\____/|_____/   |_|   
*/
// #######################################################################################################################
// This is the test build. Heavily under work in progress. Numbers will be changed.
//
function getBoombot(boombot) {
    var boombots = {
        "MekaScorp": 0,
        "SharkBot": 1,
        "RoboMantis": 2
    };
    return boombots[boombot]
}

handlers.Debug = function () {
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: currentPlayerId,
        "StatisticNames": "Trophy"
    });

    log.debug(currentPlayerTrophy)
}

handlers.FirstLogin = function () {
    var slots = [
        {
            "isReady": 0,
            "isAvailable": 1,
            "startTime": 0,
            "currentTime": 0,
            "endTime": 0
        },
        {
            "isReady": 0,
            "isAvailable": 1,
            "startTime": 0,
            "currentTime": 0,
            "endTime": 0
        },
        {
            "isReady": 0,
            "isAvailable": 1,
            "startTime": 0,
            "currentTime": 0,
            "endTime": 0
        }
    ]
    var itemLevel = [
        [
            1,
            0
        ],
        [
            1,
            0
        ],
        [
            1,
            0
        ]
    ]
    var equipped = [
        "MekaScorp",
        1,
        1,
        1
    ]
    var configs = [
        [
            1,
            1,
            1
        ],
        [
            1,
            1,
            1
        ],
        [
            1,
            1,
            1
        ]
    ]
    var matchStats = [
        0, 0, 0
    ]
    var updateUserReadOnly = {
        PlayFabId: currentPlayerId,
        Data: {
            "equipped": JSON.stringify(equipped),
            "configs": JSON.stringify(configs),
            "itemLevel": JSON.stringify(itemLevel),
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats)
        }
    }
    server.UpdatePlayerStatistics({
        "PlayFabId": currentPlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": 0
            }
        ]
    })
    server.UpdateUserReadOnlyData(updateUserReadOnly);
}

handlers.WinCondition = function (args) {
    //After win match
    //get player info
    args.PlayerId = !args.PlayerId ? {} : args.PlayerId;
    var PlayerId = args.PlayerId;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: PlayerId,
        "StatisticNames": "Trophy"
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var trophy = JSON.parse(currentPlayerTrophy.Statistics[0].Value)
    var matchStats = JSON.parse(currentPlayerData.Data.matchStats.Value);
    matchStats[0] += 1;
    var newTrophy = trophy + 7;
    //give booster if available
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    if (reserveBooster >= 15) {
        var tradedBooster = 15;
    }
    else { var tradedBooster = reserveBooster }
    var subBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "BR",
        Amount: tradedBooster
    }
    var addBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "TB",
        Amount: tradedBooster
    }
    server.UpdatePlayerStatistics({
        "PlayFabId": PlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": newTrophy
            }
        ]
    })
if(tradedBooster >= 0){
    server.SubtractUserVirtualCurrency(subBooster);
    server.AddUserVirtualCurrency(addBooster);
}
    //check for slot availability, give box, start timer and record set time
    if (slots[0].isAvailable == 1 || slots[1].isAvailable == 1 || slots[2].isAvailable == 1) {
        var grantBasicBox = {
            PlayFabId: PlayerId,
            ItemIds: "BasicBox"
        }
        var isBoxGiven = 1;
        server.GrantItemsToUser(grantBasicBox);
    }
    else { var isBoxGiven = 0 }
    for (i = 0; i < slots.length; i++) {
        if (slots[i].isAvailable == 1) {
            var startTime = new Date().getTime() / 1000;
            var endTime = startTime + 900;
            slots[i].isAvailable = 0;
            slots[i].startTime = startTime;
            slots[i].endTime = endTime;

            break;
        }
    }
    var updateSlotTimer = {
        PlayFabId: PlayerId,
        Data: {
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats)
        }
    }
    server.UpdateUserReadOnlyData(updateSlotTimer);
    return {
        "oldBooster": oldBooster,
        "givenBooster": tradedBooster,
        "isBoxGiven": isBoxGiven,
        "oldTrophy": trophy,
        "newTrophy": newTrophy
    }
}

handlers.LoseCondition = function (args) {
    args.PlayerId = !args.PlayerId ? {} : args.PlayerId;
    var PlayerId = args.PlayerId;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: PlayerId,
        "StatisticNames": "Trophy"
    });
    var matchStats = JSON.parse(currentPlayerData.Data.matchStats.Value);
    matchStats[1] += 1;
    var trophy = JSON.parse(currentPlayerTrophy.Statistics[0].Value)
    if (trophy <= 2) {
        var newTrophy = 0
    }
    else {
        var newTrophy = trophy - 3;
    }
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    if (reserveBooster >= 5) {
        var tradedBooster = 5;
    }
    else { var tradedBooster = reserveBooster }
    var subBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "BR",
        Amount: tradedBooster
    }
    var addBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "TB",
        Amount: tradedBooster
    }
    server.UpdatePlayerStatistics({
        "PlayFabId": PlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": newTrophy
            }
        ]
    })
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats)
        }
    }
    server.UpdateUserReadOnlyData(updateUserData);
    if(tradedBooster >= 0){
        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
    return {
        "oldBooster": oldBooster,
        "givenBooster": tradedBooster,
        "isBoxGiven": 0,
        "oldTrophy": trophy,
        "newTrophy": newTrophy
    }
}

handlers.DrawCondition = function (args) {
    args.PlayerId = !args.PlayerId ? {} : args.PlayerId;
    var PlayerId = args.PlayerId;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: PlayerId,
        "StatisticNames": "Trophy"
    });
    var trophy = JSON.parse(currentPlayerTrophy.Statistics[0].Value)
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var matchStats = JSON.parse(currentPlayerData.Data.matchStats.Value);
    matchStats[2] += 1;
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    if (reserveBooster >= 10) {
        var tradedBooster = 10;
    }
    else { var tradedBooster = reserveBooster }
    var subBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "BR",
        Amount: tradedBooster
    }
    var addBooster = {
        PlayFabId: PlayerId,
        VirtualCurrency: "TB",
        Amount: tradedBooster
    }
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats)
        }
    }
    server.UpdateUserReadOnlyData(updateUserData);
    if(tradedBooster >= 0){
        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
    return {
        "oldBooster": oldBooster,
        "givenBooster": tradedBooster,
        "isBoxGiven": 0,
        "oldTrophy": trophy,
        "newTrophy": trophy
    }
}

handlers.CheckSlots = function () {
    //Every time main screen loaded or booster used for accelerate box opening
    //get player info
    var timer = [0, 0, 0]
    var isReady = [0, 0, 0]
    var isAvailable = [0, 0, 0]
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var grantBasicKey = {
        PlayFabId: currentPlayerId,
        ItemIds: "BasicBoxKey"
    }
    //check for remaining time and give key
    for (i = 0; i < slots.length; i++) {
        var remainingTime = slots[i].endTime - (new Date().getTime() / 1000);
        isReady[i] = slots[i].isReady;
        isAvailable[i] = slots[i].isAvailable;
        if ((remainingTime <= 0) && (slots[i].isReady == 0) && (slots[i].isAvailable == 0)) {
            slots[i].isReady = 1;
            var updateSlotTimer = {
                PlayFabId: currentPlayerId,
                Data: { "slots": JSON.stringify(slots) }
            }
            server.UpdateUserReadOnlyData(updateSlotTimer);
            server.GrantItemsToUser(grantBasicKey);
            timer[i] = 0
        }
        else if ((remainingTime <= 0) && (slots[i].isReady == 1)) {
            timer[i] = 0
        }
        else if ((slots[i].isAvailable == 1)) {
            timer[i] = -1;
        }
        else
            timer[i] = remainingTime;
    }
    return {
        "timer": timer,
        "isReady": isReady,
        "isAvailable": isAvailable
    }
}

handlers.SpendBoosterSlot = function (args) {
    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var isUsed = 0;
    var playerBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB);
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var reqBooster = Math.ceil((slots[whichSlot].endTime - slots[whichSlot].startTime) / 60000);
    if (slots[whichSlot].isReady == 0 && playerBooster >= reqBooster && slots[whichSlot].isAvailable == 0 ) {
        slots[whichSlot].endTime = slots[whichSlot].startTime;
        var subBooster = {
            PlayFabId: currentPlayerId,
            VirtualCurrency: "TB",
            Amount: reqBooster
        }
        server.SubtractUserVirtualCurrency(subBooster);
        var updateSlotTimer = {
            PlayFabId: currentPlayerId,
            Data: { "slots": JSON.stringify(slots) }
        }
        server.UpdateUserReadOnlyData(updateSlotTimer);
        isUsed = 1
    }
    return {"isUsed":isUsed}
}

handlers.SpendRubySlot = function (args) {
    //open instantly with ruby TBA

}

handlers.OpenBox = function (args) {
    //when box ready, click to open function
    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    if (slots[whichSlot].isReady == 1) {
        slots[whichSlot].isReady = 0;
        slots[whichSlot].isAvailable = 1;
        slots[whichSlot].startTime = 0;
        slots[whichSlot].endTime = 0;
        var openBox = {
            PlayFabId: currentPlayerId,
            ContainerItemId: "BasicBox"
        }
        server.UnlockContainerItem(openBox);
        //Give randomized upgrade shards
        var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
        //Math.floor(Math.random() * (max - min + 1) ) + min;
        boomBotId = Math.floor(Math.random() * 3);
        expAmount = Math.floor(Math.random() * (36 - 24 + 1)) + 24;

        itemLevel[boomBotId][1] += expAmount;

        var giveExp = {
            PlayFabId: currentPlayerId,
            Data: {
                "itemLevel": JSON.stringify(itemLevel),
                "slots": JSON.stringify(slots)
            }
        }
        server.UpdateUserReadOnlyData(giveExp);
        return {
            "whichBoombot": boomBotId,
            "expAmount": expAmount,
            "currentExp": itemLevel[boomBotId][1]
        }
    }

}

handlers.EquipItem = function (args) {
    //Garage equip item function
    /*args must be in this format:    
        {   
            "boombot":"BoomBot",
            "cos":1,
            "wpn":1,
            "wpnCos":1
        }
    */
    args.boombot = !args.boombot ? {} : args.boombot;
    args.cos = !args.cos ? {} : args.cos;
    args.wpn = !args.wpn ? {} : args.wpn;
    args.wpnCos = !args.wpnCos ? {} : args.wpnCos;

    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId,
    });
    var boomBotId = getBoombot(args.boombot)
    //var isPlayerGotItem = isPlayerGotItem(boomBotId, args.wpn, currentPlayerId)
    //select boombot values    
    var equipped = JSON.parse(currentPlayerData.Data.equipped.Value);
    var configs = JSON.parse(currentPlayerData.Data.configs.Value);
    equipped[0] = args.boombot;
    equipped[1] = args.cos;
    equipped[2] = args.wpn;
    equipped[3] = args.wpnCos;
    configs[boomBotId][0] = args.cos;
    configs[boomBotId][1] = args.wpn;
    configs[boomBotId][2] = args.wpnCos;

    var updateEquippedItems = {
        PlayFabId: currentPlayerId,
        Data: {
            "equipped": JSON.stringify(equipped),
            "configs": JSON.stringify(configs)
        }
    }

    server.UpdateUserReadOnlyData(updateEquippedItems);
}

handlers.GetUserGameplayConfig = function (args) {
    // Gameplay parameters sender function
    args.PlayerId = !args.PlayerId ? {} : args.PlayerId;

    var PlayerId = args.PlayerId;

    var accInfo = server.GetUserAccountInfo({
        PlayFabId: PlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: PlayerId,
        "Keys": ["levelData", "robotValues"]
    });
    var userData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId,
        "Keys": ["equipped", "itemLevel"]
    });

    var titleInfo = accInfo.UserInfo.TitleInfo;
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var robotData = JSON.parse(titleData.Data.robotValues);
    var currentEquipment = JSON.parse(userData.Data.equipped.Value);
    var boomBotId = getBoombot(currentEquipment[0])
    var weaponId = currentEquipment[2]
    var gameplayParams = {
        "DisplayName": titleInfo.DisplayName,
        "RobotId": currentEquipment[0],
        "RobotCostumeId": currentEquipment[1] - 1,
        "WeaponId": currentEquipment[2] - 1,
        "WeaponCostumeId": currentEquipment[3] - 1,
        "HealthPoints": robotData[boomBotId][0][itemLevel[boomBotId][0] - 1],
        "MoveSpeedScale": robotData[boomBotId][2],
        "Damage": robotData[boomBotId][1][itemLevel[boomBotId][0] - 1] * robotData[boomBotId][3][weaponId - 1][0],
        "Cooldown": robotData[boomBotId][3][weaponId - 1][1],
        "EnergyChargeRate": robotData[boomBotId][3][weaponId - 1][2],
        "EnergyCost": robotData[boomBotId][3][weaponId - 1][3],
        "UltDamageScale": robotData[boomBotId][3][weaponId - 1][4],
        "UltCharge": robotData[boomBotId][3][weaponId - 1][5],
        "AltDamage": robotData[boomBotId][1][itemLevel[boomBotId][0] - 1] * robotData[boomBotId][3][weaponId - 1][6]
    }
    return gameplayParams;
}

handlers.GetUserGameParams = function () {

    var userData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": ["levelData", "robotValues"]
    });
    var robotData = JSON.parse(titleData.Data.robotValues);
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var levelData = JSON.parse(titleData.Data.levelData)
    var HP = [0, 0, 0]
    var DMG = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    var nextLevel = [[0, 0], [0, 0], [0, 0]]
    var nextExp = levelData.levelRamp;
    var nextCoin = levelData.levelCoin;
    for (i = 0; i < 3; i++) {
        HP[i] = robotData[i][0][itemLevel[i][0] - 1]
        nextLevel[i][0] = nextExp[itemLevel[i][0]]
        nextLevel[i][1] = nextCoin[itemLevel[i][0]]
        for (j = 0; j < 4; j++) {
            DMG[i][j] = robotData[i][1][itemLevel[i][0] - 1] * robotData[i][3][j][0]
        }
    }
    var equipped = JSON.parse(userData.Data.equipped.Value)
    var configs = JSON.parse(userData.Data.configs.Value)
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value)
    var gameParams = {
        "equipped": equipped,
        "configs": configs,
        "itemLevel": itemLevel,
        "HealthPoints": HP,
        "Damage": DMG,
        "nextLevel": nextLevel
    }
    return gameParams;
}

handlers.CheckUpgrade = function () {

    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": "levelData"
    });

    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var levelData = JSON.parse(titleData.Data.levelData);
    var levelRamp = levelData.levelRamp;
    var levelCoin = levelData.levelCoin;
    var requiredExp = [0, 0, 0];
    var requiredCoin = [0, 0, 0];
    var currentExp = [0, 0, 0];
    var checkResult = [0, 0, 0];
    for (i = 0; i < 3; i++) {
        currentExp[i] = itemLevel[i][1];
        requiredExp[i] = levelRamp[itemLevel[i][0]]
        requiredCoin[i] = levelCoin[itemLevel[i][0]]
        if (requiredExp[i] <= currentExp[i]) {
            checkResult[i] = 1
        }
    }
    return {
        "checkResult": checkResult,
        "currentExp": currentExp,
        "requiredExp": requiredExp,
        "requiredCoin": requiredCoin
    }
}

handlers.UpgradeBoombot = function (args) {
    //usable when an boombot can be upgraded
    args.whichBoombot = !args.whichBoombot ? {} : args.whichBoombot;
    var whichBoombot = args.whichBoombot;
    //get user item info and VC
    var boombotId = getBoombot(whichBoombot);
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": "levelData"
    });

    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var playerCoin = JSON.parse(currentPlayerInventory.VirtualCurrency.CN);
    var levelData = JSON.parse(titleData.Data.levelData);
    var levelRamp = levelData.levelRamp;
    var levelCoin = levelData.levelCoin;
    var currentExp = itemLevel[boombotId][1];
    var requiredExp = levelRamp[itemLevel[boombotId][0]]
    var requiredCoin = levelCoin[itemLevel[boombotId][0]]

    //if OK level up
    if ((playerCoin >= requiredCoin) && (currentExp >= requiredExp)) {
        itemLevel[boombotId][1] -= requiredExp
        itemLevel[boombotId][0] += 1;
        var upgradeItem = {
            PlayFabId: currentPlayerId,
            Data: { "itemLevel": JSON.stringify(itemLevel) }
        }
        server.UpdateUserReadOnlyData(upgradeItem);
        var subCoin = {
            PlayFabId: currentPlayerId,
            VirtualCurrency: "CN",
            Amount: requiredCoin
        }
        server.SubtractUserVirtualCurrency(subCoin);
    }
}
