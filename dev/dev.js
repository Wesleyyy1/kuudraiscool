import axios from "axios";
import Settings from "../settings/config.js";
import {
    errorHandler,
    isKeyValid,
    getRoles,
    showInvalidReasonMsg,
    showMissingRolesMsg,
    kicPrefix,
    capitalizeEachWord,
    fixNumber,
    formatTime,
} from "../utils/generalUtils.js";
import { attributes } from "../utils/priceUtils.js";
import ScalableGui from "../utils/ScalableGui.js";
import World from "../utils/World.js";

// ATTRIBUTE UPGRADE

register("command", (arg1, arg2, arg3, arg4) => {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (!arg1 || !arg2 || !arg3 || !arg4) {
        ChatLib.chat("&cAll arguments are required.");
        return;
    }

    const startlvl = parseInt(arg3);
    const endlvl = parseInt(arg4);

    if (isNaN(startlvl) || isNaN(endlvl)) {
        ChatLib.chat("&cLevels must be numbers.");
        return;
    }

    if (startlvl < 1 || startlvl > 10 || endlvl < 1 || endlvl > 10) {
        ChatLib.chat("&cLevels must be between 1 and 10.");
        return;
    }

    if (startlvl >= endlvl) {
        ChatLib.chat("&cEnd level must be greater than start level.");
        return;
    }

    // Your command logic here
    let requestBody = {};
    requestBody.attribute = arg1;
    requestBody.item = arg2;
    requestBody.start_level = startlvl;
    requestBody.end_level = endlvl;

    axios.post("https://api.sm0kez.com/crimson/attribute/upgrade", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: requestBody,
        parseBody: true
    })
        .then(response => {
            showUpgradeMsg(response.data, startlvl, endlvl);
        })
        .catch(error => {
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (error.isAxiosError && error.code != 500) {
                if (error.code == 429) {
                    ChatLib.chat(`${kicPrefix} &c${error.response.data}`);
                } else {
                    ChatLib.chat(`${kicPrefix} &cYou've reached the usage limit for this feature. It can only be used once every 10 minutes. Please try again later.`);
                }
            } else {
                ChatLib.chat(`${kicPrefix} &cSomething went wrong while getting price data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting prices", error.message, "attributePrices.js");
            }
        });
}).setTabCompletions((args) => {
    if (args.length === 1) {
        let lastArg = args[0].toLowerCase();
        return attributes.filter(attr => attr.startsWith(lastArg));
    } else if (args.length === 2) {
        let lastArg = args[1].toLowerCase();
        return itemTypesArray.filter(item => item.startsWith(lastArg));
    }
    return [];
}).setName("attributeupgrade", true).setAliases("au");

function showUpgradeMsg(data, start, end) {
    const message = new Message();
    message.addTextComponent(new TextComponent(`\n${kicPrefix} &6Cheapest way to upgrade &b${capitalizeEachWord(data.attribute.replaceAll("_", " "))}&6 on your &2${capitalizeEachWord(data.item.replaceAll("_", " "))}&6 from &e${start} &6to &e${end}&6.`));

    const timeAgo = formatTime(Math.abs(data.timestamp - Date.now()));
    message.addTextComponent(new TextComponent(`\n&6Total price: &e${fixNumber(data.totalCost)}&6. Last refresh was &e${timeAgo}&6.\n`));

    Object.entries(data.levels).forEach(([lvl, items]) => {
        const totalCost = items.reduce((sum, item) => sum + item.price, 0);
        message.addTextComponent(new TextComponent(`\n&bUpgrade to §3${lvl} &b| §3${fixNumber(totalCost)}\n`));
        items.forEach(item => {
            message.addTextComponent(
                new TextComponent(`&6- &9${capitalizeEachWord(item.itemId.replaceAll("_", " "))} &6for &e${fixNumber(item.price)}\n`)
                    .setClick("run_command", `/viewauction ${item.uuid}`)
            );
        });
    });

    ChatLib.chat(message);
}

// CONTAINER VALUE

let itemsCache = {};

const containerValueExample = `${kicPrefix} &a&lContainer value\n\n&6Crimson Chestplate &7x1 &f= &b4.30M\n&6Aurora Boots &7x1 &f= &b2.90M\n&6Terror Chestplate &7x1 &f= &b11.10M\n&6Fervor Helmet &7x1 &f= &b500K\n\n&aTotal: &b18.80M`;
const containerValueGui = new ScalableGui("containerValue", "containerValue", ["all"], isContainerValid, containerValueExample, true);
containerValueGui.setCommand("containerValue");

function isContainerValid() {
    const chestName = Player.getContainer()?.getName()?.removeFormatting();

    if (!chestName) return false;

    return (
        (World.worldIs("Private Island") && (chestName === "Chest" || chestName === "Large Chest")) ||
        chestName.includes("Backpack") ||
        chestName.startsWith("Ender Chest (") ||
        chestName === "Personal Vault"
    );
}

register("packetReceived", (packet, event) => {
    try {
        if (!Settings.containerValue || !isContainerValid()) return;

        const player = Player.getPlayer();
        const container = Player.getContainer();
        if (!player || !container) return;

        containerValueGui.setMessage("&aChecking value...");
        const maxSlot = container.getSize() - 36;
        const itemsList = packet.func_148910_d().slice(0, maxSlot);

        const itemsToUpdate = [];
        const itemsWithoutUpdate = [];
        itemsList.forEach(itemStack => {
            if (!itemStack) return;

            const item = new Item(itemStack);
            if (item.getID() === 160) return;

            const itemNBTTag = item.getNBT().getCompoundTag("tag");

            if (!itemNBTTag || itemNBTTag.hasNoTags()) return;

            const display = itemNBTTag.getCompoundTag("display");
            const itemName = display.getString("Name");

            if (!itemName) return;

            const extraAttr = itemNBTTag.getCompoundTag("ExtraAttributes");
            if (!extraAttr || extraAttr.hasNoTags()) return;

            const itemId = extraAttr.getString("id");
            if (!itemId) return;

            const uuid = extraAttr.getString("uuid");
            if (!uuid) return;

            const attributes = extraAttr.getTag("attributes");
            if (attributes !== null && itemId !== "HOLLOW_WAND") {
                const parsedAttributes = parseNbt(attributes.toString());

                if (!itemsCache[uuid]) {
                    itemsCache[uuid] = {
                        name: itemName,
                        itemId: itemId,
                        attributes: parsedAttributes,
                        price: "Loading...",
                        time: Date.now()
                    };
                    if (itemId === "ATTRIBUTE_SHARD") {
                        const [attribute, lvl] = Object.entries(parsedAttributes)[0] || [];
                        if (attribute && lvl) {
                            itemsCache[uuid].name = `&b${capitalizeEachWord(attribute.replaceAll("_", " "))} ${lvl}`;
                        }
                    }
                    itemsToUpdate.push(uuid);
                } else {
                    if (JSON.stringify(itemsCache[uuid].attributes) !== JSON.stringify(parsedAttributes)) {
                        itemsCache[uuid].attributes = parsedAttributes;
                        itemsToUpdate.push(uuid);
                    } else if ((Date.now() - itemsCache[uuid].time) > 300000) {
                        itemsToUpdate.push(uuid);
                    } else {
                        itemsWithoutUpdate.push(uuid);
                    }
                }
            }
        });

        const itemsToUpdateFiltered = [...new Set(itemsToUpdate)];
        const itemsWithoutUpdateFiltered = [...new Set(itemsWithoutUpdate)];

        if (itemsToUpdateFiltered.length < 0 && itemsWithoutUpdateFiltered.length < 0) return;

        fetchItemPrices(itemsToUpdateFiltered, function () {
            updateOverlay(itemsToUpdateFiltered.concat(itemsWithoutUpdateFiltered));
        });
    } catch (error) {
        errorHandler("Error while getting container value", error.message, "dev.js")
    }
}).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems);

function parseNbt(string) {
    const items = string.replace(/[{}]/g, "").split(",");

    const parsedItems = {};

    items.forEach(item => {
        const [name, level] = item.split(":");
        parsedItems[name.trim()] = parseInt(level.trim());
    });

    return parsedItems;
}

function fetchItemPrices(uuidsToUpdate, callback) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (uuidsToUpdate.length === 0) {
        return callback();
    }

    const itemsToFetch = uuidsToUpdate.map(uuid => {
        let requestBody = {
            type: null,
            uuid: uuid,
        };

        const item = itemsCache[uuid];
        requestBody.type = "ATTRIBUTES";
        requestBody.itemId = item.itemId;

        const attributes = item.attributes;
        Object.keys(attributes).forEach((key, index) => {
            requestBody[`attribute${index + 1}`] = key;
            requestBody[`attributeLvl${index + 1}`] = attributes[key];
        });

        return requestBody;
    }).filter(requestBody => requestBody.type !== null);

    if (itemsToFetch.length === 0) return callback();

    axios.post("https://api.sm0kez.com/crimson/prices", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: itemsToFetch,
        parseBody: true
    })
        .then(response => {
            const data = response.data;
            data.forEach(itemData => updateItemPrice(itemData));
            callback();
        })
        .catch(error => {
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (!error.isAxiosError || error.code === 500) {
                errorHandler("Error while getting prices for items", error.message, "dev.js", null);
            }
            callback();
        });
}

function updateItemPrice(itemData) {
    let item = itemsCache[itemData.uuid];
    item.price = itemData.price || 0;
    item.priceAttribute1 = itemData.priceAttribute1 || 0;
    item.priceAttribute2 = itemData.priceAttribute2 || 0;
    item.displayPrice = `&aPrice: &b${fixNumber(itemData.price) || 0}`;

    const attributeDisplayPrices = [];
    if (itemData.attribute1) {
        const price = itemData.priceAttribute1 !== null ? itemData.priceAttribute1 : 0;
        attributeDisplayPrices.push(`&a${capitalizeEachWord(itemData.attribute1.replaceAll("_", " "))} ${itemData.attributeLvl1}: &b${fixNumber(price)}`);
    }
    if (itemData.attribute2) {
        const price = itemData.priceAttribute2 !== null ? itemData.priceAttribute2 : 0;
        attributeDisplayPrices.push(`&a${capitalizeEachWord(itemData.attribute2.replaceAll("_", " "))} ${itemData.attributeLvl2}: &b${fixNumber(price)}`);
    }
    item.attributeDisplayPrices = attributeDisplayPrices;
}

const compactValue = true;

function updateOverlay(uuids) {
    const sortedUuids = uuids.sort((a, b) => getItemPrice(itemsCache[b]) - getItemPrice(itemsCache[a]));

    let totalValue = calculateTotalValue(uuids);
    if (totalValue > 0) {
        const msg = `${kicPrefix} &a&lContainer value\n\n`;
        const totalMsg = `\n\n&aTotal: &b${fixNumber(totalValue)}`;

        const itemMessages = sortedUuids
            .map(uuid => (compactValue ? getOverlayTextCompact(uuid) : getOverlayText(uuid)))
            .filter(e => e)
            .join(compactValue ? "\n" : "\n\n");

        containerValueGui.setMessage(`${msg}${itemMessages}${totalMsg}`);
    } else {
        containerValueGui.setMessage("");
    }
}

function calculateTotalValue(uuids) {
    return uuids.reduce((totalValue, uuid) => {
        const item = itemsCache[uuid];
        return totalValue + getItemPrice(item);
    }, 0);
}

function getOverlayText(uuid) {
    const item = itemsCache[uuid];
    let text = `${item.name} &r&7x${item.count || 1}\n${item.displayPrice || ""}`;
    if (item.attributeDisplayPrices && item.attributeDisplayPrices.length) {
        text += `\n${item.attributeDisplayPrices.join("\n")}`;
    }
    return text;
}

function getOverlayTextCompact(uuid) {
    const item = itemsCache[uuid];
    const price = getItemPrice(item);
    return `${item.name} &r&7x${item.count || 1} &f= &b${fixNumber(price)}`;
}

function getItemPrice(item) {
    if (item.itemId === "ATTRIBUTE_SHARD") {
        return item.price;
    }
    return Math.max(
        item.price > Settings.minGodroll * 1000000 ? item.price : Math.max(item.priceAttribute1 || 0, item.priceAttribute2 || 0)
    );
}

register("command", () => {
    Object.keys(itemsCache).forEach(uuid => {
        itemsCache[uuid].time = 0;
    });
    ChatLib.chat(`${kicPrefix} &aContainer value cache cleared.`);
}).setName("containervalueclearcache");
