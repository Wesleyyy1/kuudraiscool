import axios from "axios";
import Settings from "../settings/config.js";
import { fixNumber, capitalizeEachWord, formatTime, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg } from "../utils/generalUtils.js";

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

const attributes = [
    "arachno",
    "attack_speed",
    "blazing",
    "combo",
    "elite",
    "ender",
    "ignition",
    "life_recovery",
    "mana_steal",
    "midas_touch",
    "undead",
    "warrior",
    "deadeye",
    "arachno_resistance",
    "blazing_resistance",
    "breeze",
    "dominance",
    "ender_resistance",
    "experience",
    "fortitude",
    "life_regeneration",
    "lifeline",
    "magic_find",
    "mana_pool",
    "mana_regeneration",
    "vitality",
    "speed",
    "undead_resistance",
    "veteran",
    "blazing_fortune",
    "fishing_experience",
    "infection",
    "double_hook",
    "fisherman",
    "fishing_speed",
    "hunter",
    "trophy_hunter"
];

let priceData = null;
let activeCategory = null;
let cheapest = false;
let currentIndex = {};

register("command", (arg1, arg2, arg3, arg4) => {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (!arg1) return;

    const attribute1 = arg1;
    let level1 = 0;
    let attribute2 = null;
    let level2 = 0;

    if (arg2 && isNaN(arg2)) {
        attribute2 = arg2;
        if (arg3 && !isNaN(arg3)) {
            level2 = parseInt(arg3);
        }
    } else if (arg2 && !isNaN(arg2)) {
        level1 = parseInt(arg2);
        if (arg3 && isNaN(arg3)) {
            attribute2 = arg3;
            if (arg4 && !isNaN(arg4)) {
                level2 = parseInt(arg4);
            }
        }
    }

    let requestBody = {};
    requestBody.attribute1 = attribute1;
    if (level1) {
        if (level1 < 1 || level1 > 10) {
            ChatLib.chat("&cLevel1 must be between 1-10.");
            return;
        }
        requestBody.attributeLvl1 = level1;
    }
    if (attribute2) {
        requestBody.attribute2 = attribute2;
    }
    if (level2) {
        if (level2 < 1 || level2 > 10) {
            ChatLib.chat("&cLevel2 must be between 1-10.");
            return;
        }
        requestBody.attributeLvl2 = level2;
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
            priceData = response.data;
            activeCategory = "armor";
            cheapest = false;
            initializeCurrentIndex();
            showPrices();
        })
        .catch(error => {
            if (error.isAxiosError && error.code != 500) {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &c${error.response.data}`);
            } else {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &cSomething went wrong while getting price data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting prices", error.message, "attributePrices.js");
            }
        });
}).setTabCompletions((args) => {
    if (args.length > 4) return [];
    let lastArg = args[args.length - 1].toLowerCase();
    return attributes.filter(attr => attr.toLowerCase().startsWith(lastArg));
}).setName("attributeprice", true).setAliases("ap");

register("command", (arg1, arg2) => {
    if ((["armor", "equipment", "fishing_armor"].includes(arg1)) && !isNaN(arg2) && activeCategory !== arg1) {
        activeCategory = arg1;
        showPrices(parseInt(arg2));
    }
}).setName("apchangecategory");

register("command", (arg1) => {
    cheapest = !cheapest;
    showPrices(parseInt(arg1));
}).setName("aptogglecheapest");

register("command", (direction, type, maxIndex, msgid) => {
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
}).setName("apnavigate");

// UNFINISHED
/* register("command", (arg1, arg2, arg3, arg4) => {
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
            if (error.isAxiosError && error.code != 500) {
                if (error.code == 429) {
                    ChatLib.chat(`&7[&a&lKIC&r&7]&r &c${error.response.data}`);
                } else {
                    ChatLib.chat(`&7[&a&lKIC&r&7]&r &cYou've reached the usage limit for this feature. It can only be used once every 10 minutes. Please try again later.`);
                }
            } else {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &cSomething went wrong while getting price data!\n&cPlease report this in the discord server!`);
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
}).setName("attributeupgrade", true).setAliases("au"); */

function initializeCurrentIndex() {
    currentIndex = {};

    itemTypesArray.forEach(item => {
        currentIndex[item] = 0;
    })
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

        message.addTextComponent(new TextComponent(`\n&7[&a&lKIC&r&7]&r &6Cheapest auctions for ${attributeText}&6 on &2${categoryText}`));

        const timeAgo = formatTime(Math.abs(priceData.timestamp - Date.now()));
        message.addTextComponent(new TextComponent(`\n&6Click to open the auction. Last refresh was &e${timeAgo}&6.\n`));

        const dataSource = activeCategory === "equipment" ? priceData.equipment : priceData.armor;

        Object.entries(itemTypes[activeCategory] || {}).forEach(([itemType, types]) => {
            message.addTextComponent(new TextComponent(`\n&6Cheapest &2${capitalizeEachWord(itemType)}\n`));
            if (activeCategory === "armor" && cheapest) {
                const items = types.reduce((acc, type) => {
                    if (dataSource[itemType][type]) {
                        dataSource[itemType][type].forEach(item => {
                            const newItem = { ...item, type };
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
                            .setClick("run_command", `/viewauction ${item.uuid}`);
                        message.addTextComponent(itemText);

                        const prevButton = new TextComponent(` &a[<] `).setClick("run_command", `/apnavigate prev ${type} ${totalItems} ${lineId}`);
                        const nextButton = new TextComponent(` &a[>]\n`).setClick("run_command", `/apnavigate next ${type} ${totalItems} ${lineId}`);
                        message.addTextComponent(prevButton);
                        message.addTextComponent(nextButton);
                    }
                });
            }
        });

        message.addTextComponent(new TextComponent("\n"));

        const categories = ["armor", "equipment", "fishing_armor"];
        categories.forEach(cat => {
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

function showUpgradeMsg(data, start, end) {
    const message = new Message();
    message.addTextComponent(new TextComponent(`\n&7[&a&lKIC&r&7]&r &6Cheapest way to upgrade &b${capitalizeEachWord(data.attribute.replaceAll("_", " "))}&6 on your &2${capitalizeEachWord(data.item.replaceAll("_", " "))}&6 from &e${start} &6to &e${end}&6.`));

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
