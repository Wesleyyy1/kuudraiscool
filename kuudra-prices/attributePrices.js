import request from '../../requestV2';
import Settings from '../settings/config.js';
import { fixNumber, capitalizeEachWord, formatTime, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg  } from '../utils/generalUtils.js';

const itemTypes = {
    armor: {
        helmets: ['hollow_helmet', 'fervor_helmet', 'terror_helmet', 'crimson_helmet', 'aurora_helmet'],
        chestplates: ['hollow_chestplate', 'fervor_chestplate', 'terror_chestplate', 'crimson_chestplate', 'aurora_chestplate'],
        leggings: ['hollow_leggings', 'fervor_leggings', 'terror_leggings', 'crimson_leggings', 'aurora_leggings'],
        boots: ['hollow_boots', 'fervor_boots', 'terror_boots', 'crimson_boots', 'aurora_boots']
    },
    equipment: {
        necklaces: ['molten_necklace', 'lava_shell_necklace', 'delirium_necklace', 'magma_necklace', 'vanquished_magma_necklace'],
        cloaks: ['molten_cloak', 'scourge_cloak', 'ghast_cloak', 'vanquished_ghast_cloak'],
        belts: ['molten_belt', 'implosion_belt', 'scoville_belt', 'blaze_belt', 'vanquished_blaze_belt'],
        bracelets: ['molten_bracelet', 'gauntlet_of_contagion', 'flaming_fist', 'glowstone_gauntlet', 'vanquished_glowstone_gauntlet']
    },
    fishing_armor: {
        helmets: ['magma_lord_helmet', 'thunder_helmet', 'taurus_helmet'],
        chestplates: ['magma_lord_chestplate', 'thunder_chestplate', 'taurus_chestplate'],
        leggings: ['magma_lord_leggings', 'thunder_leggings', 'taurus_leggings'],
        boots: ['magma_lord_boots', 'thunder_boots', 'taurus_boots']
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
let currentIndex = {};

register('command', (arg1, arg2, arg3, arg4) => {
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
            ChatLib.chat('&cLevel1 must be between 1-10.');
            return;
        }
        requestBody.attributeLvl1 = level1;
    }
    if (attribute2) {
        requestBody.attribute2 = attribute2;
    }
    if (level2) {
        if (level2 < 1 || level2 > 10) {
            ChatLib.chat('&cLevel2 must be between 1-10.');
            return;
        }
        requestBody.attributeLvl2 = level2;
    }

    request({
        url: 'https://api.sm0kez.com/crimson/attribute/prices',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (ChatTriggers)',
            'API-Key': Settings.apikey
        },
        body: requestBody,
        json: true
    })
        .then(data => {
            priceData = data;
            activeCategory = 'armor';
            initializeCurrentIndex();
            showPrices();
        })
        .catch(error => {
            errorHandler('Error while getting prices', error, 'attributePrices.js');
        });

}).setTabCompletions((args) => {
    if (args.length > 4) return [];
    let lastArg = args[args.length - 1].toLowerCase();
    return attributes.filter(attr => attr.toLowerCase().startsWith(lastArg));
}).setName('attributeprice', true).setAliases('ap');

register('command', (arg1, arg2) => {
    if ((['armor', 'equipment', 'fishing_armor'].includes(arg1)) && !isNaN(arg2) && activeCategory !== arg1) {
        activeCategory = arg1;
        showPrices(parseInt(arg2));
    }
}).setName('apchangecategory');

register('command', (direction, type, maxIndex, msgid) => {
    if (!['prev', 'next'].includes(direction) || !type || !maxIndex || !msgid) return;

    let currentIndexValue = currentIndex[type];
    let newIndexValue = currentIndexValue;

    if (direction === 'prev') {
        newIndexValue = Math.max(0, currentIndexValue - 1);
    } else if (direction === 'next') {
        newIndexValue = Math.min(maxIndex - 1, currentIndexValue + 1);
    }

    if (newIndexValue !== currentIndexValue) {
        currentIndex[type] = newIndexValue;
        showPrices(parseInt(msgid));
    }
}).setName('apnavigate');

register('command', (arg1, arg2, arg3, arg4) => {
    if (!arg1 || !arg2 || !arg3 || !arg4) {
        ChatLib.chat('&cAll arguments are required.');
        return;
    }

    const startlvl = parseInt(arg3);
    const endlvl = parseInt(arg4);

    if (isNaN(startlvl) || isNaN(endlvl)) {
        ChatLib.chat('&cLevels must be numbers.');
        return;
    }

    if (startlvl < 1 || startlvl > 10 || endlvl < 1 || endlvl > 10) {
        ChatLib.chat('&cLevels must be between 1 and 10.');
        return;
    }

    if (startlvl >= endlvl) {
        ChatLib.chat('&cEnd level must be greater than start level.');
        return;
    }

    // Your command logic here
}).setTabCompletions((args) => {
    if (args.length === 1) {
        let lastArg = args[0].toLowerCase();
        return attributes.filter(attr => attr.startsWith(lastArg));
    } else if (args.length === 2) {
        let lastArg = args[1].toLowerCase();
        return itemTypesArray.filter(item => item.startsWith(lastArg));
    }
    return [];
}).setName('attributeupgrade', true).setAliases('au');

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

        const categoryText = capitalizeEachWord(activeCategory.replaceAll('_', ' '));
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

        message.addTextComponent(new TextComponent(`\n&6Cheapest auctions for ${attributeText}&6 on &2${categoryText}`));

        const timeAgo = formatTime(Math.abs(priceData.timestamp - Date.now()));
        message.addTextComponent(new TextComponent(`\n&6Click to open the auction. Last refresh was &e${timeAgo}&6.\n`));

        Object.entries(itemTypes[activeCategory] || {}).forEach(([itemType, types]) => {
            message.addTextComponent(new TextComponent(`\n&6Cheapest &2${capitalizeEachWord(itemType)}\n`));
            types.forEach(type => {
                const dataSource = activeCategory === 'equipment' ? priceData.equipment : priceData.armor;
                if (dataSource[itemType][type] && dataSource[itemType][type][currentIndex[type]]) {
                    const currentItemIndex = currentIndex[type];
                    const totalItems = dataSource[itemType][type].length;
                    const itemText = new TextComponent(`&6- &9${capitalizeEachWord(type.replaceAll('_', ' '))} &6for &e${fixNumber(dataSource[itemType][type][currentItemIndex].price)} &7(${currentItemIndex + 1}/${totalItems})`)
                        .setClick('run_command', `/viewauction ${dataSource[itemType][type][currentItemIndex].uuid}`);
                    message.addTextComponent(itemText);

                    const prevButton = new TextComponent(` &a[<] `).setClick('run_command', `/apnavigate prev ${type} ${totalItems} ${lineId}`);
                    const nextButton = new TextComponent(` &a[>]\n`).setClick('run_command', `/apnavigate next ${type} ${totalItems} ${lineId}`);
                    message.addTextComponent(prevButton);
                    message.addTextComponent(nextButton);
                }
            });
        });

        message.addTextComponent(new TextComponent('\n'));

        const categories = ['armor', 'equipment', 'fishing_armor'];
        categories.forEach(cat => {
            const color = activeCategory === cat ? '&a' : '&6';
            const categoryText = new TextComponent(`${color} [${capitalizeEachWord(cat.replaceAll('_', ' '))}] `)
                .setClick('run_command', `/apchangecategory ${cat} ${lineId}`);
            message.addTextComponent(categoryText);
        });

        ChatLib.chat(message);
    }
}
