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
handlers.BoxToSlot = function (args) {

    args.Slot = !args.Slot ? {} : args.Slot;
    var whichSlot = args.Slot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    if (currentPlayerData.Data.box === undefined) {
        currentPlayerData.Data.box = {
            "slot1": {
                "isReady": 0,
                "isAvailable": 1,
                "startTime": 0,
                "currentTime": "0",
                "endTime": 0,

            },
            "slot2": {
                "isReady": 0,
                "isAvailable": 1,
                "startTime": 0,
                "currentTime": "0",
                "endTime": 0
            },
            "slot3": {
                "isReady": 0,
                "isAvailable": 1,
                "startTime": 0,
                "currentTime": "0",
                "endTime": 0
            }
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
                var startTime = new Date().getTime() / 1000;
                var endTime = startTime + 60;
                var box = Value;
                box.slot1.isAvailable = 0;
                box.slot1.startTime = startTime;
                box.slot1.endTime = endTime;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
            }
            break;
        case "1":
            if ((isAvailable1 == 1) && (boxCount >= 1)) {
                var startTime = new Date().getTime() / 1000;
                var endTime = startTime + 300;
                var box = Value;
                box.slot2.isAvailable = 0;
                box.slot2.startTime = startTime;
                box.slot2.endTime = endTime;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
            }
            break;
        case "2":
            if ((isAvailable2 == 1) && (boxCount >= 1)) {
                var startTime = new Date().getTime() / 1000;
                var endTime = startTime + 900;
                var box = Value;
                box.slot3.isAvailable = 0;
                box.slot3.startTime = startTime;
                box.slot3.endTime = endTime;
                var updateSlotTimer = {
                    PlayFabId: currentPlayerId,
                    Data: { "box": JSON.stringify(box) }
                }
                server.UpdateUserReadOnlyData(updateSlotTimer);
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
            break;

        case "1":
            // if ready open box and reset slot
            if (Value.slot2.isReady == 1) {
                var box = Value;
                box.slot2.isReady = 0;
                box.slot2.isAvailable = 1;
                box.slot2.startTime = 0;
                box.slot2.endTime = 0;
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
            break;

        case "2":
            // if ready open box and reset slot
            if (Value.slot3.isReady == 1) {
                var box = Value;
                box.slot3.isReady = 0;
                box.slot3.isAvailable = 1;
                box.slot3.startTime = 0;
                box.slot3.endTime = 0;
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
            break;
    }
}

handlers.EquipItem = function (args) {
    /*args must be in this format:
    
        {   
            "Boombot":"boomBot",
            "BoombotCostume":"XXX",
            "Primary":"XXX",
            "PrimaryCostume":"XXX",
            "Secondary":"XXX",
            "SecondaryCostume":"XXX"
        }
    */
    args.Boombot = !args.Boombot ? {} : args.Boombot;
    args.BoombotCostume = !args.BoombotCostume ? {} : args.BoombotCostume;
    args.Primary = !args.Primary ? {} : args.Primary;
    args.PrimaryCostume = !args.PrimaryCostume ? {} : args.PrimaryCostume;
    args.Secondary = !args.Secondary ? {} : args.Secondary;
    args.SecondaryCostume = !args.SecondaryCostume ? {} : args.SecondaryCostume;

    var whichBot = args.Boombot;
    //get player info
    var currentPlayerData = server.GetUserReadOnlyData({
        PlayFabId: currentPlayerId
    });
    if (currentPlayerData.Data.itemLevel === undefined) {
        currentPlayerData.Data.itemLevel = {
            "MekaScorp": {
                "itemId": "MekaScorp",
                "level": 1,
                "XP": 0
            },
            "SharkBot": {
                "itemId": "SharkBot",
                "level": 1,
                "XP": 0
            },
            "IronBull": {
                "itemId": "IronBull",
                "level": 1,
                "XP": 0
            },
            "RoboMantis": {
                "itemId": "RoboMantis",
                "level": 1,
                "XP": 0
            },
            "Axe": {
                "itemId": "Axe",
                "level": 1,
                "XP": 0
            },
            "Blazer": {
                "itemId": "Blazer",
                "level": 1,
                "XP": 0
            },
            "Cutter": {
                "itemId": "Cutter",
                "level": 1,
                "XP": 0
            },
            "Drill": {
                "itemId": "Drill",
                "level": 1,
                "XP": 0
            },
            "Flail": {
                "itemId": "Flail",
                "level": 1,
                "XP": 0
            },
            "Freezer": {
                "itemId": "Freezer",
                "level": 1,
                "XP": 0
            },
            "Grinder": {
                "itemId": "Grinder",
                "level": 1,
                "XP": 0
            },
            "Hammer": {
                "itemId": "Hammer",
                "level": 1,
                "XP": 0
            },
            "Saw": {
                "itemId": "Saw",
                "level": 1,
                "XP": 0
            },
            "Shocker": {
                "itemId": "Shocker",
                "level": 1,
                "XP": 0
            },
            "Stinger": {
                "itemId": "Stinger",
                "level": 1,
                "XP": 0
            },
            "Striker": {
                "itemId": "Striker",
                "level": 1,
                "XP": 0
            }
        }

        var itemLevel = currentPlayerData.Data.itemLevel;
    }
    //   else{
    //       var itemLevel = JSON.parse(currentPlayerData.Data.itemLevel.Value);
    //   }
    if (currentPlayerData.Data.equipment === undefined) {
        currentPlayerData.Data.equipment = {
            "equipped": "MekaScorp",
            "mekaScorp": {
                "costume": "MekaScorpDefault",
                "primary": {
                    "ItemId": "Hammer",
                    "costume": "HammerDefault"
                },
                "secondary": {
                    "ItemId": "Magnet",
                    "costume": "MagnetDefault"
                }
            },
            "sharkBot": {
                "costume": "SharkBotDefault",
                "primary": {
                    "ItemId": "Saw",
                    "costume": "SawDefault"
                },
                "secondary": {
                    "ItemId": "Thruster",
                    "costume": "ThrusterDefault"
                }
            },
            "ironBull": {
                "costume": "IronBullDefault",
                "primary": {
                    "ItemId": "Drill",
                    "costume": "DrillDefault"
                },
                "secondary": {
                    "ItemId": "bull",
                    "costume": "bullDefault"
                }
            },
            "roboMantis": {
                "costume": "RoboMantisDefault",
                "primary": {
                    "ItemId": "Axe",
                    "costume": "AxeDefault"
                },
                "secondary": {
                    "ItemId": "Grinder",
                    "costume": "GrinderDefault"
                }
            }
        }

        var Value = currentPlayerData.Data.equipment;
    }
    else {
        var Value = JSON.parse(currentPlayerData.Data.equipment.Value);
    }
    //select boombot values
    //Write a check code (is player got item? is this item compatible with robot etc.)
    switch (whichBot) {
        case "mekaScorp":
            var equipment = Value;
            equipment.equipped = "MekaScorp";
            equipment.mekaScorp.costume = args.BoombotCostume;
            equipment.mekaScorp.primary.ItemId = args.Primary;
            equipment.mekaScorp.primary.costume = args.PrimaryCostume;
            equipment.mekaScorp.secondary.ItemId = args.Secondary;
            equipment.mekaScorp.secondary.costume = args.SecondaryCostume;
            break;

        case "sharkBot":
            var equipment = Value;
            equipment.equipped = "SharkBot";
            equipment.sharkBot.costume = args.BoombotCostume;
            equipment.sharkBot.primary.ItemId = args.Primary;
            equipment.sharkBot.primary.costume = args.PrimaryCostume;
            equipment.sharkBot.secondary.ItemId = args.Secondary;
            equipment.sharkBot.secondary.costume = args.SecondaryCostume;
            break;

        case "ironBull":
            var equipment = Value;
            equipment.equipped = "IronBull";
            equipment.ironBull.costume = args.BoombotCostume;
            equipment.ironBull.primary.ItemId = args.Primary;
            equipment.ironBull.primary.costume = args.PrimaryCostume;
            equipment.ironBull.secondary.ItemId = args.Secondary;
            equipment.ironBull.secondary.costume = args.SecondaryCostume;
            break;

        case "roboMantis":
            var equipment = Value;
            equipment.equipped = "RoboMantis"
            equipment.roboMantis.costume = args.BoombotCostume;
            equipment.roboMantis.primary.ItemId = args.Primary;
            equipment.roboMantis.primary.costume = args.PrimaryCostume;
            equipment.roboMantis.secondary.ItemId = args.Secondary;
            equipment.roboMantis.secondary.costume = args.SecondaryCostume;
            break;
    }
    var updateEquippedItems = {
        PlayFabId: currentPlayerId,
        Data: {
            "equipment": JSON.stringify(equipment),
            "itemLevel": JSON.stringify(itemLevel)
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
    switch (currentEquipment.equipped) {
        case "MekaScorp":
            var gameplayParams = {
                "DisplayName": titleInfo.DisplayName,
                "RobotId": currentEquipment.equipped,
                "RobotSkinId": currentEquipment.mekaScorp.costume,
                "WeaponId": currentEquipment.mekaScorp.primary.ItemId,
                "WeaponSkinId": currentEquipment.mekaScorp.primary.costume,
                "HP": itemData.robotValues.MekaScorp.HP[itemLevel.MekaScorp.level - 1],
                "MoveScale": itemData.robotValues.MekaScorp.MoveScale,
                "DMG": itemData.weaponValues.Hammer.DMG[itemLevel.Hammer.level - 1],
                "CD": itemData.weaponValues.Hammer.CD,
                "CastTime": itemData.weaponValues.Hammer.CastTime,
                "UltDMGScale": itemData.weaponValues.Hammer.UltDMGScale,
                "UltCharge": itemData.weaponValues.Hammer.UltCharge
            }
            break;
        case "SharkBot":
            var gameplayParams = {
                "DisplayName": titleInfo.DisplayName,
                "RobotId": currentEquipment.equipped,
                "RobotSkinId": currentEquipment.sharkBot.costume,
                "WeaponId": currentEquipment.sharkBot.primary.ItemId,
                "WeaponSkinId": currentEquipment.sharkBot.primary.costume,
                "HP": itemData.robotValues.SharkBot.HP[itemLevel.SharkBot.level - 1],
                "MoveScale": itemData.robotValues.SharkBot.MoveScale,
                "DMG": itemData.weaponValues.Saw.DMG[itemLevel.Saw.level - 1],
                "CD": itemData.weaponValues.Saw.CD,
                "CastTime": itemData.weaponValues.Saw.CastTime,
                "UltDMGScale": itemData.weaponValues.Saw.UltDMGScale,
                "UltCharge": itemData.weaponValues.Saw.UltCharge
            }
            break;
        case "IronBull":
            var gameplayParams = {
                "DisplayName": titleInfo.DisplayName,
                "RobotId": currentEquipment.equipped,
                "RobotSkinId": currentEquipment.ironBull.costume,
                "WeaponId": currentEquipment.ironBull.primary.ItemId,
                "WeaponSkinId": currentEquipment.ironBull.primary.costume,
                "HP": itemData.robotValues.IronBull.HP[itemLevel.IronBull.level - 1],
                "MoveScale": itemData.robotValues.IronBull.MoveScale,
                "DMG": itemData.weaponValues.Drill.DMG[itemLevel.Drill.level - 1],
                "CD": itemData.weaponValues.Drill.CD,
                "CastTime": itemData.weaponValues.Drill.CastTime,
                "UltDMGScale": itemData.weaponValues.Drill.UltDMGScale,
                "UltCharge": itemData.weaponValues.Drill.UltCharge
            }
            break;
        case "RoboMantis":
            var gameplayParams = {
                "DisplayName": titleInfo.DisplayName,
                "RobotId": currentEquipment.equipped,
                "RobotSkinId": currentEquipment.roboMantis.costume,
                "WeaponId": currentEquipment.roboMantis.primary.ItemId,
                "WeaponSkinId": currentEquipment.roboMantis.primary.costume,
                "HP": itemData.robotValues.RoboMantis.HP[itemLevel.RoboMantis.level - 1],
                "MoveScale": itemData.robotValues.RoboMantis.MoveScale,
                "DMG": itemData.weaponValues.Axe.DMG[itemLevel.Axe.level - 1],
                "CD": itemData.weaponValues.Axe.CD,
                "CastTime": itemData.weaponValues.Axe.CastTime,
                "UltDMGScale": itemData.weaponValues.Axe.UltDMGScale,
                "UltCharge": itemData.weaponValues.Axe.UltCharge
            }
            break;
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