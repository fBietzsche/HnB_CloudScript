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
        'MekaScorp': 0,
        'SharkBot': 1,
        'RoboMantis': 2
    };
    return boombots[boombot]
}

function getWeapon(weapon) {
    var weapons = {
        'Axe': 0,
        'Scythe': 1,
        'Drill': 2,
        'Jawz': 3,
        'Stinger': 4,
        'Hammer': 5
    };
    return weapons[weapon]
}


function updateSlot() {
   
}

function boxOpener() {
    var updateSlotTimer = {
        PlayFabId: currentPlayerId,
        Data: { "slots": JSON.stringify(slots) }
    }
    server.UpdateUserReadOnlyData(updateSlotTimer);
    var openBox = {
        PlayFabId: currentPlayerId,
        ContainerItemId: "BasicBox"
    }
    server.UnlockContainerItem(openBox);
}

handlers.BoxToSlot = function () {

    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });

    if (currentPlayerData.Data.slots === undefined) {
        //if first time login
        var defSlot = {
            "isReady": 0,
            "isAvailable": 1,
            "startTime": 0,
            "currentTime": 0,
            "endTime": 0
        };
        currentPlayerData.Data.slots = [
            defSlot,
            defSlot,
            defSlot
        ]
        var slots = currentPlayerData.Data.slots;
    }
    else {
        var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    }
    //check for slot availability, give box, start timer and record set time
    if (slots[0].isAvailable == 1 || slots[1].isAvailable == 1 || slots[2].isAvailable == 1) {
        var grantBasicBox = {
            PlayFabId: currentPlayerId,
            ItemIds: "BasicBox"
        }
        server.GrantItemsToUser(grantBasicBox);
    }
    log.debug("slots 1"  + JSON.stringify(slots))
    for (i = 0; i <= slots.length; i++) {
        log.debug("i =   " + i);
        log.debug("slots[i].isAvailable =  "  + slots[i].isAvailable)
        if (slots[i].isAvailable == 1) {
            var startTime = new Date().getTime() / 1000;
            var endTime = startTime + 300;
            slots[i].isAvailable = 0;
            slots[i].startTime = startTime;
            slots[i].endTime = endTime;
            var updateSlotTimer = {
                PlayFabId: currentPlayerId,
                Data: { "slots": JSON.stringify(slots) }
            }
            log.debug("slots 2"  + JSON.stringify(slots))
            server.UpdateUserReadOnlyData(updateSlotTimer);
            break;
        }
    }

}

handlers.CheckSlots = function () {

    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var slots = JSON.parse(currentPlayerData.Data.slots.Value);
    var grantBasicKey = {
        PlayFabId: currentPlayerId,
        ItemIds: "BasicBoxKey"
    }
    //check for remaining time and give key
    for (i = 0; i <= slots.length; i++) {
        var remainingTime = slots[i].endTime - (new Date().getTime() / 1000);
        if ((remainingTime <= 0) && (slots[i].isReady == 0)) {
            slots[i].isReady = 1;
            var updateSlotTimer = {
                PlayFabId: currentPlayerId,
                Data: { "slots": JSON.stringify(slots) }
            }
            server.UpdateUserReadOnlyData(updateSlotTimer);
            server.GrantItemsToUser(grantBasicKey);
            return 0
        }
        else if ((remainingTime <= 0) && (slots[i].isReady == 1)) {
            return 0
        }
        return remainingTime;
    }
}

handlers.SpendBoosterSlot = function (args) {
    //reduce timer with ads TBA
}

handlers.SpendRubySlot = function (args) {
    //open instantly with ruby TBA

}

handlers.OpenBox = function (args) {

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
        boxOpener();
    }

}

handlers.EquipItem = function (args) {
    /*args must be in this format:
    
        {   
            "boombot":"BoomBot",
            "costume":"BoomBotDefault",
            "weaponId":"Weapon",
            "weaponCostume":"WeaponDefault"
        }
    */
    args.boombot = !args.boombot ? {} : args.boombot;
    args.costume = !args.costume ? {} : args.costume;
    args.weaponId = !args.weaponId ? {} : args.weaponId;
    args.weaponCostume = !args.weaponCostume ? {} : args.weaponCostume;

    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    if (currentPlayerData.Data.itemLevel === undefined) {
        var isFirstTime = 1;
        currentPlayerData.Data.itemLevel = [
            {
                "itemId": "MekaScorp",
                "level": 1,
                "XP": 0
            },
            {
                "itemId": "SharkBot",
                "level": 1,
                "XP": 0
            },
            {
                "itemId": "RoboMantis",
                "level": 1,
                "XP": 0
            }
        ]

        var itemLevel = currentPlayerData.Data.itemLevel;
    }
    if (currentPlayerData.Data.equipment === undefined) {
        currentPlayerData.Data.equipment = {
            "equipped": [
                "MekaScorp",
                "MekaScorpDefault",
                "Stinger",
                "StingerDefault"
            ],
            "mekaScorp": {
                "costume": "MekaScorpDefault",
                "weaponId": "Stinger",
                "weaponCostume": "StingerDefault"
            },
            "sharkBot": {
                "costume": "SharkBotDefault",
                "weaponId": "Jawz",
                "weaponCostume": "JawzDefault"
            },
            "roboMantis": {
                "costume": "RoboMantisDefault",
                "weaponId": "Scythe",
                "weaponCostume": "ScytheDefault"
            }
        }

        var equipment = currentPlayerData.Data.equipment;
    }
    else {
        var equipment = JSON.parse(currentPlayerData.Data.equipment.Value);
    }
    //select boombot values
    //Write a check code (is player got item? is this item compatible with robot etc.)
    equipment.equipped[0] = args.boombot;
    equipment.equipped[1] = args.costume;
    equipment.equipped[2] = args.weaponId;
    equipment.equipped[3] = args.weaponCostume;
    switch (args.boombot) {
        case "MekaScorp":
            equipment.mekaScorp.costume = args.costume;
            equipment.mekaScorp.weaponId = args.weaponId;
            equipment.mekaScorp.weaponCostume = args.weaponCostume;
            break;

        case "SharkBot":
            equipment.sharkBot.costume = args.costume;
            equipment.sharkBot.weaponId = args.weaponId;
            equipment.sharkBot.weaponCostume = args.weaponCostume;
            break;

        case "RoboMantis":
            equipment.roboMantis.costume = args.costume;
            equipment.roboMantis.weaponId = args.weaponId;
            equipment.roboMantis.weaponCostume = args.weaponCostume;
            break;
    }
    if (isFirstTime == 1) {
        var updateEquippedItems = {
            PlayFabId: currentPlayerId,
            Data: {
                "equipment": JSON.stringify(equipment),
                "itemLevel": JSON.stringify(itemLevel)
            }
        }
    }
    else {
        var updateEquippedItems = {
            PlayFabId: currentPlayerId,
            Data: {
                "equipment": JSON.stringify(equipment)
            }
        }
    }
    server.UpdateUserReadOnlyData(updateEquippedItems);
}

handlers.GetUserGameConfig = function (args) {

    args.PlayerId = !args.PlayerId ? {} : args.PlayerId;

    var PlayerId = args.PlayerId;

    var accInfo = server.GetUserAccountInfo({
        PlayFabId: PlayerId
    });
    var titleData = server.GetTitleData({
        PlayFabId: PlayerId,
        "Keys": "itemData"
    });
    var userData = server.GetUserReadOnlyData({
        PlayFabId: PlayerId,
        "Keys": ["equipment", "itemLevel"]
    });
    var titleInfo = accInfo.UserInfo.TitleInfo;
    var itemLevel = JSON.parse(userData.Data.itemLevel.Value);
    var itemData = JSON.parse(titleData.Data.itemData);
    var currentEquipment = JSON.parse(userData.Data.equipment.Value);
    var boomBotId = getBoombot(currentEquipment.equipped[0])
    var weaponId = getWeapon(currentEquipment.equipped[2])
    log.debug("currentEquipment.equipped:  " + currentEquipment.equipped)
    log.debug("boomBotId:  " + boomBotId)
    log.debug("weaponId:  " + weaponId)
    log.debug("itemData:  " + itemData)
    log.debug("weaponValues:   " + itemData.weaponValues)
    log.debug("itemData.weaponValues[weaponId]   " + itemData.weaponValues[weaponId])
    var gameplayParams = {
        "DisplayName": titleInfo.DisplayName,
        "RobotId": currentEquipment.equipped[0],
        "RobotSkinId": currentEquipment.equipped[1],
        "WeaponId": currentEquipment.equipped[2],
        "WeaponSkinId": currentEquipment.equipped[3],
        "HP": itemData.robotValues[boomBotId][1][itemLevel[boomBotId].level],
        "MoveScale": itemData.robotValues[boomBotId][3],        
        "DMG": itemData.robotValues[boomBotId][2][itemLevel[boomBotId].level] * itemData.weaponValues[weaponId][1],
        "CD": itemData.weaponValues[weaponId][2],
        "EnergyCharge": itemData.weaponValues[weaponId][3],
        "EnergyCost": itemData.weaponValues[weaponId][4],
        "UltDMGScale": itemData.weaponValues[weaponId][5],
        "UltCharge": itemData.weaponValues[weaponId][6]
    }
    return gameplayParams;
}

handlers.UpgradeBoombot = function (args) {

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
        "Keys": "itemData"
    });

    var itemLevels = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var playerCoin = JSON.parse(currentPlayerInventory.VirtualCurrency.CN);
    var itemData = JSON.parse(titleData.Data.itemData);
    var levelRamp = itemData.levelRamp;
    var levelCoin = itemData.levelCoin;
    var currentLevel = itemLevels[boombotId].level;
    var currentExp = itemLevels[boombotId].XP;
    var requiredExp = levelRamp[itemLevels[boombotId].level]
    var requiredCoin = levelCoin[itemLevels[boombotId].level]


    //if OK level up
    if ((playerCoin >= requiredCoin) && (currentExp >= requiredExp)) {
        itemLevels[boombotId].XP = itemLevels[boombotId].XP - requiredExp
        itemLevels[boombotId].level = currentLevel + 1;
        var upgradeItem = {
            PlayFabId: currentPlayerId,
            Data: { "itemLevel": JSON.stringify(itemLevels) }
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