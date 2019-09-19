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
function setSlot() {
    var startTime = new Date().getTime() / 1000;
    var endTime = startTime + 60;
    var box = Value;
}
function updateSlot() {
    var updateSlotTimer = {
        PlayFabId: currentPlayerId,
        Data: { "box": JSON.stringify(box) }
    }
    server.UpdateUserReadOnlyData(updateSlotTimer);
}
function boxOpener() {
    var updateSlotTimer = {
        PlayFabId: currentPlayerId,
        Data: { "box": JSON.stringify(box) }
    }
    server.UpdateUserReadOnlyData(updateSlotTimer);
    var openBox = {
        PlayFabId: currentPlayerId,
        ContainerItemId: "BasicBox"
    }
    server.UnlockContainerItem(openBox);
}
handlers.BoxToSlot = function (args) {

    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });

    if (currentPlayerData.Data.box === undefined) {
        //if first time login
        var defSlot = {
            "isReady": 0,
            "isAvailable": 1,
            "startTime": 0,
            "currentTime": "0",
            "endTime": 0,
        };
        currentPlayerData.Data.box = {
            "slot1": defSlot,
            "slot2": defSlot,
            "slot3": defSlot
        }
        var Value = currentPlayerData.Data.box;
    }
    else {
        var Value = JSON.parse(currentPlayerData.Data.box.Value);
    }
    //count basic boxes
    var getInventoryData = server.GetUserInventory({
        PlayFabId: currentPlayerId
    });
    var currentInventoryData = getInventoryData.Inventory;
    for (i = 0; i < currentInventoryData.length; i++) {
        var invCount = currentInventoryData[i];
        if (invCount.ItemId == "BasicBox") {
            var boxCount = invCount.RemainingUses;
            i = currentInventoryData.length;
        }
    }
    //check for box and slot availability, start timer and record set time
    var isAvailable0 = parseInt(Value.slot1.isAvailable, 10);
    var isAvailable1 = parseInt(Value.slot2.isAvailable, 10);
    var isAvailable2 = parseInt(Value.slot3.isAvailable, 10);
    boxCount = parseInt(boxCount, 10) - 3 + isAvailable0 + isAvailable1 + isAvailable2;
    log.debug("available boxCount =  " + boxCount);
    if (boxCount <= 0) {
        log.debug("There is no cake!")
    }

    switch (whichSlot) {
        case "0":
            if ((isAvailable0 == 1) && (boxCount >= 1)) {
                setSlot;
                box.slot1.isAvailable = 0;
                box.slot1.startTime = startTime;
                box.slot1.endTime = endTime;
                updateSlot;
            }
            break;
        case "1":
            if ((isAvailable1 == 1) && (boxCount >= 1)) {
                setSlot;
                box.slot2.isAvailable = 0;
                box.slot2.startTime = startTime;
                box.slot2.endTime = endTime;
                updateSlot;
            }
            break;
        case "2":
            if ((isAvailable2 == 1) && (boxCount >= 1)) {
                setSlot;
                box.slot3.isAvailable = 0;
                box.slot3.startTime = startTime;
                box.slot3.endTime = endTime;
                updateSlot;
            }
            break;
    }



}

handlers.CheckSlot = function (args) {

    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var Value = JSON.parse(currentPlayerData.Data.box.Value);
    switch (whichSlot) {
        case "0":
            //check for remaining time and give key
            var remainingTime = Value.slot1.endTime - (new Date().getTime() / 1000);
            if ((remainingTime <= 0) && (Value.slot1.isReady == 0)) {
                log.debug("Slot 1 Ready")
                var box = Value;
                box.slot1.isReady = 1;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
                var grantBasicKey = {
                    PlayFabId: currentPlayerId,
                    ItemIds: "BasicBoxKey"
                }
                server.GrantItemsToUser(grantBasicKey);
            }
            break;
        case "1":
            //check for remaining time and give key
            var remainingTime = Value.slot2.endTime - (new Date().getTime() / 1000);
            if ((remainingTime <= 0) && (Value.slot2.isReady == 0)) {
                log.debug("Slot 2 Ready")
                var box = Value;
                box.slot2.isReady = 1;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
                var grantBasicKey = {
                    PlayFabId: currentPlayerId,
                    ItemIds: "BasicBoxKey"
                }
                server.GrantItemsToUser(grantBasicKey);
            }
            break;
        case "2":
            //check for remaining time and give key
            var remainingTime = Value.slot3.endTime - (new Date().getTime() / 1000);
            if ((remainingTime <= 0) && (Value.slot3.isReady == 0)) {
                log.debug("Slot 3 Ready")
                var box = Value;
                box.slot3.isReady = 1;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
                var grantBasicKey = {
                    PlayFabId: currentPlayerId,
                    ItemIds: "BasicBoxKey"
                }
                server.GrantItemsToUser(grantBasicKey);
            }
            break;
    }
}

handlers.WatchAdsSlot = function (args) {
    //reduce timer with ads TBA
}

handlers.PayToReadySlot = function (args) {
    //open instantly with ruby TBA

}

handlers.OpenBox = function (args) {

    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    var Value = JSON.parse(currentPlayerData.Data.box.Value);
    switch (whichSlot) {
        case "0":
            //if ready open box and reset slot
            if (Value.slot1.isReady == 1) {
                var box = Value;
                box.slot1.isReady = 0;
                box.slot1.isAvailable = 1;
                box.slot1.startTime = 0;
                box.slot1.endTime = 0;
                boxOpener;
            }
            break;

        case "1":
            // if ready open box and reset slot
            if (Value.slot2.isReady == 1) {
                var box = Value;
                box.slot2.isReady = 0;
                box.slot2.isAvailable = 1;
                box.slot2.startTime = 0;
                box.slot2.endTime = 0;
                boxOpener;
            }
            break;

        case "2":
            // if ready open box and reset slot
            if (Value.slot3.isReady == 1) {
                var box = Value;
                box.slot3.isReady = 0;
                box.slot3.isAvailable = 1;
                box.slot3.startTime = 0;
                box.slot3.endTime = 0;
                boxOpener;
            }
            break;
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
    var weaponId = getWeapon(currentEquipment.equipped[1])
    var gameplayParams = {
        "DisplayName": titleInfo.DisplayName,
        "RobotId": currentEquipment.equipped[0],
        "RobotSkinId": currentEquipment.equipped[1],
        "WeaponId": currentEquipment.equipped[2],
        "WeaponSkinId": currentEquipment.equipped[3],
        "HP": itemData.robotValues[boomBotId][1][itemLevel[1].level],
        "MoveScale": itemData.robotValues[boomBotId][2],
        "DMG": itemData.robotValues[boomBotId][1][itemLevel[1].level] * itemData.weaponValues[weaponId][0],
        "CD": itemData.weaponValues[weaponId][1],
        "EnergyCharge": itemData.weaponValues[weaponId][2],
        "EnergyCost": itemData.weaponValues[weaponId][3],
        "UltDMGScale": itemData.weaponValues[weaponId][4],
        "UltCharge": itemData.weaponValues[weaponId][5]
    }
    return gameplayParams;
}

handlers.UpgradeItem = function (args) {

    args.Item = !args.Item ? {} : args.Item;

    //get user item info and VC

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
    var whichitem = args.Item;
    var itemLevels = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    var playerCoin = JSON.parse(currentPlayerInventory.VirtualCurrency.CN);
    var itemData = JSON.parse(titleData.Data.itemData);
    var levelRamp = itemData.levelRamp
    var levelCoin = itemData.levelCoin;
    log.debug("itemLevels.length  " + Object.keys(itemLevels).length);

    for (i = 0; i < Object.keys(itemLevels).length; i++) {
        var invCount = Object.keys(itemLevels)[i];
        log.debug("itemLevels[i]  " + Object.values(itemLevels)[i].level);
        log.debug("invCount  " + invCount);
        if (invCount === whichitem) {
            var currentItemLevel = Object.values(itemLevels)[i].level;
            var currentItemExp = Object.values(itemLevels)[i].XP;
            var requiredExp = levelRamp[Object.values(itemLevels)[i].level - 1]
            var requiredCoin = levelCoin[Object.values(itemLevels)[i].level - 1]
            var itemCount = i;
            i = itemLevels.length;
        }
    }
    // IMPORTANT!!!!!!!!!
    // REQUIRED COIN SHOULD BE ARRANGED

    //if OK level up
    if ((playerCoin >= requiredCoin) && (currentItemExp >= requiredExp)) {
        Object.values(itemLevels)[itemCount].XP = Object.values(itemLevels)[itemCount].XP - requiredExp
        Object.values(itemLevels)[itemCount].level = currentItemLevel + 1;
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