import axios from "axios";
import Settings from "../settings/config.js";
import { fixNumber, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, capitalizeEachWord, kicPrefix } from "../utils/generalUtils.js";
import ScalableGui from "../utils/ScalableGui.js";
import World from "../utils/World.js";

const kuudraData = {
    KEY: {
        MAGE: "ENCHANTED_MYCELIUM",
        BARB: "ENCHANTED_RED_SAND"
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
            items: 6
        },
    },
    BURNING: {
        key: {
            name: "&5Burning Kuudra Key",
            coins: 600000,
            items: 20
        },
    },
    FIERY: {
        key: {
            name: "&5Fiery Kuudra Key",
            coins: 1200000,
            items: 60
        },
    },
    INFERNAL: {
        key: {
            name: "&6Infernal Kuudra Key",
            coins: 2400000,
            items: 120
        },
    }
};

const bazaarItems = {};
const attributesItems = {};
const auctionItems = {};

function isPaidChest() {
    return Player.getContainer()?.getName()?.removeFormatting() === "Paid Chest";
}

const profitExample = `${kicPrefix} &a&lChest profit\n\n&aTotal: +4.48M\n\n&6Infernal Kuudra Key &7x1 &f= &c-3.87M\n&6Crimson Chestplate &7x1 &f= &a+4.30M\n&7Ferocious Mana 5 &7x1 &f= &a+1.53M\n&dCrimson Essence &7x1600 &f= &a+2.52M`;
const profitGui = new ScalableGui("kuudraProfit", "kuudraProfit", ["Kuudra", "all"], isPaidChest, profitExample, true);
profitGui.setCommand("kuudraprofit");

register("packetReceived", (packet, event) => {
    if (World.world !== "Kuudra" || !Settings.kuudraProfit) return;
    const player = Player.getPlayer();
    const container = Player.getContainer();
    if (!player || !container) return;

    const containerName = container.getName().removeFormatting();
    if (!containerName || containerName !== "Paid Chest") return;
    profitGui.setMessage("&aChecking prices...");

    const maxSlot = container.getSize() - 36;
    const itemsList = packet.func_148910_d().slice(0, maxSlot);

    const itemsToUpdate = [];
    const itemsWithoutUpdate = [];
    let kuudraTier = "UNKNOWN";

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
            bazaarItems["crimson"] = {
                name: "&dCrimson Essence",
                itemId: "ESSENCE_CRIMSON",
                buyPrice: "Loading...",
                sellPrice: "Loading...",
                count: count,
                time: Date.now()
            };
            itemsToUpdate.push("crimson");

            return;
        }

        if (!lore) return;
        const lowerLore = lore.join(",").toLowerCase();

        if (itemName.removeFormatting().toLowerCase().includes("open reward chest")) {
            if (lowerLore.includes("infernal kuudra key")) {
                kuudraTier = "INFERNAL";
            } else if (lowerLore.includes("fiery kuudra key")) {
                kuudraTier = "FIERY";
            } else if (lowerLore.includes("burning kuudra key")) {
                kuudraTier = "BURNING";
            } else if (lowerLore.includes("hot kuudra key")) {
                kuudraTier = "HOT";
            } else if (lowerLore.includes("kuudra key")) {
                kuudraTier = "BASIC";
            }
            return;
        }

        const extraAttr = itemNBTTag.getCompoundTag("ExtraAttributes");

        if (!extraAttr || extraAttr.hasNoTags()) return;

        const itemId = extraAttr.getString("id");
        if (!itemId) return;

        if (itemId === "KUUDRA_TEETH") {
            const count = item.getStackSize() | 0;
            bazaarItems["teeth"] = {
                name: itemName,
                itemId: itemId,
                buyPrice: "Loading...",
                sellPrice: "Loading...",
                count: count,
                time: Date.now()
            };
            itemsToUpdate.push("teeth");
        }

        if (lowerLore.includes("soulbound")) return;

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

        const attributes = extraAttr.getTag("attributes");
        if (attributes !== null && itemId !== "HOLLOW_WAND") {
            const parsedAttributes = parseNbt(attributes.toString());
            
            if (!attributesItems[uuid]) {
                attributesItems[uuid] = {
                    name: itemName,
                    itemId: itemId,
                    attributes: parsedAttributes,
                    price: "Loading...",
                    time: Date.now()
                };
                if (itemId === "ATTRIBUTE_SHARD") {
                    const [attribute, lvl] = Object.entries(parsedAttributes)[0] || [];
                    if (attribute && lvl) {
                        attributesItems[uuid].name = `&b${capitalizeEachWord(attribute.replaceAll("_", " "))} ${lvl}`;
                    }
                }
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

    if (kuudraTier !== "UNKNOWN") {
        const updateBazaarItem = (keyType) => {
            const itemId = kuudraData.KEY[keyType];
            const uuid = `KEY_${keyType}`;

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
    
        updateBazaarItem("BARB");
        updateBazaarItem("MAGE");
    }

    const itemsToUpdateFiltered = [...new Set(itemsToUpdate)];
    const itemsWithoutUpdateFiltered = [...new Set(itemsWithoutUpdate)];

    if (itemsToUpdateFiltered.length < 0 && itemsWithoutUpdateFiltered.length < 0) return;

    fetchItemPrices(itemsToUpdateFiltered, function () {
        updateOverlay(itemsToUpdateFiltered.concat(itemsWithoutUpdateFiltered), kuudraTier);
    });
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

        if (attributesItems[uuid]) {
            const item = attributesItems[uuid];
            requestBody.type = "ATTRIBUTES";
            requestBody.itemId = item.itemId;

            const attributes = item.attributes;
            Object.keys(attributes).forEach((key, index) => {
                requestBody[`attribute${index + 1}`] = key;
                requestBody[`attributeLvl${index + 1}`] = attributes[key];
            });
        } else if (bazaarItems[uuid]) {
            const item = bazaarItems[uuid];
            requestBody.type = "BAZAAR";
            requestBody.itemId = item.itemId;
        } else if (auctionItems[uuid]) {
            const item = auctionItems[uuid];
            requestBody.type = "AUCTION";
            requestBody.itemId = item.itemId;
        }

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
            data.forEach(itemData => updateItemPrices(itemData));
            callback();
        })
        .catch(error => {
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (!error.isAxiosError || error.code == 500) {
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

function updateBazaarItemPrices(item, itemData) {
    const multiplier = item.count || 1;
    item.buyPrice = itemData.buyPrice * multiplier || 0;
    item.sellPrice = itemData.sellPrice * multiplier || 0;
    item.displayPrice = `${itemData.buyPrice ? "&a" : "&c"}Sell order: ${fixNumber(item.buyPrice) || 0}\n${itemData.sellPrice ? "&a" : "&c"}Insta sell: ${fixNumber(item.sellPrice) || 0}`;
}

function updateAuctionItemPrices(item, itemData) {
    item.price = itemData.price || 0;
    item.displayPrice = `${itemData.price ? "&a" : "&c"}Price: ${fixNumber(itemData.price) || 0}`;
}

function calculateTotalProfit(uuids) {
    return uuids.reduce((totalProfit, uuid) => {
        if (attributesItems[uuid]) {
            const item = attributesItems[uuid];
            if (item.itemId === "ATTRIBUTE_SHARD") {
                return totalProfit + item.price;
            }
            return totalProfit + (item.price > Settings.minGodroll * 1000000 ? item.price : Math.max(item.priceAttribute1 || 0, item.priceAttribute2 || 0));
        } else if (bazaarItems[uuid]) {
            if (uuid === "crimson" && Settings.ignoreEssence) return totalProfit;
            if (uuid === "teeth" && Settings.ignoreTeeth) return totalProfit;
            const item = bazaarItems[uuid];
            const price = Settings.sellOrderPrice 
                ? (item.buyPrice !== 0 ? item.buyPrice : item.sellPrice) 
                : (item.sellPrice !== 0 ? item.sellPrice : item.buyPrice);

            return totalProfit + price;
        } else if (auctionItems[uuid]) {
            return totalProfit + auctionItems[uuid].price;
        }
        return totalProfit;
    }, 0);
}

function updateOverlay(uuids, tier) {
    let totalProfit = calculateTotalProfit(uuids);
    let keyMessage = "";

    if (tier !== "UNKNOWN") {
        const key = getKey();
        if (key) {
            totalProfit -= key.price;
            keyMessage = `${key.name} &7x1 &f= &c-${fixNumber(key.price)}\n${Settings.kuudraProfitCompact ? "" : "\n"}`;
        }
    }

    const profitColor = totalProfit > 0 ? "&a" : "&c";
    const msg = `${kicPrefix} &a&lChest profit\n\n${profitColor}${totalProfit > 25000000 ? "&l" : ""}Total: ${totalProfit < 0 ? "-" : "+"}${fixNumber(totalProfit)}\n\n${keyMessage}`;

    const itemMessages = uuids.map(uuid =>
        Settings.kuudraProfitCompact ? getOverlayTextCompact(uuid) : getOverlayText(uuid)
    ).filter(e => e).join(Settings.kuudraProfitCompact ? "\n" : "\n\n");

    profitGui.setMessage(`${msg}${itemMessages}`);
}

function getKey() {
    const type = Settings.barbKey ? "KEY_BARB" : "KEY_MAGE";
    const item = bazaarItems[type];
    if (!item) return null;

    const price = (Settings.sellOrderPrice ? item.buyPrice || item.sellPrice : item.sellPrice || item.buyPrice) + (item.basePrice || 0);

    return { name: item.name, price };
}

function getOverlayText(uuid) {
    if (Settings.ignoreEssence && uuid === "crimson") return;
    if (Settings.ignoreTeeth && uuid === "teeth") return;

    const item = attributesItems[uuid] || bazaarItems[uuid] || auctionItems[uuid];
    if (!item || item.calcIgnore) return;

    let text = `${item.name} &r&7x${item.count || 1}\n${item.displayPrice || ""}`;
    if (item.attributeDisplayPrices && item.attributeDisplayPrices.length) {
        text += `\n${item.attributeDisplayPrices.join("\n")}`;
    }
    return text;
}

function getOverlayTextCompact(uuid) {
    if (Settings.ignoreEssence && uuid === "crimson") return;
    if (Settings.ignoreTeeth && uuid === "teeth") return;

    const item = attributesItems[uuid] || bazaarItems[uuid] || auctionItems[uuid];
    if (!item || item.calcIgnore) return;

    let price = 0;

    if (attributesItems[uuid]) {
        price = item.itemId === "ATTRIBUTE_SHARD"
            ? item.price
            : Math.max(item.price > Settings.minGodroll * 1000000 ? item.price : Math.max(item.priceAttribute1 || 0, item.priceAttribute2 || 0));
    } else if (bazaarItems[uuid]) {
        price = Settings.sellOrderPrice
            ? item.buyPrice || item.sellPrice
            : item.sellPrice || item.buyPrice;
    } else if (auctionItems[uuid]) {
        price = auctionItems[uuid].price;
    }

    return `${item.name} &r&7x${item.count || 1} &f= ${price > 0 ? "&a+" : "&c"}${fixNumber(price)}`;
}
