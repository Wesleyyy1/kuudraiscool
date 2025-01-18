import axios from "axios";
import Settings from "../settings/config.js";
import {
    capitalizeEachWord,
    errorHandler,
    fixNumber,
    formatTime,
    getRoles,
    isKeyValid,
    kicPrefix
} from "../utils/generalUtils.js";
import {attributes, getPriceData} from "../utils/priceUtils.js";

const categories = ["armor", "equipment", "fishing_armor", "shard"];

const itemTypes = {
    armor: {
        helmets: ["hollow_helmet", "fervor_helmet", "terror_helmet", "crimson_helmet", "aurora_helmet"],
        chestplates: ["hollow_chestplate", "fervor_chestplate", "terror_chestplate", "crimson_chestplate", "aurora_chestplate"],
        leggings: ["hollow_leggings", "fervor_leggings", "terror_leggings", "crimson_leggings", "aurora_leggings"],
        boots: ["hollow_boots", "fervor_boots", "terror_boots", "crimson_boots", "aurora_boots"]
    },
    equipment: {
        necklaces: ["molten_necklace", "lava_shell_necklace", "delirium_necklace", "magma_necklace", "vanquished_magma_necklace"],
        cloaks: ["molten_cloak", "scourge_cloak", "ghast_cloak", "vanquished_ghast_cloak"],
        belts: ["molten_belt", "implosion_belt", "scoville_belt", "blaze_belt", "vanquished_blaze_belt"],
        bracelets: ["molten_bracelet", "gauntlet_of_contagion", "flaming_fist", "glowstone_gauntlet", "vanquished_glowstone_gauntlet"]
    },
    fishing_armor: {
        helmets: ["magma_lord_helmet", "thunder_helmet", "taurus_helmet"],
        chestplates: ["magma_lord_chestplate", "thunder_chestplate", "taurus_chestplate"],
        leggings: ["magma_lord_leggings", "thunder_leggings", "taurus_leggings"],
        boots: ["magma_lord_boots", "thunder_boots", "taurus_boots"]
    }
};

const itemTypesArray = [];
Object.values(itemTypes).forEach(category => {
    Object.values(category).forEach(items => {
        items.forEach(item => {
            itemTypesArray.push(item);
        });
    });
});

const apPartyTypes = {
    armor: {
        helmets: ["hollow_helmet", "fervor_helmet", "terror_helmet", "crimson_helmet", "aurora_helmet"],
        chestplates: ["hollow_chestplate", "fervor_chestplate", "terror_chestplate", "crimson_chestplate", "aurora_chestplate"],
        leggings: ["hollow_leggings", "fervor_leggings", "terror_leggings", "crimson_leggings", "aurora_leggings"],
        boots: ["hollow_boots", "fervor_boots", "terror_boots", "crimson_boots", "aurora_boots"],
    },
    equipment: {
        necklaces: ["molten_necklace"],
        cloaks: ["molten_cloak"],
        belts: ["molten_belt"],
        bracelets: ["molten_bracelet"]
    }
}

let priceData = null;
let activeCategory = null;
let cheapest = false;
let currentIndex = {};
let apPartyLastRan = Date.now() - 2000;
let currentItem = null;
let currentItemPrice = null;
let currentTotal = null;
let currentLine = null;

register("command", (arg1, arg2, arg3, arg4) => {
    getPriceData(arg1, arg2, arg3, arg4, "ap", (data) => {
        priceData = data;
        activeCategory = "armor";
        cheapest = false;
        initializeCurrentIndex();
        showPrices();
    });
}).setTabCompletions((args) => {
    if (args.length > 4) return [];
    let lastArg = args[args.length - 1].toLowerCase();
    return attributes.filter(attr => attr.toLowerCase().startsWith(lastArg));
}).setName("attributeprice", true).setAliases("ap");

register("command", (arg1, arg2) => {
    if ((categories.includes(arg1)) && !isNaN(arg2) && activeCategory !== arg1) {
        activeCategory = arg1;
        showPrices(parseInt(arg2));
    }
}).setName("apchangecategory");

register("command", (arg1) => {
    cheapest = !cheapest;
    showPrices(parseInt(arg1));
}).setName("aptogglecheapest");

register("command", (direction, type, maxIndex, msgid) => {
    apnavigate(direction, type, maxIndex, msgid);
}).setName("apnavigate");

function apnavigate(direction, type, maxIndex, msgid) {
    if (!["prev", "next"].includes(direction) || !type || !maxIndex || !msgid) return;

    let currentIndexValue = currentIndex[type];
    let newIndexValue = currentIndexValue;

    if (direction === "prev") {
        newIndexValue = Math.max(0, currentIndexValue - 1);
    } else if (direction === "next") {
        newIndexValue = Math.min(maxIndex - 1, currentIndexValue + 1);
    }

    if (newIndexValue !== currentIndexValue) {
        currentIndex[type] = newIndexValue;
        showPrices(parseInt(msgid));
    }
}

function initializeCurrentIndex() {
    currentIndex = {};

    itemTypesArray.forEach(item => {
        currentIndex[item] = 0;
    })

    currentIndex["shard"] = 0;
}

function showPrices(messageId) {
    if (priceData && activeCategory) {
        const lineId = messageId || Math.floor(priceData.timestamp / 1000);
        const message = new Message().setChatLineId(lineId);

        const categoryText = capitalizeEachWord(activeCategory.replaceAll("_", " "));
        let attributeText = `&b${priceData.attribute1}`;
        if (priceData.attributeLvl1 != null) {
            attributeText += ` ${priceData.attributeLvl1}`;
        }
        if (priceData.attribute2 != null) {
            attributeText += `&6 and &b${priceData.attribute2}`;
        }
        if (priceData.attributeLvl2 != null) {
            attributeText += ` ${priceData.attributeLvl2}`;
        }

        message.addTextComponent(new TextComponent(`\n${kicPrefix} &6Cheapest auctions for ${attributeText.replaceAll("Mending", "Vitality")}&6 on &2${categoryText}`));

        const timeAgo = formatTime(Math.abs(priceData.timestamp - Date.now()));
        message.addTextComponent(new TextComponent(`\n&6Click to open the auction. Last refresh was &e${timeAgo}&6.\n`));

        let dataSource;
        if (activeCategory === "equipment") {
            dataSource = priceData.equipment;
        } else if (activeCategory === "armor" || activeCategory === "fishing_armor") {
            dataSource = priceData.armor;
        } else {
            dataSource = priceData.shards;
        }

        if (dataSource === null || dataSource === [] || dataSource === {} || dataSource.length === 0) {
            const itemText = new TextComponent(`\n&6- &cNo auctions found!\n`);
            message.addTextComponent(itemText);
        } else {
            if (activeCategory === "shard") {
                const currentItemIndex = currentIndex["shard"];
                const totalItems = dataSource.length;
                const item = dataSource[currentItemIndex];
                message.addTextComponent(new TextComponent(`\n&6Cheapest &2Shards\n`));
                const itemText = new TextComponent(`&6- &9Attribute Shard &6for &e${fixNumber(item.price)} &7(${currentItemIndex + 1}/${totalItems})`)
                    .setClick("run_command", `/apviewauction ${item.uuid} attribute_shard ${item.price} ${totalItems} ${lineId}`);
                message.addTextComponent(itemText);

                const prevButton = new TextComponent(` &a[<] `).setClick("run_command", `/apnavigate prev ${"shard"} ${totalItems} ${lineId}`);
                const nextButton = new TextComponent(` &a[>]\n`).setClick("run_command", `/apnavigate next ${"shard"} ${totalItems} ${lineId}`);
                message.addTextComponent(prevButton);
                message.addTextComponent(nextButton);
            } else {
                Object.entries(itemTypes[activeCategory] || {}).forEach(([itemType, types]) => {
                    message.addTextComponent(new TextComponent(`\n&6Cheapest &2${capitalizeEachWord(itemType)}\n`));
                    if (activeCategory === "armor" && cheapest) {
                        const items = types.reduce((acc, type) => {
                            if (dataSource[itemType][type]) {
                                dataSource[itemType][type].forEach(item => {
                                    const newItem = {...item, type};
                                    acc.push(newItem);
                                });
                            }
                            return acc;
                        }, []);
                        items.sort((a, b) => a.price - b.price);
                        items.slice(0, 5).forEach(item => {
                            const itemText = new TextComponent(`&6- &9${capitalizeEachWord(item.type.replaceAll("_", " "))} &6for &e${fixNumber(item.price)}\n`)
                                .setClick("run_command", `/viewauction ${item.uuid}`);
                            message.addTextComponent(itemText);
                        });
                    } else {
                        types.forEach(type => {
                            if (dataSource[itemType][type] && dataSource[itemType][type][currentIndex[type]]) {
                                const currentItemIndex = currentIndex[type];
                                const totalItems = dataSource[itemType][type].length;
                                const item = dataSource[itemType][type][currentItemIndex];
                                const itemText = new TextComponent(`&6- &9${capitalizeEachWord(type.replaceAll("_", " "))} &6for &e${fixNumber(item.price)} &7(${currentItemIndex + 1}/${totalItems})`)
                                    .setClick("run_command", `/apviewauction ${item.uuid} ${type} ${item.price} ${totalItems} ${lineId}`);
                                message.addTextComponent(itemText);

                                const prevButton = new TextComponent(` &a[<] `).setClick("run_command", `/apnavigate prev ${type} ${totalItems} ${lineId}`);
                                const nextButton = new TextComponent(` &a[>]\n`).setClick("run_command", `/apnavigate next ${type} ${totalItems} ${lineId}`);
                                message.addTextComponent(prevButton);
                                message.addTextComponent(nextButton);
                            }
                        });
                    }
                });
            }
        }

        message.addTextComponent(new TextComponent("\n"));

        categories.forEach(cat => {
            if (cat === "shard" && priceData.attribute2 != null) {
                return;
            }
            const color = activeCategory === cat ? "&a" : "&6";
            const categoryText = new TextComponent(`${color} [${capitalizeEachWord(cat.replaceAll("_", " "))}] `)
                .setClick("run_command", `/apchangecategory ${cat} ${lineId}`);
            message.addTextComponent(categoryText);
        });

        if (activeCategory === "armor") {
            const cheapstColor = cheapest ? "&a" : "&6";
            const cheapestText = new TextComponent(`${cheapstColor} [Cheapest] `)
                .setClick("run_command", `/aptogglecheapest ${lineId}`);
            message.addTextComponent(cheapestText);
        }

        ChatLib.chat(message);
    }
}

register("command", (uuid, type, price, maxIndex, msgid) => {
    ChatLib.command(`viewauction ${uuid}`);
    currentItem = type;
    currentItemPrice = price;
    currentTotal = maxIndex;
    currentLine = msgid;
}).setName("apviewauction");

register("chat", function (item, price, event) {
    if (currentItem === null || currentItemPrice === null || currentTotal === null || currentLine === null) return;

    try {
        const intGlobalsPrice = parseInt(currentItemPrice);
        const intPrice = parseInt(price.replaceAll(",", ""));
        const itemId = item.replaceAll(" ", "_").toLowerCase();
        if (!isNaN(intPrice) && intPrice > 0) {
            if (intPrice === intGlobalsPrice && itemId.includes(currentItem.toLowerCase())) {
                apnavigate("next", currentItem, currentTotal, currentLine);
            }
        }
    } catch (error) {
        // Ignore
    }
    currentItem = null;
    currentItemPrice = null;
    currentTotal = null;
    currentLine = null;
}).setCriteria("You purchased ${item} for ${price} coins!");

export function apChatCommand(attribute, lvl, chat) {
    if (!isKeyValid() || !getRoles().includes("KUUDRA") || !isNaN(attribute)) return;

    if ((Date.now() - apPartyLastRan) < 2000) {
        ChatLib.command("pc Command on cooldown!");
        return;
    }

    apPartyLastRan = Date.now();

    let requestBody = {};
    requestBody.attribute1 = attribute
    if (lvl && !isNaN(lvl) && lvl >= 1 && lvl <= 10) {
        requestBody.attributeLvl1 = lvl;
    }

    axios.post("https://api.sm0kez.com/crimson/attribute/prices", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: requestBody,
        parseBody: true
    })
        .then(response => {
            let prices = {
                helmets: 0,
                chestplates: 0,
                leggings: 0,
                boots: 0,
                necklaces: 0,
                cloaks: 0,
                belts: 0,
                bracelets: 0,
            };

            let data = response.data;
            let armorData = data.armor;
            let equipmentData = data.equipment;

            Object.entries(apPartyTypes.armor).forEach(([itemType, types]) => {
                let items = [];
                types.forEach(type => {
                    if (armorData[itemType] && armorData[itemType][type]) {
                        items = items.concat(armorData[itemType][type]);
                    }
                });
                if (items.length > 0) {
                    items.sort((a, b) => a.price - b.price);
                    prices[itemType] = items[0].price || 0;
                }
            });

            Object.entries(apPartyTypes.equipment).forEach(([itemType, types]) => {
                let items = [];
                types.forEach(type => {
                    if (equipmentData[itemType] && equipmentData[itemType][type]) {
                        items = items.concat(equipmentData[itemType][type]);
                    }
                });
                if (items.length > 0) {
                    items.sort((a, b) => a.price - b.price);
                    prices[itemType] = items[0].price || 0;
                }
            });

            let attributeText = `${data.attribute1} ${data.attributeLvl1 != null ? data.attributeLvl1 : ""}`;
            ChatLib.command(`${chat} ${attributeText.replace("Mending", "Vitality")} > Helmet: ${fixNumber(prices.helmets)} - Cp: ${fixNumber(prices.chestplates)} - Legs: ${fixNumber(prices.leggings)} - Boots: ${fixNumber(prices.boots)} - Neck: ${fixNumber(prices.necklaces)} - Cloak: ${fixNumber(prices.cloaks)} - Belt: ${fixNumber(prices.belts)} - Brace: ${fixNumber(prices.bracelets)}`);
        })
        .catch(error => {
            if (!error.isAxiosError || error.code === 500) {
                errorHandler("Error while getting prices for party command", error.message, "attributePrices.js", `Attribute: ${attribute} | Lvl: ${lvl}`);
            }
        });
}
