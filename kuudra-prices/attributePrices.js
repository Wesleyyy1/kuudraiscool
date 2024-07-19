import request from '../../requestV2';
import Settings from '../settings/config.js';
import { fixNumber, capitalizeEachWord, formatTime, errorHandler } from '../utils/generalUtils.js';

let priceData = null;
let activeCategory = null;

register('command', (arg1, arg2, arg3, arg4) => {
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
        if (level1 < 0 || level1 > 10) {
            ChatLib.chat('&cLevel1 must be between 1-10.')
            return;
        }
        requestBody.attributeLvl1 = level1;
    }
    if (attribute2) {
        requestBody.attribute2 = attribute2;
    }
    if (level2) {
        if (level2 < 0 || level2 > 10) {
            ChatLib.chat('&cLevel2 must be between 1-10.')
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
            showPrices();
        })
        .catch(error => {
            errorHandler('Error while getting prices', error, 'attributePrices.js');
        });

}).setName('attributeprice', true).setAliases('ap');

register('command', (arg1, arg2) => {
    if ((['armor', 'equipment', 'fishing_armor'].includes(arg1)) && !isNaN(arg2) && activeCategory != arg1) {
        activeCategory = arg1;
        showPrices(parseInt(arg2));
    }
}).setName('apchangecategory');

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

        Object.entries(itemTypes[activeCategory] || {}).forEach(([itemType, types]) => {
            message.addTextComponent(new TextComponent(`\n&6Cheapest &2${capitalizeEachWord(itemType)}\n`));
            types.forEach(type => {
                const dataSource = activeCategory === 'equipment' ? priceData.equipment : priceData.armor;
                if (dataSource[itemType][type] && dataSource[itemType][type][0]) {
                    const itemText = new TextComponent(`&6- &9${capitalizeEachWord(type.replaceAll('_', ' '))} &6for &e${fixNumber(dataSource[itemType][type][0].price)}\n`)
                        .setClick('run_command', `/viewauction ${dataSource[itemType][type][0].uuid}`);
                    message.addTextComponent(itemText);
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
