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

handlers.WinCondition = function () {
    //After win match
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: currentPlayerId,
        "StatisticNames": "Trophy"
    });
    if (currentPlayerData.Data.slots === undefined) {
        //if first time login
        currentPlayerData.Data.slots = [
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
        var slots = currentPlayerData.Data.slots;
    }
    else {
        var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    }
    var trophy = JSON.parse(currentPlayerTrophy.Data.Statistics[1].Value)
    var newTrophy = trophy + 7;
    //give booster if available
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    if (reserveBooster >= 10) {
        var tradedBooster = 10;
    }
    else { var tradedBooster = reserveBooster }
    var subBooster = {
        PlayFabId: currentPlayerId,
        VirtualCurrency: "BR",
        Amount: tradedBooster
    }
    var addBooster = {
        PlayFabId: currentPlayerId,
        VirtualCurrency: "TB",
        Amount: tradedBooster
    }
    server.UpdatePlayerStatisticsRequest({
        "PlayFabId": currentPlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": newTrophy
            }
        ]
    })
    server.SubtractUserVirtualCurrency(subBooster);
    server.AddUserVirtualCurrency(addBooster);
    //check for slot availability, give box, start timer and record set time
    if (slots[0].isAvailable == 1 || slots[1].isAvailable == 1 || slots[2].isAvailable == 1) {
        var grantBasicBox = {
            PlayFabId: currentPlayerId,
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
            var updateSlotTimer = {
                PlayFabId: currentPlayerId,
                Data: { "slots": JSON.stringify(slots) }
            }
            server.UpdateUserReadOnlyData(updateSlotTimer);
            break;
        }
    }
    return {
        "givenBooster": tradedBooster,
        "isBoxGiven": isBoxGiven,
        "trophy": trophy,
        "newTrophy": newTrophy
    }
}

handlers.LoseCondition = function () {
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: currentPlayerId,
        "StatisticNames": "Trophy"
    });
    var trophy = JSON.parse(currentPlayerTrophy.Data.Statistics[1].Value)
    var newTrophy = trophy - 3;

    return {
        "trophy": trophy,
        "newTrophy": newTrophy
    }
}

handlers.CheckSlots = function () {
    //Every time main screen loaded or booster used for accelerate box opening
    //get player info
    var timer = [0, 0, 0]
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
        if ((remainingTime <= 0) && (slots[i].isReady == 0)) {
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
        else timer[i] = remainingTime;
    }
    return timer;
}

handlers.SpendBoosterSlot = function (args) {
    //reduce timer with booster TBA
    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var playerBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB);
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var reqBooster = Math.ceil((slots[whichSlot].endTime - slots[whichSlot].startTime) / 1000);
    if (slots[whichSlot].isReady == 0 && playerBooster >= reqBooster) {
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
    }
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
            "cos":0,
            "wpn":0,
            "wpnCos":0
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

    if (currentPlayerData.Data.itemLevel === undefined) {
        var isFirstTime = 1;
        //itemLevel[boombot] = [level,xp]
        currentPlayerData.Data.itemLevel = [
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

        var itemLevel = currentPlayerData.Data.itemLevel;
    }
    if (currentPlayerData.Data.equipped === undefined) {
        // equipped = ["boombot", boombotcostume, weapon, weaponcostume]
        currentPlayerData.Data.equipped = [
            "MekaScorp",
            1,
            1,
            1
        ]
        // configs[boombot] = [costume, weapon, weaponcostume]
        currentPlayerData.Data.configs = [
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

        var equipped = currentPlayerData.Data.equipped;
        var configs = currentPlayerData.Data.configs
    }
    else {
        //select boombot values
        //Write a check code (is player got item? is this item compatible with robot etc.)
        var equipped = JSON.parse(currentPlayerData.Data.equipped.Value);
        var configs = JSON.parse(currentPlayerData.Data.configs.Value);
        equipped[0] = args.boombot;
        equipped[1] = args.cos;
        equipped[2] = args.wpn;
        equipped[3] = args.wpnCos;
        configs[boomBotId][0] = args.cos;
        configs[boomBotId][1] = args.wpn;
        configs[boomBotId][2] = args.wpnCos;
    }

    if (isFirstTime == 1) {
        var updateEquippedItems = {
            PlayFabId: currentPlayerId,
            Data: {
                "equipped": JSON.stringify(equipped),
                "configs": JSON.stringify(configs),
                "itemLevel": JSON.stringify(itemLevel)
            }
        }
    }
    else {
        var updateEquippedItems = {
            PlayFabId: currentPlayerId,
            Data: {
                "equipped": JSON.stringify(equipped),
                "configs": JSON.stringify(configs)
            }
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
    var boomBotId = 0;
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var HP = [0, 0, 0]
    var DMG = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    log.debug(robotData)
    log.debug(itemLevel)

    for (i = 0; i < robotData.length; i++) {
        boomBotId = i;
        HP[i] = robotData[boomBotId][0][itemLevel[boomBotId][0] - 1]
        for (j = 0; i < 4; i++) {
            weaponId = j;
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
        "Damage": robotData[boomBotId][1][itemLevel[boomBotId][0] - 1] * robotData[boomBotId][3][weaponId - 1][0]
    }
    return gameParams;
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