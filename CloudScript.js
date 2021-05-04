
handlers.FirstLogin = function () {
    //TODO yeni exp sistemine göre güncellenecek
    /*{
        "isReady": 0,
        "isAvailable": 1,
        "startTime": 0,
        "endTime": 0
    }*/

    // TODO Max Trophy
    var maxTrophy = 0

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
    log.debug("updateUserReadOnly = " + JSON.stringify(updateUserReadOnly))
    server.UpdateUserReadOnlyData(updateUserReadOnly);
}

