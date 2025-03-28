import axios from "axios";
import Settings from "../settings/config.js";
import CustomizeSettings from "../settings/customizeConfig.js";
import {
    capitalizeEachWord,
    delay,
    errorHandler,
    fixNumber,
    formatTimeMain,
    getColorCode,
    getRoles,
    isKeyValid,
    kicDebugMsg,
    kicPrefix,
    parseShorthandNumber,
    registerWhen,
    showInvalidReasonMsg,
    showMissingRolesMsg
} from "../utils/generalUtils.js";
import ScalableGui from "../utils/ScalableGui.js";
import World from "../utils/World.js";
import {kicData} from "../utils/data.js";

const kuudraData = {
    KEY: {
        MAGE: "ENCHANTED_MYCELIUM",
        BARBARIAN: "ENCHANTED_RED_SAND"
    },
    BASIC: {
        key: {
            name: "&9Kuudra Key",
            coins: 160000,
            items: 2
        },
    },
    HOT: {
        key: {
            name: "&5Hot Kuudra Key",
            coins: 320000,
            items: 4
        },
    },
    BURNING: {
        key: {
            name: "&5Burning Kuudra Key",
            coins: 600000,
            items: 16
        },
    },
    FIERY: {
        key: {
            name: "&5Fiery Kuudra Key",
            coins: 1200000,
            items: 40
        },
    },
    INFERNAL: {
        key: {
            name: "&6Infernal Kuudra Key",
            coins: 2400000,
            items: 80
        },
    }
};

const dontRerollIds = ["WHEEL_OF_FATE", "BURNING_KUUDRA_CORE", "ENRAGER", "TENTACLE_DYE", "ULTIMATE_FATAL_TEMPO", "ULTIMATE_INFERNO"];
let dontRerollAttributes = [];

const tiers = ["UNKNOWN", "BASIC", "HOT", "BURNING", "FIERY", "INFERNAL"];

const bazaarItems = {};
const attributesItems = {};
const auctionItems = {};
let canReroll = false;
let rerolled = false;
let rerollPriceChecked = {
    checked: false,
    reroll: false
};
let dontReroll = false;
let shouldBuy = false;
let chestOpened = false;
let totalProfit = 0;
let runStartTime = 0;
let runEndTime = 0;
let kuudraTier = "UNKNOWN";
let gr = false;

const click = (slot, skipUpdate = false) => {
    const container = Player.getContainer();
    if (!container) return;
    const containerSize = container.getSize();
    if (slot < 0 || slot >= containerSize) return;
    if (container.getName()?.removeFormatting() !== "Paid Chest") return;
    kicDebugMsg(`Slot: ${slot} is a valid slot!`);
    if (slot === 31) {
        chestOpened = true;
        if (!skipUpdate) {
            updateProfitTracker();
        }
    }
    container.click(slot);
}

function isPaidChest() {
    return Player.getContainer()?.getName()?.removeFormatting() === "Paid Chest";
}

function shouldReroll() {
    if (Settings.superSecretSettings && Settings.kuudraAutoReroll && Settings.kuudraAutoRerollT5Only && kuudraTier !== "INFERNAL") {
        return false;
    }
    return (
        isPaidChest() &&
        !dontReroll &&
        rerollPriceChecked?.checked &&
        rerollPriceChecked?.reroll &&
        canReroll &&
        !rerolled &&
        !chestOpened &&
        !gr
    );
}

function getKuudraTier() {
    const zoneLine = Scoreboard?.getLines()?.find((line) =>
        line.getName().startsWith(" §7⏣") || line.getName().startsWith(" §5ф")
    );

    const zone = zoneLine ? zoneLine.getName().removeFormatting().substring(3) : "None";

    if (zone === "None") {
        return 0;
    }

    return parseInt(zone.charAt(zone.length - 2)) || 0;
}

const profitExample = `${kicPrefix} &a&lChest profit\n\n` +
    `&eTotal Profit: &a+4.48M\n\n` +
    `&c-3.87M &7|&r &6Infernal Kuudra Key\n` +
    `&a+4.30M &7|&r &6Crimson Chestplate &7[&bBreeze 5&7] &7[&bMagic Find 4&7]\n` +
    `&a+1.53M &7|&r &7Ferocious Mana 5\n` +
    `&a+2.52M &7|&r &dCrimson Essence &ex1600`;

const profitGui = new ScalableGui("kuudraProfit", "kuudraProfit", ["Kuudra"], isPaidChest, profitExample, true);
profitGui.setCommand("kuudraprofit");

const rerollMsg = "&c&lREROLL THIS CHEST!";
const rerollGui = new ScalableGui("kuudraReroll", "kuudraRerollNotifier", ["Kuudra"], shouldReroll, rerollMsg, true);
rerollGui.setMessage(rerollMsg);
rerollGui.setCommand("kuudrarerollnotifier");

const profitTrackerExample = `${kicPrefix} &a&lProfit Tracker\n\n` +
    `${getColorCode(CustomizeSettings.ProfitTrackerColorProfit)}&lProfit: &r${getColorCode(CustomizeSettings.ProfitTrackerColorProfit)}400.48M\n` +
    `${getColorCode(CustomizeSettings.ProfitTrackerColorChests)}&lChests: &r${getColorCode(CustomizeSettings.ProfitTrackerColorChests)}5 chests\n` +
    `${getColorCode(CustomizeSettings.ProfitTrackerColorAverage)}&lAverage: &r${getColorCode(CustomizeSettings.ProfitTrackerColorAverage)}80.97M/Chest\n` +
    `${getColorCode(CustomizeSettings.ProfitTrackerColorTime)}&lTime: &r${getColorCode(CustomizeSettings.ProfitTrackerColorTime)}10m40s\n` +
    `${getColorCode(CustomizeSettings.ProfitTrackerColorRate)}&lRate: &r${getColorCode(CustomizeSettings.ProfitTrackerColorRate)}2.25B/hr`;

function checkSubArea() {
    return World.world !== "Crimson Isle" || World.subArea === "Forgotten Skull";
}

const profitTrackerGui = new ScalableGui("kuudraProfitTracker", "kuudraProfitTracker", ["Kuudra", "Crimson Isle"], checkSubArea, profitTrackerExample, true, true);
profitTrackerGui.setCommand("kuudraprofittracker");
updateProfitTracker();

CustomizeSettings.registerListener("Profit Color", v => {
    CustomizeSettings.ProfitTrackerColorProfit = v;
    profitTrackerGui.setExample(profitTrackerExample);
    updateProfitTracker();
});

CustomizeSettings.registerListener("Chests Color", v => {
    CustomizeSettings.ProfitTrackerColorChests = v;
    profitTrackerGui.setExample(profitTrackerExample);
    updateProfitTracker();
});

CustomizeSettings.registerListener("Average Color", v => {
    CustomizeSettings.ProfitTrackerColorAverage = v;
    profitTrackerGui.setExample(profitTrackerExample);
    updateProfitTracker();
});

CustomizeSettings.registerListener("Time Color", v => {
    CustomizeSettings.ProfitTrackerColorTime = v;
    profitTrackerGui.setExample(profitTrackerExample);
    updateProfitTracker();
});

CustomizeSettings.registerListener("Rate Color", v => {
    CustomizeSettings.ProfitTrackerColorRate = v;
    profitTrackerGui.setExample(profitTrackerExample);
    updateProfitTracker();
});

registerWhen(
    register("chat", (msg) => {
        if (msg.includes("Okay adventurers, I will go and fish up Kuudra!")) {
            runStartTime = Date.now();
        } else if (msg.includes("KUUDRA DOWN!") || msg.includes("DEFEAT")) {
            runEndTime = Date.now();
        }
    }).setCriteria("${msg}"),
    () => World.world === "Kuudra" && Settings.kuudraProfitTracker
);

registerWhen(
    register("guiMouseClick", (x, y, button, gui) => {
        if (
            isPaidChest() &&
            gui?.getSlotUnderMouse()?.field_75222_d === 31 &&
            !chestOpened
        ) {
            chestOpened = true;
            updateProfitTracker();
        }
    }),
    () => World.world === "Kuudra" && Settings.kuudraProfitTracker
);

register("command", (...args) => {
    if (!args[0] || args.length !== 1) {
        ChatLib.chat(`${kicPrefix} &cPlease provide a single numeric value.`);
        return;
    }

    const profitAmount = parseShorthandNumber(args[0]);
    const updatedProfit = kicData.kuudraProfitTrackerData.profit + profitAmount;

    if (updatedProfit > Number.MAX_SAFE_INTEGER) {
        kicData.kuudraProfitTrackerData.profit = Number.MAX_SAFE_INTEGER;
        ChatLib.chat(`${kicPrefix} &cProfit tracker was capped at the maximum allowed value.`);
    } else if (updatedProfit < -Number.MAX_SAFE_INTEGER) {
        kicData.kuudraProfitTrackerData.profit = -Number.MAX_SAFE_INTEGER;
        ChatLib.chat(`${kicPrefix} &cProfit tracker was capped at the minimum allowed value.`);
    } else {
        kicData.kuudraProfitTrackerData.profit = updatedProfit;
        ChatLib.chat(`${kicPrefix} &aProfit tracker was updated! Added ${fixNumber(profitAmount)} to the total.`);
    }

    kicData.save();
    updateProfitTracker();
}).setName("addprofit", true);

register("command", (...args) => {
    if (!args[0] || args.length !== 1) {
        ChatLib.chat(`${kicPrefix} &cPlease provide a single numeric value.`);
        return;
    }

    const profitAmount = parseShorthandNumber(args[0]);

    const updatedProfit = kicData.kuudraProfitTrackerData.profit - profitAmount;

    if (updatedProfit > Number.MAX_SAFE_INTEGER) {
        kicData.kuudraProfitTrackerData.profit = Number.MAX_SAFE_INTEGER;
        ChatLib.chat(`${kicPrefix} &cProfit tracker was capped at the maximum allowed value.`);
    } else if (updatedProfit < -Number.MAX_SAFE_INTEGER) {
        kicData.kuudraProfitTrackerData.profit = -Number.MAX_SAFE_INTEGER;
        ChatLib.chat(`${kicPrefix} &cProfit tracker was capped at the minimum allowed value.`);
    } else {
        kicData.kuudraProfitTrackerData.profit = updatedProfit;
        ChatLib.chat(`${kicPrefix} &aProfit tracker was updated! Removed ${fixNumber(profitAmount)} from the total.`);
    }

    kicData.save();
    updateProfitTracker();
}).setName("removeprofit", true);

register("command", () => {
    kicData.kuudraProfitTrackerData.profit = 0;
    kicData.kuudraProfitTrackerData.chests = 0;
    kicData.kuudraProfitTrackerData.time = 0;
    kicData.save();
    updateProfitTracker();
    ChatLib.chat(`${kicPrefix} &aProfit tracker data was reset!`);
}).setName("kicresetprofittracker", true);

register("worldLoad", () => {
    chestOpened = false;
    runStartTime = 0;
    runEndTime = 0;
});

function updateProfitTracker() {
    if (chestOpened && totalProfit > 0 && runStartTime && runEndTime) {
        const elapsedTime = runEndTime - runStartTime;

        const updatedProfit = kicData.kuudraProfitTrackerData.profit + totalProfit;

        if (updatedProfit > Number.MAX_SAFE_INTEGER) {
            kicData.kuudraProfitTrackerData.profit = Number.MAX_SAFE_INTEGER;
            kicDebugMsg(`Profit capped: Maximum positive profit value reached.`);
        } else if (updatedProfit < -Number.MAX_SAFE_INTEGER) {
            kicData.kuudraProfitTrackerData.profit = -Number.MAX_SAFE_INTEGER;
            kicDebugMsg(`Profit capped: Maximum negative profit value reached.`);
        } else {
            kicData.kuudraProfitTrackerData.profit = updatedProfit;
        }

        kicData.kuudraProfitTrackerData.chests++;
        kicData.kuudraProfitTrackerData.time += elapsedTime;
        kicData.save();

        kicDebugMsg(`Updating profit tracker with Profit: +${fixNumber(totalProfit)}, Chests: +1, time: +${elapsedTime}`);
    }

    const {profit, chests, time} = kicData.kuudraProfitTrackerData;

    const average = chests ? profit / chests : 0;
    const rate = time ? (profit / time) * 3600000 : 0;

    profitTrackerGui.setMessage(
        `${kicPrefix} &a&lProfit Tracker\n\n` +
        `${getColorCode(CustomizeSettings.ProfitTrackerColorProfit)}&lProfit: &r${getColorCode(CustomizeSettings.ProfitTrackerColorProfit)}${fixNumber(profit)}\n` +
        `${getColorCode(CustomizeSettings.ProfitTrackerColorChests)}&lChests: &r${getColorCode(CustomizeSettings.ProfitTrackerColorChests)}${chests} chests\n` +
        `${getColorCode(CustomizeSettings.ProfitTrackerColorAverage)}&lAverage: &r${getColorCode(CustomizeSettings.ProfitTrackerColorAverage)}${fixNumber(average)}/Chest\n` +
        `${getColorCode(CustomizeSettings.ProfitTrackerColorTime)}&lTime: &r${getColorCode(CustomizeSettings.ProfitTrackerColorTime)}${formatTimeMain(time / 1000)}\n` +
        `${getColorCode(CustomizeSettings.ProfitTrackerColorRate)}&lRate: &r${getColorCode(CustomizeSettings.ProfitTrackerColorRate)}${fixNumber(rate)}/hr`
    );
    totalProfit = 0;
}

register("packetReceived", (packet, event) => {
    try {
        if (World.world !== "Kuudra" || !Settings.kuudraProfit) return;
        const player = Player.getPlayer();
        const container = Player.getContainer();
        if (!player || !container) return;

        const containerName = container.getName().removeFormatting();
        if (!containerName || containerName !== "Paid Chest") return;
        profitGui.setMessage("");

        const maxSlot = container.getSize() - 36;
        const itemsList = packet.func_148910_d().slice(0, maxSlot);

        const itemsToUpdate = [];
        const itemsWithoutUpdate = [];
        kuudraTier = "UNKNOWN";
        canReroll = false;
        rerolled = false;
        rerollPriceChecked = {
            checked: false,
            reroll: false
        };
        dontReroll = false;
        shouldBuy = false;
        totalProfit = 0;
        gr = false;
        generateFailsafeList();
        profitGui.setMessage("&aChecking items...");
        kicDebugMsg("&aChecking items...");

        itemsList.forEach(itemStack => {
            if (!itemStack) return;

            const item = new Item(itemStack);
            if (item.getID() === 160) return;

            const itemNBTTag = item.getNBT().getCompoundTag("tag");

            const display = itemNBTTag.getCompoundTag("display");
            const itemName = display.getString("Name");
            const lore = display.toObject()["Lore"];

            if (!itemName) return;

            if (itemName.removeFormatting().toLowerCase().includes("crimson essence")) {
                const match = itemName.removeFormatting().toLowerCase().match(/x(\d+)/);
                const count = match ? parseInt(match[1], 10) : 0;
                bazaarItems["ESSENCE_CRIMSON"] = {
                    name: "&dCrimson Essence",
                    itemId: "ESSENCE_CRIMSON",
                    buyPrice: "Loading...",
                    sellPrice: "Loading...",
                    count: count,
                    time: Date.now()
                };
                itemsToUpdate.push("ESSENCE_CRIMSON");

                return;
            }

            if (!lore) return;

            const lowerLore = lore.join(",").toLowerCase();

            if (itemName.removeFormatting().toLowerCase().includes("reroll kuudra chest")) {
                if (lowerLore.includes("you already rerolled this chest!")) {
                    rerolled = true;
                } else {
                    canReroll = true;

                    bazaarItems["KISMET_FEATHER"] = {
                        calcIgnore: true,
                        name: "&9Kismet Feather",
                        itemId: "KISMET_FEATHER",
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        time: Date.now()
                    };
                    itemsToUpdate.push("KISMET_FEATHER");
                }

                return;
            }

            const extraAttr = itemNBTTag.getCompoundTag("ExtraAttributes");
            if (!extraAttr || extraAttr.hasNoTags()) return;

            const itemId = extraAttr.getString("id");
            if (!itemId) return;

            dontRerollIds.forEach(id => {
                if (itemId.includes(id)) {
                    dontReroll = true;
                }
            });

            if (lowerLore.includes("soulbound")) return;

            if (itemId === "KUUDRA_TEETH") {
                const count = item.getStackSize() || 0;
                bazaarItems[itemId] = {
                    name: "&5Kuudra Teeth",
                    itemId: itemId,
                    buyPrice: "Loading...",
                    sellPrice: "Loading...",
                    count: count,
                    time: Date.now()
                };
                itemsToUpdate.push(itemId);

                return;
            }

            const uuid = extraAttr.getString("uuid");
            if (!uuid) return;

            if (itemId.includes("ULTIMATE_INFERNO")) {
                if (!bazaarItems[uuid]) {
                    bazaarItems[uuid] = {
                        name: "&d&lInferno 1",
                        itemId: "ENCHANTMENT_ULTIMATE_INFERNO_1",
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        time: Date.now()
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    if ((Date.now() - bazaarItems[uuid].time) > 300000) {
                        itemsToUpdate.push(uuid);
                    } else {
                        itemsWithoutUpdate.push(uuid);
                    }
                }
                return;
            }

            if (itemId.includes("ULTIMATE_FATAL_TEMPO")) {
                if (!bazaarItems[uuid]) {
                    bazaarItems[uuid] = {
                        name: "&d&lFatal Tempo 1",
                        itemId: "ENCHANTMENT_ULTIMATE_FATAL_TEMPO_1",
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        time: Date.now()
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    if ((Date.now() - bazaarItems[uuid].time) > 300000) {
                        itemsToUpdate.push(uuid);
                    } else {
                        itemsWithoutUpdate.push(uuid);
                    }
                }
                return;
            }

            if (itemId === "ENCHANTED_BOOK") {
                const enchants = extraAttr.getTag("enchantments");
                if (!enchants) return;

                const parsedEnchants = parseNbt(enchants.toString());
                const [enchant, lvl] = Object.entries(parsedEnchants)[0] || [];

                if (!enchant || !lvl) return;

                const enchantName = `&7${capitalizeEachWord(enchant.replaceAll("_", " "))} ${lvl}`;
                const enchantItemId = `ENCHANTMENT_${enchant.toUpperCase()}_${lvl}`;

                if (!bazaarItems[uuid]) {
                    bazaarItems[uuid] = {
                        name: enchantName,
                        itemId: enchantItemId,
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        time: Date.now()
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    const timeElapsed = Date.now() - bazaarItems[uuid].time;
                    (timeElapsed > 300000 ? itemsToUpdate : itemsWithoutUpdate).push(uuid);
                }
                return;
            }

            if (itemId === "MANDRAA" || itemId === "KUUDRA_MANDIBLE") {
                if (!bazaarItems[uuid]) {
                    bazaarItems[uuid] = {
                        name: itemName,
                        itemId: itemId,
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        time: Date.now()
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    if ((Date.now() - bazaarItems[uuid].time) > 300000) {
                        itemsToUpdate.push(uuid);
                    } else {
                        itemsWithoutUpdate.push(uuid);
                    }
                }
                return;
            }

            const attributes = extraAttr.getTag("attributes");
            if (attributes !== null && itemId !== "HOLLOW_WAND") {
                const parsedAttributes = parseNbt(attributes.toString());

                if (!attributesItems[uuid]) {
                    attributesItems[uuid] = {
                        name: itemName,
                        itemId: itemId,
                        attributes: parsedAttributes,
                        price: "Loading...",
                        time: Date.now(),
                        gr: false
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    if (JSON.stringify(attributesItems[uuid].attributes) !== JSON.stringify(parsedAttributes)) {
                        attributesItems[uuid].attributes = parsedAttributes;
                        itemsToUpdate.push(uuid);
                    } else if ((Date.now() - attributesItems[uuid].time) > 300000) {
                        itemsToUpdate.push(uuid);
                    } else {
                        itemsWithoutUpdate.push(uuid);
                    }
                }

                return;
            }

            if (!auctionItems[uuid]) {
                auctionItems[uuid] = {
                    name: itemName,
                    itemId: itemId,
                    price: "Loading...",
                    time: Date.now()
                };
                itemsToUpdate.push(uuid);
            } else {
                if ((Date.now() - auctionItems[uuid].time) > 300000) {
                    itemsToUpdate.push(uuid);
                } else {
                    itemsWithoutUpdate.push(uuid);
                }
            }
        });

        kuudraTier = tiers[getKuudraTier()];

        kicDebugMsg(`Kuudra tier used for profit calc: ${kuudraTier}, index: ${getKuudraTier()}`);

        if (kuudraTier !== "UNKNOWN") {
            const updateBazaarItem = (keyType) => {
                const itemId = kuudraData.KEY[keyType];
                const uuid = `KEY_${keyType}_${kuudraTier}`;

                if (!bazaarItems[uuid]) {
                    bazaarItems[uuid] = {
                        calcIgnore: true,
                        name: kuudraData[kuudraTier].key.name,
                        itemId: itemId,
                        buyPrice: "Loading...",
                        sellPrice: "Loading...",
                        count: kuudraData[kuudraTier].key.items,
                        basePrice: kuudraData[kuudraTier].key.coins,
                        time: Date.now()
                    };
                    itemsToUpdate.push(uuid);
                } else {
                    const timeElapsed = Date.now() - bazaarItems[uuid].time;
                    (timeElapsed > 300000 ? itemsToUpdate : itemsWithoutUpdate).push(uuid);
                }
            };

            updateBazaarItem("BARBARIAN");
            updateBazaarItem("MAGE");

            if (!bazaarItems["CORRUPTED_NETHER_STAR"]) {
                bazaarItems["CORRUPTED_NETHER_STAR"] = {
                    calcIgnore: true,
                    name: "&dNether Star",
                    itemId: "CORRUPTED_NETHER_STAR",
                    buyPrice: "Loading...",
                    sellPrice: "Loading...",
                    count: 2,
                    time: Date.now()
                };
                itemsToUpdate.push("CORRUPTED_NETHER_STAR");
            } else {
                if ((Date.now() - bazaarItems["CORRUPTED_NETHER_STAR"].time) > 300000) {
                    itemsToUpdate.push("CORRUPTED_NETHER_STAR");
                } else {
                    itemsWithoutUpdate.push("CORRUPTED_NETHER_STAR");
                }
            }
        }

        const itemsToUpdateFiltered = [...new Set(itemsToUpdate)];
        const itemsWithoutUpdateFiltered = [...new Set(itemsWithoutUpdate)];

        if (itemsToUpdateFiltered.length < 0 && itemsWithoutUpdateFiltered.length < 0) return;

        profitGui.setMessage("&aChecking prices...");
        kicDebugMsg("&aChecking prices...");
        fetchItemPrices(itemsToUpdateFiltered, function () {
            updateOverlay(itemsToUpdateFiltered.concat(itemsWithoutUpdateFiltered), kuudraTier);
            kicDebugMsg(`Total profit: ${fixNumber(totalProfit)}, Chest Opened: ${chestOpened}, Should Buy: ${shouldBuy}`);
            if (Settings.superSecretSettings && !chestOpened) {
                kicDebugMsg(`Should reroll value check. isPaidChest: ${isPaidChest()}, dontReroll: ${dontReroll}, rerollPriceChecked.checked: ${rerollPriceChecked?.checked}, rerollPriceChecked.reroll: ${rerollPriceChecked?.reroll}, canReroll: ${canReroll}, rerolled: ${rerolled}, chestOpened: ${chestOpened}, TotalProfit: ${totalProfit}, AutoBuyMinProfit: ${parseShorthandNumber(Settings.kuudraAutoBuyMinProfit)}`);
                if (Settings.kuudraAutoReroll && shouldReroll()) {
                    if (Settings.kuudraAutoBuy) {
                        delay(() => click(31, true), 500);
                        delay(() => click(50), 750);
                        ChatLib.chat(`${kicPrefix} &aAuto-rerolled & auto-bought the paid chest!`);
                    } else {
                        delay(() => click(50), 500);
                        ChatLib.chat(`${kicPrefix} &aAuto rerolled the paid chest!`);
                    }
                } else if (Settings.kuudraAutoBuy && !rerolled) {
                    if (shouldBuy) {
                        delay(() => click(31), 500);
                        ChatLib.chat(`${kicPrefix} &aAuto-bought the paid chest! (Profit: ${fixNumber(totalProfit)})`);
                    } else {
                        ChatLib.chat(`${kicPrefix} &aChest not auto-bought as total profit (${fixNumber(totalProfit)}) was below the threshold (${fixNumber(parseShorthandNumber(Settings.kuudraAutoBuyMinProfit))}).`);
                    }
                }
            }
        });
    } catch (error) {
        errorHandler("Error while getting kuudra chest profit", error.message, "kuudraProfit.js")
    }
}).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems);

function parseNbt(string) {
    const items = string.replace(/[{}]/g, "").split(",");

    const parsedItems = {};

    items.forEach(item => {
        const [name, level] = item.split(":");
        parsedItems[name.trim()] = parseInt(level.trim());
        if (dontRerollAttributes.includes(name.trim())) {
            dontReroll = true;
        }
    });

    return parsedItems;
}

function fetchItemPrices(uuidsToUpdate, callback) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (uuidsToUpdate.length === 0) {
        return callback();
    }

    kicDebugMsg(`&aUpdating prices for ${uuidsToUpdate.length} items`);
    const itemNames = [];

    const itemsToFetch = uuidsToUpdate.map(uuid => {
        let requestBody = {
            type: null,
            uuid: uuid,
        };

        if (attributesItems[uuid]) {
            const item = attributesItems[uuid];
            itemNames.push(item.name);
            requestBody.type = "ATTRIBUTES";
            requestBody.itemId = item.itemId;

            const attributes = item.attributes;
            Object.keys(attributes).forEach((key, index) => {
                requestBody[`attribute${index + 1}`] = key;
                requestBody[`attributeLvl${index + 1}`] = attributes[key];
            });
        } else if (bazaarItems[uuid]) {
            const item = bazaarItems[uuid];
            itemNames.push(item.name);
            requestBody.type = "BAZAAR";
            requestBody.itemId = item.itemId;
        } else if (auctionItems[uuid]) {
            const item = auctionItems[uuid];
            itemNames.push(item.name);
            requestBody.type = "AUCTION";
            requestBody.itemId = item.itemId;
        }

        return requestBody;
    }).filter(requestBody => requestBody.type !== null);

    if (itemsToFetch.length === 0) return callback();

    kicDebugMsg(`&aFetching prices from api for ${itemsToFetch.length} items`);
    kicDebugMsg(`&aItems: ${itemNames.join(", ")}`);

    const start = Date.now();
    axios.post("https://api.sm0kez.com/crimson/prices", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: itemsToFetch,
        parseBody: true
    })
        .then(response => {
            kicDebugMsg(`&aAPI Ping (/prices): ${Date.now() - start} ms`);
            const data = response.data;
            data.forEach(itemData => updateItemPrices(itemData));
            callback();
        })
        .catch(error => {
            kicDebugMsg(`&cAPI Ping Failed (/prices): ${Date.now() - start} ms`);
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (!error.isAxiosError || error.code === 500) {
                errorHandler("Error while getting prices for items", error.message, "kuudraProfit.js", null);
            }
            callback();
        });
}

function updateItemPrices(itemData) {
    const uuid = itemData.uuid;
    if (attributesItems[uuid]) {
        updateAttributeItemPrices(attributesItems[uuid], itemData);
    } else if (bazaarItems[uuid]) {
        updateBazaarItemPrices(bazaarItems[uuid], itemData);
    } else if (auctionItems[uuid]) {
        updateAuctionItemPrices(auctionItems[uuid], itemData);
    }
}

function updateAttributeItemPrices(item, itemData) {
    item.price = itemData.godRoll ? itemData.godRollPrice : (itemData.price || 0);
    item.priceAttribute1 = itemData.priceAttribute1 || 0;
    item.priceAttribute2 = itemData.priceAttribute2 || 0;
    item.displayPrice = `${itemData.price ? "&a" : "&c"}${fixNumber(itemData.price) || 0}`;
    item.gr = itemData.godRoll;
    kicDebugMsg(`&6Item: ${itemData.itemId} | godroll: ${itemData.godRoll} | price: ${item.price} (API | itemPrice: ${itemData.price || 0} | grPrice: ${itemData.godRollPrice || 0})`);

    const attributeDisplayPrices = [];
    if (itemData.attribute1) {
        const price = itemData.priceAttribute1 !== null ? itemData.priceAttribute1 : 0;
        attributeDisplayPrices.push(`&b${capitalizeEachWord(itemData.attribute1.replaceAll("_", " "))} ${itemData.attributeLvl1}&7: ${price ? "&a" : "&c"}${fixNumber(price)}`);
    }
    if (itemData.attribute2) {
        const price = itemData.priceAttribute2 !== null ? itemData.priceAttribute2 : 0;
        attributeDisplayPrices.push(`&b${capitalizeEachWord(itemData.attribute2.replaceAll("_", " "))} ${itemData.attributeLvl2}&7: ${price ? "&a" : "&c"}${fixNumber(price)}`);
    }
    item.attributeDisplayPrices = attributeDisplayPrices;
}

function updateBazaarItemPrices(item, itemData) {
    const multiplier = item.count || 1;
    item.buyPrice = itemData.buyPrice * multiplier || 0;
    item.sellPrice = itemData.sellPrice * multiplier || 0;
    item.displayPrice = `&f- &bSell order&7: ${itemData.buyPrice ? "&a" : "&c"}${fixNumber(item.buyPrice) || 0}\n&f- &bInsta sell&7: ${itemData.sellPrice ? "&a" : "&c"}${fixNumber(item.sellPrice) || 0}`;
}

function updateAuctionItemPrices(item, itemData) {
    item.price = itemData.price || 0;
    item.displayPrice = `${itemData.price ? "&a" : "&c"}${fixNumber(itemData.price) || 0}`;
}

function calculateTotalProfit(uuids, forceIgnore = false) {
    return uuids.reduce((totalProfit, uuid) => {
        if (attributesItems[uuid]) {
            const item = attributesItems[uuid];
            if (item.calcIgnore) return totalProfit;
            if (item.itemId === "ATTRIBUTE_SHARD") {
                return totalProfit + item.price;
            }
            return totalProfit + (item.gr ? item.price : Math.max(item.priceAttribute1 || 0, item.priceAttribute2 || 0));
        } else if (bazaarItems[uuid]) {
            if (uuid === "ESSENCE_CRIMSON" && (Settings.ignoreEssence || forceIgnore)) return totalProfit;
            if (uuid === "KUUDRA_TEETH" && (Settings.ignoreTeeth || forceIgnore)) return totalProfit;
            const item = bazaarItems[uuid];
            if (item.calcIgnore) return totalProfit;
            const price = Settings.sellOrderPrice
                ? (item.buyPrice !== 0 ? item.buyPrice : item.sellPrice)
                : (item.sellPrice !== 0 ? item.sellPrice : item.buyPrice);

            return totalProfit + price;
        } else if (auctionItems[uuid]) {
            const item = auctionItems[uuid];
            if (item.calcIgnore) return totalProfit;
            return totalProfit + item.price;
        }
        return totalProfit;
    }, 0);
}

function checkIfGodRollPresent(uuids) {
    for (const uuid of uuids) {
        if (attributesItems[uuid] && attributesItems[uuid].gr) {
            return true;
        }
    }
    return false;
}

function updateOverlay(uuids, tier) {
    let rerollCheckProfit = calculateTotalProfit(uuids, true);
    const kismet = bazaarItems["KISMET_FEATHER"];

    const kismetPrice = kismet ? kismet.sellPrice !== 0 ? kismet.sellPrice : kismet.buyPrice : 0;

    rerollPriceChecked.checked = true;

    if (kismetPrice > rerollCheckProfit) rerollPriceChecked.reroll = true;

    gr = checkIfGodRollPresent(uuids);

    totalProfit = calculateTotalProfit(uuids, false);
    let keyMessage = "";
    let kismetMessage = "";

    if (tier !== "UNKNOWN") {
        const key = getKey();
        if (key) {
            totalProfit -= key.price;
            keyMessage = `\n&c-${fixNumber(key.price)} &7|&r ${key.name}`;
        }
    }

    if (rerolled) {
        totalProfit -= kismetPrice;
        kismetMessage = `\n${kismet.name} &7x1 &f= &c-${fixNumber(kismetPrice)}`;
        kismetMessage = `\n&c-${fixNumber(kismetPrice)} &7|&r ${kismet.name}`;
    }

    if (Settings.kuudraAlwaysAutoBuy) {
        shouldBuy = true;
    } else {
        shouldBuy = totalProfit >= parseShorthandNumber(Settings.kuudraAutoBuyMinProfit);
    }

    const profitColor = totalProfit > 0 ? "&a" : "&c";
    const msg = `${kicPrefix} &a&lChest profit\n\n&e${totalProfit > 15000000 ? "&l" : ""}Total: ${profitColor}${totalProfit > 15000000 ? "&l" : ""}${totalProfit < 0 ? "" : "+"}${fixNumber(totalProfit)}\n${keyMessage}${kismetMessage}\n${Settings.kuudraProfitCompact ? "" : "\n"}`;

    const itemMessages = uuids.map(uuid =>
        Settings.kuudraProfitCompact ? getOverlayTextCompact(uuid) : getOverlayText(uuid)
    ).filter(e => e).join(Settings.kuudraProfitCompact ? "\n" : "\n\n");

    profitGui.setMessage(`${msg}${itemMessages}`);
}

function getKey() {
    const type = `KEY_${kicData.faction}_${kuudraTier}`;
    const item = bazaarItems[type];
    const star = bazaarItems["CORRUPTED_NETHER_STAR"];
    if (!item) return null;

    const price = (Settings.sellOrderPrice ? item.buyPrice || item.sellPrice : item.sellPrice || item.buyPrice) + (item.basePrice || 0) + (Settings.sellOrderPrice ? star.buyPrice || star.sellPrice : star.sellPrice || star.buyPrice);

    return {name: item.name, price};
}

function getOverlayText(uuid) {
    if (Settings.ignoreEssence && uuid === "ESSENCE_CRIMSON") return;
    if (Settings.ignoreTeeth && uuid === "KUUDRA_TEETH") return;

    const item = attributesItems[uuid] || bazaarItems[uuid] || auctionItems[uuid];
    if (!item || item.calcIgnore) return;

    let countMsg = "";
    if (item.count) {
        countMsg = ` &ex${item.count}`;
    }

    let text;
    if (bazaarItems[uuid]) {
        text = `${item.name}${countMsg}\n${item.displayPrice || ""}`;
    } else {
        text = `${item.displayPrice || ""} &7|&r ${item.name}${countMsg}`;
        if (item.attributeDisplayPrices && item.attributeDisplayPrices.length) {
            text += `\n&f- ${item.attributeDisplayPrices.join("\n&f- ")}`;
        }
    }
    return text;
}

function getOverlayTextCompact(uuid) {
    if (Settings.ignoreEssence && uuid === "ESSENCE_CRIMSON") return;
    if (Settings.ignoreTeeth && uuid === "KUUDRA_TEETH") return;

    const item = attributesItems[uuid] || bazaarItems[uuid] || auctionItems[uuid];
    if (!item || item.calcIgnore) return;

    let price = 0;

    if (attributesItems[uuid]) {
        price = item.itemId === "ATTRIBUTE_SHARD"
            ? item.price
            : Math.max(item.gr ? item.price : Math.max(item.priceAttribute1 || 0, item.priceAttribute2 || 0));
    } else if (bazaarItems[uuid]) {
        price = Settings.sellOrderPrice
            ? item.buyPrice || item.sellPrice
            : item.sellPrice || item.buyPrice;
    } else if (auctionItems[uuid]) {
        price = auctionItems[uuid].price;
    }

    let countMsg = "";
    if (item.count) {
        countMsg = ` &ex${item.count}`;
    }

    let nameMsg = item.name;
    if (item.attributes) {
        Object.keys(item.attributes).forEach(key => {
            nameMsg += ` &7[&b${capitalizeEachWord(key.replaceAll("_", " "))} ${item.attributes[key]}&7]`;
        });
    }

    return `${price > 0 ? "&a+" : "&c"}${fixNumber(price)} &7|&r ${nameMsg}${countMsg}`;
}

function generateFailsafeList() {
    const attributesMap = {
        arachno: "arachno",
        attackSpeed: "attack_speed",
        blazing: "blazing",
        combo: "combo",
        elite: "elite",
        ender: "ender",
        ignition: "ignition",
        lifeRecovery: "life_recovery",
        manaSteal: "mana_steal",
        midasTouch: "midas_touch",
        undead: "undead",
        warrior: "warrior",
        deadeye: "deadeye",
        arachnoResistance: "arachno_resistance",
        blazingResistance: "blazing_resistance",
        breeze: "breeze",
        dominance: "dominance",
        enderResistance: "ender_resistance",
        experience: "experience",
        fortitude: "fortitude",
        lifeRegeneration: "life_regeneration",
        lifeline: "lifeline",
        magicFind: "magic_find",
        manaPool: "mana_pool",
        manaRegeneration: "mana_regeneration",
        vitality: "vitality",
        speed: "speed",
        undeadResistance: "undead_resistance",
        veteran: "veteran",
        blazingFortune: "blazing_fortune",
        fishingExperience: "fishing_experience",
        infection: "infection",
        doubleHook: "double_hook",
        fisherman: "fisherman",
        fishingSpeed: "fishing_speed",
        hunter: "hunter",
        trophyHunter: "trophy_hunter"
    };

    dontRerollAttributes = Object.keys(attributesMap)
        .filter(key => CustomizeSettings[key])
        .map(key => attributesMap[key]);

    if (CustomizeSettings.vitality) {
        dontRerollAttributes.push("mending");
    }
}
