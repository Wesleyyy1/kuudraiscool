import axios from "axios";
import Settings from "../settings/config.js";
import { fixNumber, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, capitalizeEachWord, kicPrefix } from "../utils/generalUtils.js";
import ScalableGui from "../utils/ScalableGui.js";

const items = {};

function isPaidChest() {
    return Player.getContainer()?.getName().removeFormatting() === "Paid Chest";
}

const profitExample = "&aCrimson Chestplate\n&aPrice: 420M\n&aMagic Find 6: 6.2M\n&aVeteran 9: 4.5M";
const profitGui = new ScalableGui("kuudraProfit", "kuudraProfit", isPaidChest, profitExample, true);
profitGui.setCommand("kuudraprofit");

register("packetReceived", (packet, event) => {
    const player = Player.getPlayer();
    const container = Player.getContainer();
    if (!player || !container) return;

    const containerName = container.getName().removeFormatting();
    if (!containerName || containerName !== "Paid Chest") return;

    const maxSlot = container.getSize() - 36;
    const itemsList = packet.func_148910_d().slice(0, maxSlot);

    profitGui.setMessage("&aChecking prices...");
    const itemsToUpdate = [];
    const itemsWithoutUpdate = [];

    itemsList.forEach(itemStack => {
        if (!itemStack) return;

        const item = new Item(itemStack);
        if (item.getID() === 160) return;

        const itemNBTTag = item.getNBT().getCompoundTag("tag");

        const display = itemNBTTag.getCompoundTag("display");
        const itemName = display.getString("Name");
        const extraAttr = itemNBTTag.getCompoundTag("ExtraAttributes");
        const lore = display.toObject()["Lore"];

        if (!lore || lore.join(",").toLowerCase().includes("soulbound")) return;

        const uuid = extraAttr.getString("uuid");
        const itemId = extraAttr.getString("id");
        const attributes = extraAttr.getTag("attributes");

        if (!itemName || !uuid || !itemId || attributes === null) return;

        const parsedAttributes = parseAttributes(attributes.toString());

        if (!items[uuid]) {
            items[uuid] = {
                name: itemName,
                itemId: itemId,
                attributes: parsedAttributes,
                price: "Loading...",
                time: Date.now()
            };
            itemsToUpdate.push(uuid);
        } else {
            if (items[uuid].name !== itemName || JSON.stringify(items[uuid].attributes) !== JSON.stringify(parsedAttributes)) {
                items[uuid].attributes = parsedAttributes;
                itemsToUpdate.push(uuid);
            } else if ((Date.now() - items[uuid].time) > 300000) {
                itemsToUpdate.push(uuid);
            } else {
                itemsWithoutUpdate.push(uuid);
            }
        }
    });

    if (itemsToUpdate.length < 0 && itemsWithoutUpdate.length < 0) return;

    fetchItemPrices(itemsToUpdate, function () {
        updateOverlay(itemsToUpdate.concat(itemsWithoutUpdate));
    });
}).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems);

function parseAttributes(attributeString) {
    const attributes = attributeString.replace(/[{}]/g, "").split(",");

    const parsedAttributes = {};

    attributes.forEach(attr => {
        const [name, level] = attr.split(":");
        parsedAttributes[name.trim()] = parseInt(level.trim());
    });

    return parsedAttributes;
}

function fetchItemPrices(uuidsToUpdate, callback) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (uuidsToUpdate.length === 0) {
        return callback();
    }

    const itemsToFetch = uuidsToUpdate
        .filter(uuid => items[uuid])
        .map(uuid => {
            const item = items[uuid];
            const requestBody = {
                uuid: uuid,
                itemId: item.itemId
            };

            const attributes = item.attributes;
            const attributeKeys = Object.keys(attributes);

            attributeKeys.forEach((key, index) => {
                requestBody[`attribute${index + 1}`] = key;
                requestBody[`attributeLvl${index + 1}`] = attributes[key];
            });

            item.price = "Checking...";

            return requestBody;
        });

    if (itemsToFetch.length === 0) {
        return callback();
    }

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

            data.forEach(itemData => {
                const uuid = itemData.uuid;
                const item = items[uuid];

                if (item) {
                    item.price = itemData.price || 0;
                    item.priceAttribute1 = itemData.priceAttribute1 || 0;
                    item.priceAttribute2 = itemData.priceAttribute2 || 0;

                    item.displayPrice = `${itemData.price ? "&a" : "&c"}Price: ${fixNumber(itemData.price) || 0}`;
                    const attributeDisplayPrices = [];

                    if (itemData.attribute1) {
                        const price = itemData.priceAttribute1 !== null ? itemData.priceAttribute1 : 0;
                        attributeDisplayPrices.push(`${price ? "&a" : "&c"}${capitalizeEachWord(itemData.attribute1.replaceAll("_", " "))} ${itemData.attributeLvl1}: ${fixNumber(price)}`);
                    }

                    if (itemData.attribute2) {
                        const price = itemData.priceAttribute2 !== null ? itemData.priceAttribute2 : 0;
                        attributeDisplayPrices.push(`${price ? "&a" : "&c"}${capitalizeEachWord(itemData.attribute2.replaceAll("_", " "))} ${itemData.attributeLvl2}: ${fixNumber(price)}`);
                    }

                    item.attributeDisplayPrices = attributeDisplayPrices;
                }
            });

            callback();
        })
        .catch(error => {
            if (!error.isAxiosError || error.code == 500) {
                errorHandler("Error while getting prices for items", error.message, "test.js", null);
            }
            callback();
        });
}

function calculateTotalProfit(uuids) {
    let totalProfit = 0;

    uuids.forEach(uuid => {
        const item = items[uuid];
        if (!item) return;

        let profit = 0;

        if (item.itemId === "ATTRIBUTE_SHARD") {
            profit = item.price;
        } else {
            if (item.price > Settings.minGodroll * 1000000) {
                profit = item.price;
            } else {
                profit = Math.max(item.priceAttribute1, item.priceAttribute2);
            }
        }

        totalProfit += profit;
    });

    return totalProfit;
}

function updateOverlay(uuids) {
    if (Settings.kuudraProfitCompact) {
        const totalProfit = calculateTotalProfit(uuids);
        profitGui.setMessage(`${totalProfit ? "&a" : "&c"}Total: ${fixNumber(totalProfit)}`);
    } else {
        const allItemMessages = uuids.map(getOverlayText);
        profitGui.setMessage(allItemMessages.join("\n\n"));
    }
}

function getOverlayText(uuid) {
    const item = items[uuid];
    let text = `${kicPrefix} &a&lChest profit\n${item.name}`;

    if (item.itemId !== "ATTRIBUTE_SHARD") {
        text += `\n${item.displayPrice}`;
    }
    if (item.attributeDisplayPrices && item.attributeDisplayPrices.length != 0) {
        text += `\n${item.attributeDisplayPrices.join("\n")}`;
    }

    return text;
}
