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
var BasicBoxTime = 3600;

function getMatchDuration(matchType) {
    var matchDurations = {
        "Deathmatch": 150
    };
    return matchDurations[matchType]
}

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
        "itw_4": 15
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
    var ongoingMatch = JSON.parse(currentPlayerData.Data.ongoingMatch.Value);
    var accountExp = JSON.parse(currentPlayerData.Data.accountExp.Value);
    var doubleBattery = JSON.parse(currentPlayerData.Data.doubleBattery.Value);

    // TODO MAX Trophy
    let maxTrophy = currentPlayerData.Data.maxTrophy.Value;

    var accountExpGained = 20
    var trophyChange = 7
    var tradedBattery = 0
    matchStats[0] += 1;
    accountExp[1] = accountExp[1] + accountExpGained;

    var newTrophy = trophy + trophyChange;

    if (newTrophy > maxTrophy) {
        maxTrophy = newTrophy
    }

    //give booster if available
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)

    if (reserveBooster >= 15) {
        var batteryGained = 15;
    } else {
        var batteryGained = reserveBooster
    }
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
        } else {
            var isBoxGiven = 0
        }
    }
    //double battery checker
    if (doubleBattery <= batteryGained) {
        tradedBattery = doubleBattery + batteryGained;
        doubleBattery = 0;
    } else {
        doubleBattery = doubleBattery - batteryGained;
        tradedBattery = 2 * batteryGained;
    }
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers,
        oldBooster, tradedBattery, isBoxGiven, trophy, newTrophy, ongoingMatch[1], accountExpGained, trophyChange, batteryGained]
    matchHistory.unshift(thisMatch);
    var ongoingMatch = ["0", "0", "0", "0", 0]
    var UpdateUserReadOnlyData = {
        PlayFabId: PlayerId,
        Data: {
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory),
            "ongoingMatch": JSON.stringify(ongoingMatch),
            "accountExp": JSON.stringify(accountExp),
            "maxTrophy": maxTrophy
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
    var ongoingMatch = JSON.parse(currentPlayerData.Data.ongoingMatch.Value);
    var trophy = JSON.parse(currentPlayerTrophy.Statistics[0].Value)
    var accountExp = JSON.parse(currentPlayerData.Data.accountExp.Value);
    var doubleBattery = JSON.parse(currentPlayerData.Data.doubleBattery.Value);
    var accountExpGained = 10
    var trophyChange = -3
    var tradedBattery = 0
    matchStats[1] += 1;
    accountExp[1] = accountExp[1] + accountExpGained;
    if (trophy <= 2) {
        var newTrophy = 0
    } else {
        var newTrophy = trophy + trophyChange;
    }
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: PlayerId
    });
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    if (reserveBooster >= 5) {
        var batteryGained = 5;
    } else {
        var batteryGained = reserveBooster
    }
    //double battery checker
    if (doubleBattery <= batteryGained) {
        tradedBattery = doubleBattery + batteryGained;
        doubleBattery = 0;
    } else {
        doubleBattery = doubleBattery - batteryGained;
        tradedBattery = 2 * batteryGained;
    }
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var isBoxGiven = 0;
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers,
        oldBooster, tradedBattery, isBoxGiven, trophy, newTrophy, ongoingMatch[1], accountExpGained, trophyChange, batteryGained]
    matchHistory.unshift(thisMatch);
    var ongoingMatch = ["0", "0", "0", "0", 0]
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory),
            "ongoingMatch": JSON.stringify(ongoingMatch),
            "accountExp": JSON.stringify(accountExp)
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
    var ongoingMatch = JSON.parse(currentPlayerData.Data.ongoingMatch.Value);
    var accountExp = JSON.parse(currentPlayerData.Data.accountExp.Value);
    var reserveBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.BR);
    var oldBooster = JSON.parse(currentPlayerInventory.VirtualCurrency.TB)
    var doubleBattery = JSON.parse(currentPlayerData.Data.doubleBattery.Value);
    var accountExpGained = 15
    var trophyChange = 0
    var tradedBattery = 0
    accountExp[1] = accountExp[1] + accountExpGained;
    matchStats[2] += 1;
    if (reserveBooster >= 10) {
        var batteryGained = 10;
    } else {
        var batteryGained = reserveBooster
    }
    //double battery checker
    if (doubleBattery <= batteryGained) {
        tradedBattery = doubleBattery + batteryGained;
        doubleBattery = 0;
    } else {
        doubleBattery = doubleBattery - batteryGained;
        tradedBattery = 2 * batteryGained;
    }
    if (5 == matchHistory.length) {
        matchHistory.pop();
    }
    var isBoxGiven = 0;
    var thisMatch = [new Date().toISOString(), winnerPlayers, loserPlayers, drawPlayers,
        oldBooster, tradedBattery, isBoxGiven, trophy, newTrophy, ongoingMatch[1], accountExpGained, trophyChange, batteryGained]
    matchHistory.unshift(thisMatch);
    var ongoingMatch = ["0", "0", "0", "0", 0]
    var updateUserData = {
        PlayFabId: PlayerId,
        Data: {
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory),
            "ongoingMatch": JSON.stringify(ongoingMatch),
            "accountExp": JSON.stringify(accountExp),
            "doubleBattery": doubleBattery
        }
    }
    server.UpdateUserReadOnlyData(updateUserData);
}

function winConditionUpdate(winArgs) {
    log.debug("winConditionUpdate")
    var PlayerId = winArgs;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId
    });
    var matchHistory = JSON.parse(currentPlayerData.Data.matchHistory.Value);
    //give booster if available
    var tradedBattery = matchHistory[0][5];
    var batteryGained = matchHistory[0][12];
    if (tradedBattery >= 1) {

        var subBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "BR",
            Amount: batteryGained
        }
        var addBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "TB",
            Amount: tradedBattery
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
    var tradedBattery = matchHistory[0][5];
    var batteryGained = matchHistory[0][12];
    if (tradedBattery >= 1) {
        var subBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "BR",
            Amount: batteryGained
        }
        var addBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "TB",
            Amount: tradedBattery
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
    //give booster if available
    var tradedBattery = matchHistory[0][5];
    var batteryGained = matchHistory[0][12];
    if (tradedBattery >= 1) {
        var subBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "BR",
            Amount: batteryGained
        }
        var addBooster = {
            PlayFabId: PlayerId,
            VirtualCurrency: "TB",
            Amount: tradedBattery
        }
        server.SubtractUserVirtualCurrency(subBooster);
        server.AddUserVirtualCurrency(addBooster);
    }
}

function accountLevelUpCheck() {

    //Get data
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": "accountLevel"
    });

    //Set data
    var doubleBatteryTotal = JSON.parse(currentPlayerData.Data.doubleBattery.Value);
    var accountExp = JSON.parse(currentPlayerData.Data.accountExp.Value);
    var accountLevel = JSON.parse(titleData.Data.accountLevel);
    var isLevelUp = 0;
    var doubleBatteryFromLevelUp = 0;

    //if OK level up and give double battery
    if ((accountExp[1] >= accountLevel[accountExp[0]])) {
        accountExp[0] = accountExp[0] + 1
        doubleBatteryFromLevelUp = 40
        doubleBatteryTotal += doubleBatteryFromLevelUp;
        var accLevelUp = {
            PlayFabId: currentPlayerId,
            Data: {
                "accountExp": JSON.stringify(accountExp),
                "doubleBattery": JSON.stringify(doubleBatteryTotal)
            }
        }
        server.UpdateUserReadOnlyData(accLevelUp);
        isLevelUp = 1
    }
    var currentAccLevel = accountExp[0]
    var currentAccExp = accountExp[1]
    var requiredAccExp = accountLevel[currentAccLevel]
    return [isLevelUp, doubleBatteryFromLevelUp, doubleBatteryTotal, currentAccLevel, currentAccExp, requiredAccExp]
}

// TODO wtf

handlers.UnlockReward = function (args) {

    /*
     {
       "RewardIndex": "0",
     }
     */

    const RewardIndex = args.RewardIndex ? args.RewardIndex : null;

    const currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });

    log.debug("currentPlayerData  =  " + currentPlayerData.Data);

    const titleData = server.GetTitleData({
        PlayFabId: currentPlayerId,
        "Keys": ["progressRewards"]
    });

    log.debug("titleData  =  " + titleData);

    let maxTrophy = currentPlayerData.Data.maxTrophy.Value;

    log.debug("MaxTrophy  =  " + maxTrophy.Data);

    const LastRewardedProgressIndex = currentPlayerData.Data.LastRewardedProgressIndex.Value;

    log.debug("LastRewardedProgressIndex  =  " + LastRewardedProgressIndex.Data);

    if (RewardIndex && RewardIndex > LastRewardedProgressIndex) {


        if (titleData.Data.progressRewards[RewardIndex].ReqThropy <= maxTrophy) {

            // verdik

            if (titleData.Data.progressRewards[RewardIndex].Reward === "BasicBox") {

                const grantBasicKeyAndBox = {
                    PlayFabId: currentPlayerId,
                    ItemIds: [titleData.Data.progressRewards[RewardIndex].Reward, "BasicBoxKey"]
                }

                server.GrantItemsToUser(grantBasicKeyAndBox);

            } else {

                const grantReward = {
                    PlayFabId: currentPlayerId,
                    ItemIds: [titleData.Data.progressRewards[RewardIndex].Reward]
                }

                server.GrantItemsToUser(grantReward);
            }

            const updateUserReadOnly = {
                PlayFabId: currentPlayerId,
                Data: {
                    "LastRewardedProgressIndex": RewardIndex,
                }
            }
            server.UpdateUserReadOnlyData(updateUserReadOnly);

            return {"isRewarded": 1}


        }
    }

    return {"isRewarded": 0}

    // +++++ TODO check last reward index greater than now?
    // +++++ TODO check if user can unlock this reward.
    // +++++ TODO grant reward to user
    // +++++ TODO return { isRewarded : 1}

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

handlers.SlotTester = function (args) {
    /*{
        "slot": "0",
        "timer": seconds
    }*/
    args.slot = !args.slot ? {} : args.slot;
    args.timer = !args.timer ? {} : args.timer;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });

    var starterBoxProgress = JSON.parse(currentPlayerData.Data.starterBoxProgress.Value);
    var currentTutorialProgress = JSON.parse(currentPlayerData.Data.tutorialProgress.Value);
    if (currentTutorialProgress == 2 || currentTutorialProgress == 6) {
        {
            var slots = JSON.parse(currentPlayerData.Data.slots.Value);
            var whichSlot = args.slot
            var timer = args.timer
            slots[whichSlot] = [
                0,
                0,
                (new Date().getTime() / 1000),
                (new Date().getTime() / 1000) + timer
            ]
            starterBoxProgress = currentTutorialProgress == 2 ? 1 : 2;
            var updateUserReadOnly = {
                PlayFabId: currentPlayerId,
                Data: {
                    "slots": JSON.stringify(slots),
                    "starterBoxProgress": JSON.stringify(starterBoxProgress)
                }
            }
            server.UpdateUserReadOnlyData(updateUserReadOnly);
        }
    }
}

handlers.FirstLogin = function () {
    //TODO yeni exp sistemine göre güncellenecek
    /*{
        "isReady": 0,
        "isAvailable": 1,
        "startTime": 0,
        "endTime": 0
    }*/

    // TODO Max Trophy
    let maxTrophy = 0

    var starterBoxProgress = 0
    var accountExp = [1, 0]
    var doubleBattery = 0
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
        0,
        0
    ]
    var configsBase = [
        1,
        1,
        1,
        0
    ]
    var itemLevel = []
    var configs = []
    for (var k = 0; k < RobotCount; k++) {
        if (k == 0) {
            configs[0] = [
                1,
                1,
                1,
                1
            ]
        } else {
            configs.push(configsBase)
        }
    }
    for (var i = 0; i < WeaponCount; i++) {
        if (i == 0) {
            itemLevel[0] = [
                1,
                0
            ]
        } else {
            itemLevel.push(itemLevelBase)
        }
    }
    //log.debug("configs b = " + configs)
    //itemLevel[0][0] = 1;
    //configs[0][3] = 1;
    log.debug("configs a = " + configs)
    log.debug("itemlevel = " + itemLevel)
    var equipped = [
        "MekaScorp",
        1,
        1,
        1
    ]

    var matchStats = [
        0, 0, 0
    ]

    var tutorialProgress = 0;
    var matchHistory = []
    var updateUserReadOnly = {
        PlayFabId: currentPlayerId,
        Data: {
            "equipped": JSON.stringify(equipped),
            "configs": JSON.stringify(configs),
            "itemLevel": JSON.stringify(itemLevel),
            "slots": JSON.stringify(slots),
            "matchStats": JSON.stringify(matchStats),
            "matchHistory": JSON.stringify(matchHistory),
            "accountExp": JSON.stringify(accountExp),
            "doubleBattery": JSON.stringify(doubleBattery),
            "tutorialProgress": JSON.stringify(tutorialProgress),
            "starterBoxProgress": JSON.stringify(starterBoxProgress),
            "maxTrophy": JSON.stringify(maxTrophy)
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
    log.debug("updateUserReadOnly = " + updateUserReadOnly)
    server.UpdateUserReadOnlyData(updateUserReadOnly);
}

handlers.CheckSlots = function (args) {
    //{Box : boxId}
    //Every time main screen loaded or booster used for accelerate box opening
    //get player info
    var BoxType = args.Box
    var timer = [0, 0, 0]
    var isAvailable = [0, 0, 0]
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var grantBasicKeyAndBox = {
        PlayFabId: currentPlayerId,
        ItemIds: ["BasicBoxKey", BoxType]
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
                Data: {"slots": JSON.stringify(slots)}
            }
            server.UpdateUserReadOnlyData(updateSlotTimer);
            server.GrantItemsToUser(grantBasicKeyAndBox);
            timer[i] = 0
        } else if ((isAvailable[i] == 1)) {
            timer[i] = -1;
        } else
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
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var accountLevelUpCheckResult = accountLevelUpCheck()
    var availableSlotCount = 0

    for (i = 0; i < 3; i++) {
        if (slots[i][1] == 1) {
            availableSlotCount += 1
        }
    }
    return {
        "lastMatchResults": [[new Date().toISOString()], matchHistory[0], accountLevelUpCheckResult, availableSlotCount]
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
    var reqBooster = Math.ceil((slots[whichSlot][3] - (new Date().getTime() / 1000)) / 60);
    if (playerBooster >= reqBooster && slots[whichSlot][1] == 0 && reqBooster >= 1) {
        slots[whichSlot][3] = (new Date().getTime() / 1000);
        var subBooster = {
            PlayFabId: currentPlayerId,
            VirtualCurrency: "TB",
            Amount: reqBooster
        }
        server.SubtractUserVirtualCurrency(subBooster);
        var updateSlotTimer = {
            PlayFabId: currentPlayerId,
            Data: {"slots": JSON.stringify(slots)}
        }
        server.UpdateUserReadOnlyData(updateSlotTimer);
        isUsed = 1
    }
    return {"isUsed": isUsed}
}

handlers.SpendRubySlot = function (args) {
    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var currentPlayerInventory = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var isUsed = 0;
    var playerRuby = JSON.parse(currentPlayerInventory.VirtualCurrency.RB);
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var reqRuby = Math.ceil((slots[whichSlot][3] - (new Date().getTime() / 1000)) / 60);
    if (playerRuby >= reqRuby && slots[whichSlot][1] == 0 && reqRuby >= 1) {
        slots[whichSlot][3] = (new Date().getTime() / 1000);
        var subBooster = {
            PlayFabId: currentPlayerId,
            VirtualCurrency: "RB",
            Amount: reqRuby
        }
        server.SubtractUserVirtualCurrency(subBooster);
        var updateSlotTimer = {
            PlayFabId: currentPlayerId,
            Data: {"slots": JSON.stringify(slots)}
        }
        server.UpdateUserReadOnlyData(updateSlotTimer);
        isUsed = 1
    }
    return {"isUsed": isUsed}

}

handlers.OpenBox = function (args) {
    //{Box : boxId}
    //when box ready, click to open function
    //get player info
    var boxType = args.Box;
    var openBox = {
        PlayFabId: currentPlayerId,
        ContainerItemId: boxType
    }
    var result = server.UnlockContainerItem(openBox);
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var configs = JSON.parse(currentPlayerData.Data.configs.Value);
    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var grantedItemIds = []
    var grantedCoin = 0
    var isWeaponGranted = 0
    var isBoombotGranted = 0
    for (i = 0; i < result.GrantedItems.length; i++) {
        grantedItemIds.push(0)
        grantedItemIds[i] = result.GrantedItems[i].ItemId
        var itemClass = result.GrantedItems[i].ItemClass
        if (itemClass == "coinPack") {
            grantedCoin = grantedItemIds[i]
            grantedCoin = grantedCoin.slice(4, 20)
        } else if (itemClass == "exp") {
            var weaponName = grantedItemIds[i].slice(0, -4)
            var weaponId = getWeapon(weaponName)
            var boombotId = Math.floor(weaponId / 4)
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
                    configs[boombotId][0] = 1
                    configs[boombotId][1] = weaponId % 4 + 1
                    configs[boombotId][2] = 1
                    log.debug("weaponid " + configs[boombotId][1])
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
            } else {
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
        "AltDamage": weaponData[weaponId][6] * (weaponData[weaponId][0] + (weaponData[weaponId][0] * (itemLevel[weaponId][0] - 1) * 0.05)),
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
        } else {
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
    var isUpgraded = 0

    //if OK level up
    if (itemLevel[whichWeapon][0] <= 9) {
        if ((playerCoin >= requiredCoin) && (currentExp >= requiredExp)) {
            itemLevel[whichWeapon][1] -= requiredExp
            itemLevel[whichWeapon][0] += 1;
            currentExp = itemLevel[whichWeapon][1]
            var upgradeItem = {
                PlayFabId: currentPlayerId,
                Data: {"itemLevel": JSON.stringify(itemLevel)}
            }
            server.UpdateUserReadOnlyData(upgradeItem);
            var subCoin = {
                PlayFabId: currentPlayerId,
                VirtualCurrency: "CN",
                Amount: requiredCoin
            }
            server.SubtractUserVirtualCurrency(subCoin);
            isUpgraded = 1
        }

    }
    return {
        "isUpgraded": isUpgraded,
        "currentExp": currentExp
    }
}

handlers.OnMatchStart = function (args) {
    /*
    {"PlayerGameliftId":"asd",
    "MatchId":"asd",
    "MatchType":"asd",
    "Adress":"asd"}
    */
    args.PlayerGameliftId = !args.PlayerGameliftId ? {} : args.PlayerGameliftId;
    args.MatchId = !args.MatchId ? {} : args.MatchId;
    args.MatchType = !args.MatchType ? {} : args.MatchType;
    args.Adress = !args.Adress ? {} : args.Adress;

    var ongoingMatch = [0, 0, 0, 0, 0]
    ongoingMatch[0] = args.PlayerGameliftId
    ongoingMatch[1] = args.MatchId
    ongoingMatch[2] = args.MatchType
    ongoingMatch[3] = args.Adress
    ongoingMatch[4] = new Date().getTime() / 1000
    var UpdateUserReadOnlyData = {
        PlayFabId: currentPlayerId,
        Data: {
            "ongoingMatch": JSON.stringify(ongoingMatch)
        }
    }
    server.UpdateUserReadOnlyData(UpdateUserReadOnlyData);
}

handlers.GetOngoingMatch = function () {

    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var ongoingMatch = JSON.parse(currentPlayerData.Data.ongoingMatch.Value);
    var reconnectData = {
        "PlayerGameliftId": ongoingMatch[0],
        "Adress": ongoingMatch[3]
    }
    /*   var matchDuration = getMatchDuration(ongoingMatch[2])
       var matchEndTime = ongoingMatch[4] + matchDuration
       if (matchEndTime > ((new Date().getTime() / 1000) + 15)) {
          var reconnectData = {
               "PlayerGameliftId": ongoingMatch[0],
               "Adress": ongoingMatch[3]
           }
       }
       else {
           var reconnectData = {
               "PlayerGameliftId": "0",
               "Adress": "0"
           }
       }*/
    return reconnectData
}

handlers.GetCurrentEquipment = function () {

    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var equipped = JSON.parse(currentPlayerData.Data.equipped.Value);

    var equipments = {
        "boombot": getBoombot(equipped[0]),
        "boombotCostume": equipped[1],
        "weapon": equipped[2],
        "weaponCostume": equipped[3],
        "itemLevel": itemLevel[equipped[2]][0]
    }
    return equipments
}

handlers.FinishTutorial = function (args) {

    var currentPlayerData = server.GetUserReadOnlyData({PlayFabId: currentPlayerId});
    var currentTutorialProgress = JSON.parse(currentPlayerData.Data.tutorialProgress.Value);
    currentTutorialProgress = args.Value;
    var UpdateUserReadOnlyData =
        {
            PlayFabId: currentPlayerId,
            Data: {
                "tutorialProgress": JSON.stringify(currentTutorialProgress)
            }
        }
    server.UpdateUserReadOnlyData(UpdateUserReadOnlyData);
    if (currentTutorialProgress == 5) {
        //todo add player data check if it was given before to ensure only once adding of batteries
        var addBooster = {
            PlayFabId: currentPlayerId,
            VirtualCurrency: "TB",
            Amount: 30
        }
        server.AddUserVirtualCurrency(addBooster);
    }
}

handlers.GetTutorialProgress = function () {
    var currentPlayerData = server.GetUserReadOnlyData({PlayFabId: currentPlayerId});
    var currentTutorialProgress = currentPlayerData.Data.tutorialProgress;
    return currentTutorialProgress;
}
