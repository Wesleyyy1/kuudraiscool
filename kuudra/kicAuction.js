import Settings from "../settings/config.js";
import SkullTextures from "./skullTextures";
import { capitalizeEachWord, kicPrefix, errorHandler, delay } from "../utils/generalUtils";
import { getPriceData, attributes } from "../kuudra/priceUtils";

const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
const ItemsMC = Java.type("net.minecraft.init.Items");

const pane = new Item('minecraft:stained_glass_pane').setDamage(14).setName("").itemStack;
const whitePane = new Item('minecraft:stained_glass_pane').setDamage(0).setName("").itemStack;
const back = new Item('minecraft:arrow').setName("&c&lBack").itemStack;
const close = new Item('minecraft:barrier').setName("&c&lClose").itemStack;
const itemBought = new Item('minecraft:barrier').setName("&c&lBOUGHT!").itemStack;

const kicAuctionItems = {
    armor: new Item('minecraft:diamond_chestplate').setName("&b&lArmor").itemStack,
    equipment: new Item('minecraft:emerald').setName("&a&lEquipment").itemStack,
    fishingArmor: new Item('minecraft:fishing_rod').setName("&9&lFishing Armor").itemStack,
    shards: new Item('minecraft:prismarine_shard').setName("&3&lShards").itemStack,
    disabledShards: new Item('minecraft:prismarine_shard').setName("&7&l&mShards").itemStack,
};
const goldIngot = new Item('minecraft:gold_ingot').setName("&6&lPrice filter");
const leverItem = new Item('minecraft:lever').setName("&6&lToggle cheapest");
const categoryItems = {
    helmets: new Item('minecraft:diamond_helmet').setName("&6&lCategory"),
    chestplates: new Item('minecraft:diamond_chestplate').setName("&6&lCategory"),
    leggings: new Item('minecraft:diamond_leggings').setName("&6&lCategory"),
    boots: new Item('minecraft:diamond_boots').setName("&6&lCategory")
};
const armorCategories = ["helmets", "chestplates", "leggings", "boots"];
const armorTypes = ["crimson", "aurora", "terror", "hollow", "fervor"];
const equipmentCategories = {
    necklaces: ["Molten Necklace", "Lava Shell Necklace", "Delirium Necklace", "Magma Necklace", "Vanquished Magma Necklace"],
    cloaks: ["Molten Cloak", "Scourge Cloak", "Ghast Cloak", "Vanquished Ghast Cloak"],
    belts: ["Molten Belt", "Implosion Belt", "Scoville Belt", "Blaze Belt", "Vanquished Blaze Belt"],
    bracelets: ["Molten Bracelet", "Gauntlet Of Contagion", "Flaming Fist", "Glowstone Gauntlet", "Vanquished Glowstone Gauntlet"]
};
const fishingTypes = ["magma lord", "thunder"];

let lastGui = null;
let inventory = null;
let filterCheapest = true;
let armorCheapest = false;
let priceData = null;
let activeArmorCategory = "helmets";
let activeArmorType = "crimson";
let activeEquipmentCategory = "necklaces";
let activeEquipmentType = "Molten Necklace";
let activeFishingCategory = "helmets";
let activeFishingType = "magma lord";
let lastDataCall = null;
let customWindowId = null;
let lastSection = null;
let currentItem = null;
let currentItemPrice = null;
let currentItemUuid = null;

let purchaseHistory = {
    timestamp: null,
    uuids: []
};

const slots = [10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 42, 43];

let guiEnabled = true;

function updateInventory(title, items) {
    if (inventory === null) {
        inventory = new InventoryBasic(title, true, 54);
    } else {
        inventory.func_174888_l();
    }

    inventory.func_110133_a(title);

    for (let i = 0; i < 54; i++) {
        inventory.func_70299_a(i, items[i] || null);
    }
}

function openGui(title, items) {
    if (!guiEnabled) return;

    updateInventory(title, items);

    lastGui = new GuiChest(Player.getPlayer().field_71071_by, inventory);
    customWindowId = Math.floor(priceData.timestamp / 10000) || 28492857;
    lastGui.field_147002_h.field_75152_c = customWindowId;

    GuiHandler.openGui(lastGui);
}

function timeSince(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes} min ${seconds} sec ago`;
}

function makeInfoItem() {
    const infoItem = new Item('minecraft:redstone_torch');

    const lore = [];

    lore.push("");
    lore.push("&6> Search");
    let attribute1Text = `&7- &b${priceData.attribute1}`;

    if (priceData.attributeLvl1 !== null) {
        attribute1Text += ` ${priceData.attributeLvl1}`;
    }
    lore.push(attribute1Text);

    if (priceData.attribute2 != null) {
        let attribute2Text = `&7- &b${priceData.attribute2}`;
        if (priceData.attributeLvl2 !== null) {
            attribute2Text += ` ${priceData.attributeLvl2}`;
        }
        lore.push(attribute2Text);
    }

    lore.push("");

    lore.push("&6> Last Updated");
    lore.push(`&7- &b${timeSince(priceData.timestamp)}`);

    infoItem.setName("&a&lInfo");
    infoItem.setLore(lore);

    return infoItem.itemStack;
}

function KICAH() {
    currentItem = null;
    currentItemPrice = null;
    currentItemUuid = null;
    if (lastSection !== null) {
        const sectionHandlers = {
            "armor": ArmorAH,
            "equipment": EquipmentAH,
            "fishing": FishingAH,
            "shard": ShardAH
        };

        const handler = sectionHandlers[lastSection];
        if (handler) handler();
        return;
    }

    if (priceData === null) return;

    const items = Array(54).fill(pane);
    
    items[8] = makeInfoItem();
    items[19] = kicAuctionItems.armor;
    items[21] = kicAuctionItems.equipment;
    items[23] = kicAuctionItems.fishingArmor;
    items[25] = priceData.shards.length > 0 ? kicAuctionItems.shards : kicAuctionItems.disabledShards;
    items[49] = close;

    openGui("§aKIC-Auction", items);
}

function textToID(string) {
    return string.toLowerCase().replaceAll(" ", "_");
}

function createLore(active, items) {
    return items.map(item => active === item ? `&a> ${capitalizeEachWord(item)}` : `&7${capitalizeEachWord(item)}`);
}

function determineColor(itemId, pieceType) {
    const colorMap = {
        "CRIMSON": 0xFF6F0C,
        "AURORA": 0x2841F1,
        "TERROR": 0x3E05AF,
        "FERVOR": (pieceType === "chestplate" ? 0xF04729 : 0x17BF89),
        "HOLLOW": (pieceType === "chestplate" ? 0xFFCB0D : 0xE3FFFA),
        "MAGMA_LORD": 0x6F0F08,
        "THUNDER": 0x24DDE5
    };

    var foundKey = Object.keys(colorMap).find(key => itemId.includes(key));
    return foundKey ? colorMap[foundKey] : 0xFFFFFF;
}

function ArmorAH() {
    lastSection = "armor";
    const items = Array(54).fill(pane);
    items[8] = makeInfoItem();

    let priceFilterLore = createLore(filterCheapest ? "Cheapest to expensive" : "Expensive to cheapest", ["Cheapest to expensive", "Expensive to cheapest"]);
    items[47] = goldIngot.setLore(priceFilterLore).itemStack;

    items[49] = back;

    let cheapestToggleLore = createLore(armorCheapest ? "ON" : "OFF", ["ON", "OFF"]);
    items[51] = leverItem.setLore(cheapestToggleLore).itemStack;

    let categoryLore = createLore(activeArmorCategory, armorCategories);
    items[3] = categoryItems[activeArmorCategory].setLore(categoryLore).itemStack;

    let typeLore = armorCheapest ? armorTypes.map(type => `&7&m${capitalizeEachWord(type)}`) : createLore(activeArmorType, armorTypes);
    const typeChangeIcon = new Item('minecraft:comparator').setName(armorCheapest ? "&7&l&mChange type" : "&6&lChange type").setLore(typeLore).itemStack;
    items[5] = typeChangeIcon;

    let pieceType = activeArmorCategory === "boots" || activeArmorCategory === "leggings" ? activeArmorCategory : activeArmorCategory.slice(0, -1);

    let armorData = armorCheapest ?
        armorTypes.reduce((acc, type) => {
            const data = priceData.armor[activeArmorCategory][`${type}_${pieceType}`];
            if (data) {
                acc.push(...data);
            }
            return acc;
        }, []) :
        (priceData.armor[activeArmorCategory][`${activeArmorType}_${pieceType}`].slice());

    armorData.sort((a, b) => (filterCheapest ? a.price - b.price : b.price - a.price));
    armorData = armorData.slice(0, 28);

    armorData.forEach((item, index) => {
        const slot = slots[index];
        if (purchaseHistory.uuids.includes(item.uuid)) {
            items[slot] = itemBought;
            return;
        }
        const lore = createCustomItemLore(item);
        const name = createName(item);
        const customItem = activeArmorCategory === "helmets" ? skullItem(SkullTextures[item.itemId], name, lore, item) : createCustomItem(item, name, lore, `minecraft:leather_${pieceType}`);
        let color = determineColor(item.itemId, pieceType);
        ItemsMC.field_151027_R.func_82813_b(customItem, color);
        items[slot] = customItem;
    });

    slots.slice(armorData.length).forEach(slot => items[slot] = whitePane);
    openGui(`§aKIC-Auction | Armor`, items);
}

function EquipmentAH() {
    lastSection = "equipment";
    const items = Array(54).fill(pane);
    items[8] = makeInfoItem();

    let priceFilterLore = createLore(filterCheapest ? "Cheapest to expensive" : "Expensive to cheapest", ["Cheapest to expensive", "Expensive to cheapest"]);
    items[47] = goldIngot.setLore(priceFilterLore).itemStack;

    items[49] = back;

    let categoryLore = createLore(activeEquipmentCategory, Object.keys(equipmentCategories));
    const equipmentCategoryIcon = new Item('minecraft:nether_star').setName("&6&lCategory").setLore(categoryLore).itemStack;
    items[3] = equipmentCategoryIcon;

    let typeLore = createLore(activeEquipmentType, equipmentCategories[activeEquipmentCategory]);
    const typeChangeIcon = new Item('minecraft:comparator').setName("&6&lChange type").setLore(typeLore).itemStack;
    items[5] = typeChangeIcon;

    let equipmentTypeID = textToID(activeEquipmentType);
    let equipmentData = priceData.equipment[activeEquipmentCategory][equipmentTypeID].slice();
    equipmentData.sort((a, b) => (filterCheapest ? a.price - b.price : b.price - a.price));

    equipmentData.forEach((item, index) => {
        const slot = slots[index];
        if (purchaseHistory.uuids.includes(item.uuid)) {
            items[slot] = itemBought;
            return;
        }
        const lore = createCustomItemLore(item);
        const name = createName(item);
        items[slot] = skullItem(SkullTextures[equipmentTypeID], `§a${name}`, lore, item);
    });

    slots.slice(equipmentData.length).forEach(slot => items[slot] = whitePane);

    openGui("§aKIC-Auction | Equipment", items);
}

function FishingAH() {
    lastSection = "fishing";
    const items = Array(54).fill(pane);
    items[8] = makeInfoItem();

    let priceFilterLore = createLore(filterCheapest ? "Cheapest to expensive" : "Expensive to cheapest", ["Cheapest to expensive", "Expensive to cheapest"]);
    items[47] = goldIngot.setLore(priceFilterLore).itemStack;

    items[49] = back;

    let categoryLore = createLore(activeFishingCategory, armorCategories);
    items[3] = categoryItems[activeFishingCategory].setLore(categoryLore).itemStack;

    let typeLore = createLore(activeFishingType, fishingTypes);
    const typeChangeIcon = new Item('minecraft:comparator').setName("&6&lChange type").setLore(typeLore).itemStack;
    items[5] = typeChangeIcon;

    let pieceType = activeFishingCategory === "boots" || activeFishingCategory === "leggings" ? activeFishingCategory : activeFishingCategory.slice(0, -1);
    let fishingData = priceData.armor[activeFishingCategory][`${textToID(activeFishingType)}_${pieceType}`].slice();
    fishingData.sort((a, b) => (filterCheapest ? a.price - b.price : b.price - a.price));

    fishingData.forEach((item, index) => {
        const slot = slots[index];
        if (purchaseHistory.uuids.includes(item.uuid)) {
            items[slot] = itemBought;
            return;
        }
        const lore = createCustomItemLore(item);
        const name = createName(item);
        const customItem = activeFishingCategory === "helmets" ? skullItem(SkullTextures[item.itemId], name, lore, item) : createCustomItem(item, `&a${name}`, lore, `minecraft:leather_${pieceType}`);
        let color = determineColor(item.itemId, pieceType);
        ItemsMC.field_151027_R.func_82813_b(customItem, color);
        items[slot] = customItem;
    });

    slots.slice(fishingData.length).forEach(slot => items[slot] = whitePane);

    openGui("§aKIC-Auction | Fishing Armor", items);
}

function ShardAH() {
    lastSection = "shard";
    const items = Array(54).fill(pane);
    items[8] = makeInfoItem();
    
    let priceFilterLore = createLore(filterCheapest ? "Cheapest to expensive" : "Expensive to cheapest", ["Cheapest to expensive", "Expensive to cheapest"]);
    items[47] = goldIngot.setLore(priceFilterLore).itemStack;

    items[49] = back;

    let shardData = priceData.shards.slice();
    shardData.sort((a, b) => (filterCheapest ? a.price - b.price : b.price - a.price));

    shardData.forEach((item, index) => {
        const slot = slots[index];
        if (purchaseHistory.uuids.includes(item.uuid)) {
            items[slot] = itemBought;
            return;
        }
        const lore = createCustomItemLore(item);

        items[slot] = createCustomItem(item, "&fAttribute Shard", lore, "minecraft:prismarine_shard");
    });

    slots.slice(shardData.length).forEach(slot => items[slot] = whitePane);

    openGui(`§aKIC-Auction | Shards`, items);
}

function createCustomItem(item, itemName, itemLore, mcId) {
    const tag = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
    const customItem = new Item(mcId);
    
    tag.set("uuid", item.uuid);
    tag.set("item-price", item.price.toString());
    tag.set("item-id", item.itemId);

    customItem.itemStack.func_77982_d(tag.rawNBT);

    customItem.setName(itemName);
    customItem.setLore(itemLore);
      
    return customItem.itemStack;
}

function skullItem(texture, name, lore, item) {
    const tag = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
    const skullOwner = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
    const properties = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
    const textures = new NBTTagList(new net.minecraft.nbt.NBTTagList());
    const textureString = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
    const display = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());

    const uuid = item.uuid;

    skullOwner.setString("Id", uuid);
    skullOwner.setString("Name", uuid);

    textureString.setString("Value", texture);
    textures.appendTag(textureString);

    display.setString("Name", name);
    tag.set("display", display);
    tag.set("uuid", uuid);
    tag.set("item-price", item.price.toString());
    tag.set("item-id", item.itemId);

    properties.set("textures", textures);
    skullOwner.set("Properties", properties);
    tag.set("SkullOwner", skullOwner);

    const customItem = new Item(397).setDamage(3);
    customItem.itemStack.func_77982_d(tag.rawNBT);
    if (lore !== null && lore.length > 0) {
        customItem.setLore(lore);
    }
    return customItem.itemStack;
}

function createName(item) {
    const itemTypeName = capitalizeEachWord(item.itemId.replaceAll("_", " "));
    let rarity = "§8";
    let reforge = "";
    let stars = "";

    if (safeCheck(item.extra)) {
        if (Array.isArray(item.extra.lore)) {
            rarity = getRarity(item.extra.lore[item.extra.lore.length - 1]);
        }

        if (safeCheck(item.extra.extraAttributes)) {
            const { modifier, upgrade_level } = item.extra.extraAttributes;
            if (modifier) {
                reforge = capitalizeEachWord(modifier) + " ";
            }
            stars = calculateStars(upgrade_level);
        }
    }

    return rarity + reforge + itemTypeName + stars;
}

function safeCheck(obj) {
    return obj !== undefined && obj !== null;
}

function calculateStars(upgradeLvlStr) {
    if (!upgradeLvlStr) return "";

    const upgradeLvl = parseInt(upgradeLvlStr);
    if (isNaN(upgradeLvl) || upgradeLvl <= 0) return "";

    let remainingLevels = upgradeLvl;
    const purpleStars = Math.min(Math.floor(remainingLevels / 2), 2);
    remainingLevels -= purpleStars * 2;
    const goldStars = Math.min(remainingLevels, 5 - purpleStars);

    let stars = "";
    if (purpleStars > 0) stars += "§d" + "✪".repeat(purpleStars);
    if (goldStars > 0) stars += "§6" + "✪".repeat(goldStars);
    return stars ? " " + stars : "";
}

function getRarity(lastLoreLine) {
    const rarityLine = lastLoreLine.toUpperCase();
    if (rarityLine.includes("DIVINE")) return "§b";
    if (rarityLine.includes("MYTHIC")) return "§d";
    if (rarityLine.includes("LEGENDARY")) return "§6";
    if (rarityLine.includes("EPIC")) return "§5";
    if (rarityLine.includes("RARE")) return "§9";
    if (rarityLine.includes("UNCOMMON")) return "§a";
    return "§f";
}

function createCustomItemLore(item) {
    const lore = [];

    if (safeCheck(item.extra) && Array.isArray(item.extra.lore)) {
        lore.push(...item.extra.lore);
    }

    lore.push("§8——————————————————————");
    lore.push(`§7Buy it now: §6${formatNumber(item.price)}`);
    lore.push("");
    lore.push("§eClick to view the auction!");

    return lore;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function refreshPage(name) {
    const pageHandlers = {
        "§aKIC-Auction | Armor": ArmorAH,
        "§aKIC-Auction | Equipment": EquipmentAH,
        "§aKIC-Auction | Fishing Armor": FishingAH,
        "§aKIC-Auction | Shards": ShardAH
    };

    for (let title in pageHandlers) {
        if (name.startsWith(title)) {
            pageHandlers[title]();
            return;
        }
    }

    KICAH();
}

function switchCategory(categories, current, nextIndexShift) {
    const currentIndex = categories.indexOf(current);
    return categories[(currentIndex + nextIndexShift + categories.length) % categories.length];
}

function switchType(types, current, nextIndexShift) {
    const currentIndex = types.indexOf(current);
    return types[(currentIndex + nextIndexShift + types.length) % types.length];
}

function refreshData(arg1, arg2, arg3, arg4, openAh) {
    lastDataCall = {
        arg1,
        arg2,
        arg3,
        arg4,
        date: Date.now()
    };
    getPriceData(arg1, arg2, arg3, arg4, "ka", (data) => {
        if (data === null) {
            lastDataCall = null;
        } else {
            priceData = data;
        }
        if (openAh) {
            KICAH();
        }
    });
}

function closeGuiPermanently() {
    guiEnabled = false;
    if (lastGui) {
        Client.currentGui.close();
    }
}

register("command", (arg1, arg2, arg3, arg4) => {
    if (guiEnabled) {
        try {
            if (!arg1 && priceData !== null) {
                KICAH();
            } else {
                lastSection = null;
                refreshData(arg1, arg2, arg3, arg4, true);
            }
        } catch (error) {
            ChatLib.chat(`${kicPrefix} &cAuction gui got disabled due to an error. Please report this in the discord server!`);
            errorHandler("Error in KIC-Auction GUI", error.message, "kicAuction.js")
            closeGuiPermanently();
        }
    } else {
        ChatLib.chat(`${kicPrefix} &cThe gui is currently disabled due to an error. Please report this in the discord server!`);
    }
}).setTabCompletions((args) => {
    if (args.length > 4) return [];
    let lastArg = args[args.length - 1].toLowerCase();
    return attributes.filter(attr => attr.toLowerCase().startsWith(lastArg));
}).setName("kicauction", true).setAliases("ka");

register('guiMouseClick', (x, y, button, gui, event) => {
    if (lastGui === null ||
        inventory === null ||
        Client.getMinecraft().field_71462_r !== lastGui ||
        Player.getContainer().getWindowId() !== customWindowId) return;
    try {
        cancel(event);

        const slot = gui.getSlotUnderMouse();
        if(!slot) return;

        const position = slot.field_75222_d;
        const inventoryName = Player.getContainer().getName();

        if (position === 8) {
            if (lastDataCall !== null && (Date.now() - lastDataCall.date) > 150000) {
                refreshData(lastDataCall.arg1, lastDataCall.arg2, lastDataCall.arg3, lastDataCall.arg4, false);
            }
            
            return;
        }

        if (inventoryName === "§aKIC-Auction") {
            switch (position) {
                case 19: ArmorAH(); break;
                case 21: EquipmentAH(); break;
                case 23: FishingAH(); break;
                case 25: if (priceData.shards.length > 0) {ShardAH()}; break;
                case 49: 
                    Client.currentGui.close();
                    currentItem = null;
                    currentItemPrice = null;
                    currentItemUuid = null;
                    break;
                default: break;
            }
        } else {
            if (position === 49) {
                lastSection = null;
                KICAH();
            } else if (slots.includes(position)) {
                let itemStack = inventory.func_70301_a(position);
                if (itemStack !== null && itemStack !== whitePane && itemStack !== itemBought) {
                    let nbtData = itemStack.func_77978_p();
                    currentItemUuid = nbtData.func_74779_i("uuid");
                    currentItem = nbtData.func_74779_i("item-id");
                    currentItemPrice = nbtData.func_74779_i("item-price");
                    if (currentItemUuid) {
                        Client.currentGui.close();
                        ChatLib.command("viewauction " + currentItemUuid);
                    }
                }
            } else if (position === 47) {
                filterCheapest = !filterCheapest;
                refreshPage(inventoryName);
            } else if (inventoryName.startsWith("§aKIC-Auction | Armor")) {
                if (position === 51) {
                    armorCheapest = !armorCheapest;
                    ArmorAH();
                } else if (position === 3) {
                    activeArmorCategory = switchCategory(armorCategories, activeArmorCategory, button === 0 ? 1 : -1);
                    ArmorAH();
                } else if (position === 5 && !armorCheapest) {
                    activeArmorType = switchType(armorTypes, activeArmorType, button === 0 ? 1 : -1);
                    ArmorAH();
                }
            } else if (inventoryName.startsWith("§aKIC-Auction | Equipment")) {
                if (position === 3) {
                    activeEquipmentCategory = switchCategory(Object.keys(equipmentCategories), activeEquipmentCategory, button === 0 ? 1 : -1);
                    activeEquipmentType = equipmentCategories[activeEquipmentCategory][0];
                    EquipmentAH();
                } else if (position === 5) {
                    const types = equipmentCategories[activeEquipmentCategory];
                    activeEquipmentType = switchType(types, activeEquipmentType, button === 0 ? 1 : -1);
                    EquipmentAH();
                }
            } else if (inventoryName.startsWith("§aKIC-Auction | Fishing Armor")) {
                if (position === 3) {
                    activeFishingCategory = switchCategory(armorCategories, activeFishingCategory, button === 0 ? 1 : -1);
                    FishingAH();
                } else if (position === 5) {
                    activeFishingType = switchType(fishingTypes, activeFishingType, button === 0 ? 1 : -1);
                    FishingAH();
                }
            }
        }
    } catch (error) {
        ChatLib.chat(`${kicPrefix} &cAuction gui got disabled due to an error. Please report this in the discord server!`);
        errorHandler("Error in KIC-Auction GUI", error.message, "kicAuction.js")
        closeGuiPermanently();
    }
});

register("guiKey", (char, keyCode, gui, event) => {
    if (lastGui !== null &&
        inventory !== null &&
        Client.getMinecraft().field_71462_r === lastGui &&
        Player.getContainer().getWindowId() === customWindowId &&
        keyCode !== Keyboard.KEY_ESCAPE &&
        keyCode !== Keyboard.KEY_E) {
        cancel(event);
        currentItem = null;
        currentItemPrice = null;
        currentItemUuid = null;
    }
});

register("chat", function (item, price, event) {
    if (currentItem === null || currentItemPrice === null || currentItemUuid === null) return;

    try {
        const intGlobalsPrice = parseInt(currentItemPrice);
        const intPrice = parseInt(price.replaceAll(",", ""));
        const itemId = item.replaceAll(" ", "_").toLowerCase();
        if (!isNaN(intPrice) && intPrice > 0) {
            if (intPrice === intGlobalsPrice && itemId.includes(currentItem.toLowerCase())) {
                if (purchaseHistory.timestamp === priceData.timestamp) {
                    purchaseHistory.uuids.push(currentItemUuid);
                } else {
                    purchaseHistory.timestamp = priceData.timestamp;
                    purchaseHistory.uuids = [currentItemUuid];
                }
                if (Settings.openKAGUIAgain) {
                    delay(() => KICAH, 500);
                }
            }
        }
    } catch (error) {
        // Ignore
    }
    currentItem = null;
    currentItemPrice = null;
    currentItemUuid = null;
}).setCriteria("You purchased ${item} for ${price} coins!");

register("chat", function (event) {
    if (currentItem === null || currentItemPrice === null || currentItemUuid === null) return;

    if (purchaseHistory.timestamp === priceData.timestamp) {
        purchaseHistory.uuids.push(currentItemUuid);
    } else {
        purchaseHistory.timestamp = priceData.timestamp;
        purchaseHistory.uuids = [currentItemUuid];
    }
    if (Settings.openKAGUIAgain) {
        delay(() => KICAH, 500);
    }

    currentItem = null;
    currentItemPrice = null;
    currentItemUuid = null;
}).setCriteria("This auction wasn't found!");