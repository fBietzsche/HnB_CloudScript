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

var RobotCount = 4;
var WeaponCount = 16;
var BasicBoxTime = 900;

function getBoombot(boombot) {
    var boombots = {
        "MekaScorp": 0,
        "SharkBot": 1,
        "RoboMantis": 2,
        "IronTurtle": 3
    };
    return boombots[boombot]
}

function getBoombotName(boombotId) {
    var boombots = {
        0: "MekaScorp",
        1: "SharkBot",
        2: "RoboMantis",
        3: "IronTurtle"
    };
    return boombots[boombotId]
}

function getWeapon(weapon) {
    var weapons = {
        "msw_1": 0,
        "msw_2": 1,
        "msw_3": 2,
        "msw_4": 3,
        "sbw_1": 4,
        "sbw_2": 5,
        "sbw_3": 6,
        "sbw_4": 7,
        "rmw_1": 8,
        "rmw_2": 9,
        "rmw_3": 10,
        "rmw_4": 11,
        "itw_1": 12,
        "itw_2": 13,
        "itw_3": 14,
        "itw_4": 15,
    };
    return weapons[weapon]
}

function winCondition(winArgs) {
    //After win match
    //get player info 
    var PlayerId = winArgs[0];
    var winnerPlayers = winArgs[1];
    var loserPlayers = winArgs[2];
    var drawPlayers = [];
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
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
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
    //check for slot availability, start timer  
    for (i = 0; i < slots.length; i++) {
        if (slots[i][1] == 1) {
            var startTime = new Date().getTime() / 1000;
            var endTime = startTime + BasicBoxTime;
            slots[i][1] = 0;
            slots[i][2] = startTime;
            slots[i][3] = endTime;
            var isBoxGiven = 1;
            break;
        }
        else { var isBoxGiven = 0 }
    }
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers,
        oldBooster, tradedBooster, isBoxGiven, trophy, newTrophy]
    matchHistory.unshift(thisMatch);
    var UpdateUserReadOnlyData = {
        PlayFabId: PlayerId,
        Data: {
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory)
        }
    }
    server.UpdateUserReadOnlyData(UpdateUserReadOnlyData);
}

function loseCondition(loseArgs) {
    var PlayerId = loseArgs[0];
    var winnerPlayers = loseArgs[1];
    var loserPlayers = loseArgs[2];
    var drawPlayers = [];
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: PlayerId,
        "StatisticNames": "Trophy"
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
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
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var isBoxGiven = 0;
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers, oldBooster, tradedBooster, isBoxGiven, trophy, newTrophy]
    matchHistory.unshift(thisMatch);
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory)
        }
    }
    server.UpdateUserReadOnlyData(updateUserData);
}

function drawCondition(drawArgs) {
    var PlayerId = drawArgs[0];
    var drawPlayers = drawArgs[1];
    var winnerPlayers = [];
    var loserPlayers = [];
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var currentPlayerTrophy = server.GetPlayerStatistics({
        PlayFabId: PlayerId,
        "StatisticNames": "Trophy"
    });
    var trophy = JSON.parse(currentPlayerTrophy.Statistics[0].Value)
    var newTrophy = trophy;
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var matchStats = JSON.parse(currentPlayerData.Data.matchStats.Value);
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    matchStats[2] += 1;
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    if (reserveBooster >= 10) {
        var tradedBooster = 10;
    }
    else { var tradedBooster = reserveBooster }
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var isBoxGiven = 0;
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers, oldBooster, tradedBooster, isBoxGiven, trophy, newTrophy]
    matchHistory.unshift(thisMatch);
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory)
        }
    }
    server.UpdateUserReadOnlyData(updateUserData);
}

function winConditionUpdate(winArgs) {
    var PlayerId = winArgs;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    //give booster if available   
    var tradedBooster = matchHistory[0][5];
    if (tradedBooster >= 1) {
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

        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
    //new trophy update
    var newTrophy = matchHistory[0][8];
    server.UpdatePlayerStatistics({
        "PlayFabId": PlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": newTrophy
            }
        ]
    })

}

function loseConditionUpdate(loseArgs) {
    var PlayerId = loseArgs;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    //give booster if available       
    var tradedBooster = matchHistory[0][5];
    if (tradedBooster >= 1) {
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

        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
    //new trophy update
    var newTrophy = matchHistory[0][8];
    server.UpdatePlayerStatistics({
        "PlayFabId": PlayerId,
        "Statistics": [
            {
                "StatisticName": "Trophy",
                "Value": newTrophy
            }
        ]
    })

}

function drawConditionUpdate(drawArgs) {
    var PlayerId = drawArgs;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    var tradedBooster = matchHistory[0][5];
    if (tradedBooster >= 1) {
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

        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
}

handlers.Debug = function () {
    var userData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": ["levelData", "weaponValues"]
    });
    log.debug("userData  =  " + userData)
    log.debug("titleData  =  " + titleData)
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    log.debug("itemLevel  =  " + itemLevel)
    var levelData = JSON.parse(titleData.Data.levelData)
    log.debug("levelData  =  " + levelData)
    var weaponData = titleData.Data.weaponValues;
    log.debug("weaponData  =  " + weaponData)
}

handlers.AddNewRobot = function () {
    //TODO Yeni exp sistemine göre güncellenecek
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var itemLevel = []
    var configs = []
    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var configs = JSON.parse(currentPlayerData.Data.configs.Value)
    var itemLevelBase = [
        1,
        0
    ]
    var configsBase = [
        1,
        1,
        1,
        0
    ]
    for (var i = 0; i < 4; i++) {
        itemLevel.push(itemLevelBase)
    }
    configs.push(configsBase)
    var updateUserReadOnly = {
        PlayFabId: currentPlayerId,
        Data: {
            "configs": JSON.stringify(configs),
            "itemLevel": JSON.stringify(itemLevel)
        }
    }
    server.UpdateUserReadOnlyData(updateUserReadOnly);
}

handlers.FirstLogin = function () {
    //TODO yeni exp sistemine göre güncellenecek
    /*{
        "isReady": 0,
        "isAvailable": 1,
        "startTime": 0,
        "endTime": 0
    }*/
    var slotsBase = [
        0,
        1,
        0,
        0
    ]
    var slots = []
    for (var j = 0; j < 3; j++) {
        slots.push(slotsBase)
    }
    var itemLevelBase = [
        1,
        0
    ]
    var configsBase = [
        1,
        1,
        1,
        1
    ]
    var itemLevel = []
    var configs = []
    for (var k = 0; k < RobotCount; k++) {
        configs.push(configsBase)
    }
    for (var i = 0; i < WeaponCount; i++) {
        itemLevel.push(itemLevelBase)
    }
    var equipped = [
        "MekaScorp",
        1,
        1,
        1
    ]

    var matchStats = [
        0, 0, 0
    ]
    var matchHistory = []
    var updateUserReadOnly = {
        PlayFabId: currentPlayerId,
        Data: {
            "equipped": JSON.stringify(equipped),
            "configs": JSON.stringify(configs),
            "itemLevel": JSON.stringify(itemLevel),
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory)
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

handlers.CheckSlots = function () {
    //Every time main screen loaded or booster used for accelerate box opening
    //get player info
    var timer = [0, 0, 0]
    var isAvailable = [0, 0, 0]
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var grantBasicKeyAndBox = {
        PlayFabId: currentPlayerId,
        ItemIds: ["BasicBoxKey", "BasicBox"]
    }
    //check for remaining time and give key
    for (i = 0; i < 3; i++) {
        var remainingTime = slots[i][3] - (new Date().getTime() / 1000);
        isAvailable[i] = slots[i][1];
        if ((remainingTime <= 0) && (isAvailable[i] == 0)) {
            //reset slot
            slots[i][0] = 0;
            slots[i][1] = 1;
            slots[i][2] = 0;
            slots[i][3] = 0;
            var updateSlotTimer = {
                PlayFabId: currentPlayerId,
                Data: { "slots": JSON.stringify(slots) }
            }
            server.UpdateUserReadOnlyData(updateSlotTimer);
            server.GrantItemsToUser(grantBasicKeyAndBox);
            timer[i] = 0
        }
        else if ((isAvailable[i] == 1)) {
            timer[i] = -1;
        }
        else
            timer[i] = remainingTime;
    }
    return {
        "timer": timer,
        "isAvailable": isAvailable
    }
}

handlers.EndMatch = function (args) {
    //End match functions handler
    /*args must be in this format:    
        {   
            "winnerPlayers":["x", "y", "z"],
            "loserPlayers":["x", "y", "z"],
            "drawPlayers":["x", "y", "z"]
        }
    */
    args.winnerPlayers = !args.winnerPlayers ? {} : args.winnerPlayers;
    args.loserPlayers = !args.loserPlayers ? {} : args.loserPlayers;
    args.drawPlayers = !args.drawPlayers ? {} : args.drawPlayers;

    var winnerPlayers = args.winnerPlayers;
    var loserPlayers = args.loserPlayers;
    var drawPlayers = args.drawPlayers;
    //Win
    for (i = 0; i < winnerPlayers.length; i++) {
        let winArgs = [winnerPlayers[i], winnerPlayers, loserPlayers];
        winCondition(winArgs)
    }

    //Lose
    for (i = 0; i < loserPlayers.length; i++) {
        let loseArgs = [loserPlayers[i], winnerPlayers, loserPlayers];
        loseCondition(loseArgs)
    }

    //Draw
    for (i = 0; i < drawPlayers.length; i++) {
        let drawArgs = [drawPlayers[i], drawPlayers];
        drawCondition(drawArgs)
    }
    return 1

}

handlers.EndMatchUpdate = function (args) {
    //End match functions handler
    /*args must be in this format:    
        {   
            "winnerPlayers":["x", "y", "z"],
            "loserPlayers":["x", "y", "z"],
            "drawPlayers":["x", "y", "z"]
        }
    */
    args.winnerPlayers = !args.winnerPlayers ? {} : args.winnerPlayers;
    args.loserPlayers = !args.loserPlayers ? {} : args.loserPlayers;
    args.drawPlayers = !args.drawPlayers ? {} : args.drawPlayers;

    var winnerPlayers = args.winnerPlayers;
    var loserPlayers = args.loserPlayers;
    var drawPlayers = args.drawPlayers;
    //Win
    for (i = 0; i < winnerPlayers.length; i++) {
        let winArgs = winnerPlayers[i];
        winConditionUpdate(winArgs)
    }

    //Lose
    for (i = 0; i < loserPlayers.length; i++) {
        let loseArgs = loserPlayers[i];
        loseConditionUpdate(loseArgs)
    }

    //Draw
    for (i = 0; i < drawPlayers.length; i++) {
        let drawArgs = drawPlayers[i];
        drawConditionUpdate(drawArgs)
    }
}

handlers.GetMatchResult = function () {

    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    return {
        "lastMatchResults": [[new Date().toISOString()], matchHistory[0]]
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
    var reqBooster = Math.ceil((slots[whichSlot][3] - slots[whichSlot][2]) / 60);
    if (slots[whichSlot].isReady == 0 && playerBooster >= reqBooster && slots[whichSlot].isAvailable == 0 && reqBooster >= 1) {
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
    return { "isUsed": isUsed }
}

handlers.SpendRubySlot = function (args) {
    //TODO open instantly with ruby TBA

}

handlers.OpenBox = function () {
    //when box ready, click to open function    
    //get player info 
    var openBox = {
        PlayFabId: currentPlayerId,
        ContainerItemId: "BasicBox"
    }
    var result = server.UnlockContainerItem(openBox);
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var configs = JSON.parse(currentPlayerData.Data.configs.Value);
    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var grantedItemIds = []
    var grantedCoin = 0
    for (i = 0; i < result.GrantedItems.length; i++) {
        grantedItemIds.push(0)
        grantedItemIds[i] = result.GrantedItems[i].ItemId
        var itemClass = result.GrantedItems[i].ItemClass
        if (itemClass == "coinPack") {
            grantedCoin = grantedItemIds[i]
            grantedCoin = grantedCoin.slice(4, 20)
        }
        else if (itemClass == "exp") {
            var weaponName = grantedItemIds[i].slice(0, -4)
            var weaponId = getWeapon(weaponName)
            var boombotId = weaponId % 4
            var boombotName = getBoombotName(boombotId)
            // player got weapon?
            if (itemLevel[weaponId][0] == 0) {
                var isWeaponGranted = 1
                var grantItemsIds = [weaponName]
                //player got boombot?
                if (configs[boombotId][3] == 0) {
                    configs[boombotId][3] = 1
                   
                    grantItemsIds.push(boombotName)
                    var isBoombotGranted = 1
                }
                itemLevel[weaponId][0] = 1
                var updateUserReadOnly = {
                    PlayFabId: currentPlayerId,
                    Data: {
                        "configs": JSON.stringify(configs),
                        "itemLevel": JSON.stringify(itemLevel)
                    }
                }
                server.UpdateUserReadOnlyData(updateUserReadOnly);
                var grantItems = {
                    PlayFabId: currentPlayerId,
                    ItemIds: grantItemsIds
                }
                server.GrantItemsToUser(grantItems);
                var expAmount = 0
                var currentExp = 0
            }
            else {
                var isWeaponGranted = 0
                var isBoombotGranted = 0
                //Math.floor(Math.random() * (max - min + 1) ) + min;
                var expAmount = Math.floor(Math.random() * (36 - 24 + 1)) + 24;
                itemLevel[weaponId][1] += expAmount;
                var updateUserReadOnly = {
                    PlayFabId: currentPlayerId,
                    Data: {
                        "itemLevel": JSON.stringify(itemLevel)
                    }
                }
                server.UpdateUserReadOnlyData(updateUserReadOnly);
                var currentExp = itemLevel[weaponId][1]
            }
        }
    }
    return {
        "isBoombotGranted": isBoombotGranted,
        "isWeaponGranted": isWeaponGranted,
        "whichBoombot": boombotId,
        "whichWeapon": weaponId,
        "grantedCoin": grantedCoin,
        "expAmount": expAmount,
        "currentExp": currentExp
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
    var weaponId = (4 * boomBotId) + args.wpn - 1
    //select boombot values    
    var equipped = JSON.parse(currentPlayerData.Data.equipped.Value);
    var configs = JSON.parse(currentPlayerData.Data.configs.Value);
    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    if (configs[boomBotId][3] == 1 && itemLevel[weaponId][0] >= 1) {
        equipped[0] = args.boombot;
        equipped[1] = args.cos;
        equipped[2] = args.wpn;
        equipped[3] = args.wpnCos;
        configs[boomBotId][0] = args.cos;
        configs[boomBotId][1] = args.wpn;
        configs[boomBotId][2] = args.wpnCos;
    }
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
        "Keys": ["levelData", "robotValues", "weaponValues"]
    });
    var userData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId,
        "Keys": ["equipped", "itemLevel"]
    });

    var titleInfo = accInfo.UserInfo.TitleInfo;
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var weaponData = JSON.parse(titleData.Data.weaponValues);
    var currentEquipment = JSON.parse(userData.Data.equipped.Value);
    var boomBotId = getBoombot(currentEquipment[0])
    var weaponId = ((4 * boomBotId) + currentEquipment[2] - 1)
    var gameplayParams = {
        "DisplayName": titleInfo.DisplayName,
        "RobotId": currentEquipment[0],
        "RobotCostumeId": currentEquipment[1] - 1,
        "WeaponId": currentEquipment[2] - 1,
        "WeaponCostumeId": currentEquipment[3] - 1,
        "Damage": weaponData[weaponId][0] + (weaponData[weaponId][0] * (itemLevel[weaponId][0] - 1) * 0.05),
        "EnergyCost": weaponData[weaponId][1],
        "EnergyChargeRate": weaponData[weaponId][2],
        "UltDamageScale": weaponData[weaponId][3],
        "UltCharge": weaponData[weaponId][4],
        "MoveSpeedScale": weaponData[weaponId][5],
        "AltDamage": weaponData[weaponId][6],
        "HealthPoints": weaponData[weaponId][7] + (weaponData[weaponId][7] * (itemLevel[weaponId][0] - 1) * 0.05),
        "Cooldown": weaponData[weaponId][8]
    }
    return gameplayParams;
}

handlers.GetUserGameParams = function () {

    var userData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": ["levelData", "weaponValues"]
    });
    var weaponData = JSON.parse(titleData.Data.weaponValues);
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var levelData = JSON.parse(titleData.Data.levelData)
    var HP = []
    var DMG = []
    var nextLevel = []
    var nextExp = levelData.levelRamp;
    var nextCoin = levelData.levelCoin;
    for (i = 0; i < WeaponCount; i++) {
        nextLevel.push([])
        DMG.push([])
        HP[i] = weaponData[i][7] + (weaponData[i][7] * (itemLevel[i][0] - 1) * 0.05)
        nextLevel[i][0] = nextExp[itemLevel[i][0]]
        nextLevel[i][1] = nextCoin[itemLevel[i][0]]
        DMG[i] = Math.round(weaponData[i][0] + (weaponData[i][0] * (itemLevel[i][0] - 1) * 0.05))
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
    //TODO Max level durumu eklenecek
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
    var requiredExp = [];
    var requiredCoin = [];
    var currentExp = [];
    var checkResult = [];

    for (i = 0; i < WeaponCount; i++) {
        requiredExp.push(0)
        requiredCoin.push(0)
        currentExp.push(0)
        checkResult.push(0)
        if (itemLevel[i][0] == 10) {
            checkResult[i] = "max"
            currentExp[i] = "max"
            requiredExp[i] = "max"
            requiredCoin[i] = "max"
        }
        else {
            currentExp[i] = itemLevel[i][1];
            requiredExp[i] = levelRamp[itemLevel[i][0] - 1]
            requiredCoin[i] = levelCoin[itemLevel[i][0] - 1]
            if (requiredExp[i] <= currentExp[i]) {
                checkResult[i] = 1
            }
        }
    }
    return {
        "checkResult": checkResult,
        "currentExp": currentExp,
        "requiredExp": requiredExp,
        "requiredCoin": requiredCoin
    }
}

handlers.UpgradeWeapon = function (args) {
    //usable when an boombot can be upgraded
    args.whichWeapon = !args.whichWeapon ? {} : args.whichWeapon;
    var whichWeapon = args.whichWeapon;
    //get user item info and VC    
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
    var currentExp = itemLevel[whichWeapon][1];
    var requiredExp = levelRamp[itemLevel[whichWeapon][0] - 1]
    var requiredCoin = levelCoin[itemLevel[whichWeapon][0] - 1]

    //if OK level up
    if ((playerCoin >= requiredCoin) && (currentExp >= requiredExp)) {
        itemLevel[whichWeapon][1] -= requiredExp
        itemLevel[whichWeapon][0] += 1;
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
