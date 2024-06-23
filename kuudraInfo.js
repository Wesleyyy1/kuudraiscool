import { request } from '../requestV2';
import { decompress, fixNumber, getColorData } from './utils/generalUtils.js';

//

const ITEM_IDS = {
    WITHER_BLADES: new Set(["HYPERION", "VALKYRIE", "ASTRAEA", "SCYLLA"]),
    TERMINATOR: "TERMINATOR",
    RAGNAROCK_AXE: "RAGNAROCK_AXE",
    WARDEN_HELMET: "WARDEN_HELMET",
    REAPER_CHESTPLATE: "REAPER_CHESTPLATE",
    REAPER_LEGGINGS: "REAPER_LEGGINGS",
    REAPER_BOOTS: "REAPER_BOOTS",
    OVERFLUX_POWER_ORB: "OVERFLUX_POWER_ORB",
    PLASMAFLUX_POWER_ORB: "PLASMAFLUX_POWER_ORB",
    SOS_FLARE: "SOS_FLARE",
    FIRE_VEIL_WAND: "FIRE_VEIL_WAND",
    TITANIUM_DRILL_4: "TITANIUM_DRILL_4",
    DIVAN_DRILL: "DIVAN_DRILL"
};

let extraDrill, extraFireveil, reaperPieces, lifeline, lifelineLore, manaPool, manaPoolLore, basicComps, hotComps, burningComps, fieryComps, infernalComps, totalComps, magicalPower, selectedPower, tuningPoints, hyperion, hyperionLore, duplex, duplexLore, fatalTempo, fatalTempoLore, ragnarockAxe, ragnarockAxeLore, extraReaper, extraFerociousMana, extraStrongMana, extraManaEnchantTotal, extraLegionEnchant, extraTerminator, extraDeployable, reputation, wardenHelmet, wardenHelmetLore, terrorChestplate, terrorChestplateLore, terrorChestplatePrefix, terrorLeggings, terrorLeggingsLore, terrorLeggingsPrefix, terrorBoots, terrorBootsLore, terrorBootsPrefix, goldenDragon, goldenDragonLore, oneBilBank;

function setDefaults() {
    reaperPieces = lifeline = manaPool = basicComps = hotComps = burningComps = fieryComps = infernalComps = totalComps = magicalPower = extraFerociousMana = extraStrongMana = extraManaEnchantTotal = extraLegionEnchant = reputation = 0;
    extraDrill = extraFireveil = hyperion = hyperionLore = duplex = duplexLore = fatalTempo = fatalTempoLore = ragnarockAxe = ragnarockAxeLore = extraReaper = extraTerminator = extraDeployable = `&4X`;
    wardenHelmet = wardenHelmetLore = '&4No Warden Helmet';
    terrorChestplate = terrorChestplateLore = '&4No Terror Chestplate';
    terrorLeggings = terrorLeggingsLore = '&4No Terror Leggings';
    terrorBoots = terrorBootsLore = '&4No Terror Boots';
    goldenDragon = '&4No Golden Dragon';
    terrorChestplatePrefix = terrorLeggingsPrefix = terrorBootsPrefix = `&8*`;

    lifelineLore = `&a&lLifeline Breakdown:\n\n`;
    manaPoolLore = `&a&lMana Pool Breakdown:\n\n`;

    selectedPower = '';
    tuningPoints = '';

    goldenDragonLore = `&r`;
    oneBilBank = `&c`;
}

function showKuudraInfo(playername, apiKey) {
    setDefaults();
    request({
        url: `https://api.sm0kez.com/profile/${playername}/selected`,
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": apiKey
        },
        json: true
    }).then((response) => {
        if (response.success) {
            processKuudraData(response);
        } else {
            ChatLib.chat(`&c${playername} is not a valid player!`);
        }
    }).catch((errorData) => {
        ChatLib.chat(`&cSomething went wrong while gathering ${playername}'s data!\n&7(Probably invalid API key (/apikey <new key>))`);
        console.log(`${errorData}`);
    });
}

function processKuudraData(response) {
    const { name, uuid, members } = response;
    const memberData = members[uuid];
    const netherData = memberData.nether_island_player_data;
    const inventory = memberData.inventory;

    processMagicalPower(memberData);
    processRuns(netherData);
    processReputation(netherData);
    processGoldenDragon(memberData.pets_data.pets);

    if (inventory) {
        processInventory(inventory.inv_contents?.data);
        processArmor(inventory.inv_armor?.data);
        processWardrobe(inventory.wardrobe_contents?.data);
        processEquipment(inventory.equipment_contents?.data);

        finalizeData(response, uuid);
    } else {
        apiOff();
    }

    displayMessage(name);
}

function processReputation(netherData) {
    const mageRep = netherData?.mages_reputation || 0;
    const barbRep = netherData?.barbarians_reputation || 0;
    reputation = Math.max(mageRep, barbRep);
}

function processInventory(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    for (let i = 0; i < items.func_74745_c(); i++) {
        let item = items.func_150305_b(i);
        if (!item) continue;

        let tag = new NBTTagCompound(item).getCompoundTag("tag");
        if (tag.hasNoTags()) continue;

        let extraAttributes = tag.getCompoundTag("ExtraAttributes");
        let attributes = extraAttributes.getCompoundTag("attributes").toObject();
        let id = extraAttributes.getString("id");
        let display = tag.getCompoundTag("display");
        let lore = display.toObject()["Lore"] || [];
        let searchLore = lore.join(' ');
        let name = display.getString("Name");
        let displayLore = `${name}\n${lore.join('\n')}`;
        let reforge = extraAttributes.getString("modifier");
        let enchants = extraAttributes.getCompoundTag("enchantments").toObject();
        let gemstone = extraAttributes.getCompoundTag("gems")?.getString("COMBAT_0") || extraAttributes.getCompoundTag("gems")?.getString("COMBAT_1") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_0")?.getString("quality") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_1")?.getString("quality");

        checkItem(id, searchLore, displayLore, attributes, name, reforge, enchants, gemstone);
    }
}

function processArmor(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    for (let i = 0; i < items.func_74745_c(); i++) {
        let item = items.func_150305_b(i);
        if (!item) continue;

        let tag = new NBTTagCompound(item).getCompoundTag("tag");
        if (tag.hasNoTags()) continue;

        let extraAttributes = tag.getCompoundTag("ExtraAttributes");
        let attributes = extraAttributes.getCompoundTag("attributes").toObject();
        let id = extraAttributes.getString("id");
        let display = tag.getCompoundTag("display");
        let lore = display.toObject()["Lore"] || [];
        let name = display.getString("Name");
        let displayLore = `${name}\n${lore.join('\n')}`;
        let reforge = extraAttributes.getString("modifier");
        let enchants = extraAttributes.getCompoundTag("enchantments").toObject();
        let gemstone = extraAttributes.getCompoundTag("gems")?.getString("COMBAT_0") || extraAttributes.getCompoundTag("gems")?.getString("COMBAT_1") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_0")?.getString("quality") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_1")?.getString("quality");

        checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone);
    }
}

function processWardrobe(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    for (let i = 0; i < items.func_74745_c(); i++) {
        let item = items.func_150305_b(i);
        if (!item) continue;

        let tag = new NBTTagCompound(item).getCompoundTag("tag");
        if (tag.hasNoTags()) continue;

        let extraAttributes = tag.getCompoundTag("ExtraAttributes");
        let attributes = extraAttributes.getCompoundTag("attributes").toObject();
        let id = extraAttributes.getString("id");
        let display = tag.getCompoundTag("display");
        let lore = display.toObject()["Lore"] || [];
        let name = display.getString("Name");
        let displayLore = `${name}\n${lore.join('\n')}`;
        let reforge = extraAttributes.getString("modifier");
        let enchants = extraAttributes.getCompoundTag("enchantments").toObject();
        let gemstone = extraAttributes.getCompoundTag("gems")?.getString("COMBAT_0") || extraAttributes.getCompoundTag("gems")?.getString("COMBAT_1") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_0")?.getString("quality") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_1")?.getString("quality");

        checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone);
    }
}

function processEquipment(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    for (let i = 0; i < items.func_74745_c(); i++) {
        let item = items.func_150305_b(i);
        if (!item) continue;

        let tag = new NBTTagCompound(item).getCompoundTag("tag");
        if (tag.hasNoTags()) continue;

        let extraAttributes = tag.getCompoundTag("ExtraAttributes");
        let attributes = extraAttributes.getCompoundTag("attributes").toObject();
        let id = extraAttributes.getString("id");
        let display = tag.getCompoundTag("display");
        let name = display.getString("Name");

        checkEquipment(id, attributes, name);
    }
}

function checkItem(id, searchLore, displayLore, attributes, name, reforge, enchants, gemstone) {
    if (ITEM_IDS.WITHER_BLADES.has(id)) {
        if (searchLore.includes("Wither Impact")) {
            hyperion = '&2✔';
            hyperionLore = displayLore;
        }
    } else if (id === ITEM_IDS.TERMINATOR) {
        if (searchLore.includes("Duplex")) {
            duplex = '&2✔';
            duplexLore = displayLore;
        } else if (searchLore.includes("Fatal Tempo")) {
            fatalTempo = '&2✔';
            fatalTempoLore = displayLore;
        }
        extraTerminator = '&2✔';
    } else if (id === ITEM_IDS.RAGNAROCK_AXE) {
        ragnarockAxe = '&2✔';
        ragnarockAxeLore = displayLore;
    } else if ([ITEM_IDS.OVERFLUX_POWER_ORB, ITEM_IDS.PLASMAFLUX_POWER_ORB, ITEM_IDS.SOS_FLARE].includes(id)) {
        extraDeployable = name;
    } else if(id === ITEM_IDS.FIRE_VEIL_WAND){
        extraFireveil = name;
    }else if(id == ITEM_IDS.TITANIUM_DRILL_4 || id == ITEM_IDS.DIVAN_DRILL){
        extraDrill = name;
    } else {
        checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone);
    }
}

function checkEquipment(id, attributes, name) {
    if (["NECKLACE", "CLOAK", "BELT", "GAUNTLET", "GLOVES"].some(equip => id.includes(equip))) {
        checkLLMP(attributes, name);
    }
}

function checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone) {
    if (id === ITEM_IDS.WARDEN_HELMET) {
        checkEnchants(enchants);

        wardenHelmet = name;
        wardenHelmetLore = displayLore;
    } else if ([ITEM_IDS.REAPER_CHESTPLATE, ITEM_IDS.REAPER_LEGGINGS, ITEM_IDS.REAPER_BOOTS].includes(id)) {
        reaperPieces++;
    } else if (id.includes("TERROR")) {
        checkTerror(attributes, id, displayLore, name, reforge, enchants, gemstone);
    }
}

function checkLLMP(attributes, name) {
    if (attributes) {
        let ll = attributes.lifeline;
        if (ll) {
            const ll_lvl = parseInt(ll);
            lifeline += ll_lvl;
            lifelineLore += `${name} &f+${ll_lvl}\n`;

            let mp = attributes.mana_pool;
            if (mp) {
                const mp_lvl = parseInt(mp);
                manaPool += mp_lvl;
                manaPoolLore += `${name} &f+${mp_lvl}\n`;
            }
        }
    }
}

function checkEnchants(enchants) {
    if (enchants) {
        const legion = enchants.ultimate_legion;
        if (legion) {
            extraLegionEnchant += parseInt(legion);
        }

        const strongMana = enchants.strong_mana;
        if (strongMana) {
            extraStrongMana += parseInt(strongMana);
        }

        const ferociousMana = enchants.ferocious_mana;
        if (ferociousMana) {
            extraFerociousMana += parseInt(ferociousMana);
        }
    }
}

function checkTerror(attributes, id, displayLore, name, reforge, enchants, gemstone) {
    if (reforge && reforge.includes("ancient")) {
        if (id.includes("CHESTPLATE") && terrorChestplate.includes(`&4No Terror Chestplate`)) {
            checkLLMP(attributes, name);
            checkEnchants(enchants);

            terrorChestplate = name;
            terrorChestplateLore = displayLore;

            terrorChestplatePrefix = getColorData("gemstonechecker", gemstone);
        } else if (id.includes("LEGGINGS") && terrorLeggings.includes(`&4No Terror Leggings`)) {
            checkLLMP(attributes, name);
            checkEnchants(enchants);

            terrorLeggings = name;
            terrorLeggingsLore = displayLore;

            terrorLeggingsPrefix = getColorData("gemstonechecker", gemstone);
        } else if (id.includes("BOOTS") && terrorBoots.includes(`&4No Terror Boots`)) {
            checkLLMP(attributes, name);
            checkEnchants(enchants);

            terrorBoots = name;
            terrorBootsLore = displayLore;

            terrorBootsPrefix = getColorData("gemstonechecker", gemstone);
        }
    }
}

function processRuns(netherData) {
    const completedTiers = netherData?.kuudra_completed_tiers;

    if (completedTiers) {
        basicComps = completedTiers?.none || basicComps;
        hotComps = completedTiers?.hot || hotComps;
        burningComps = completedTiers?.burning || burningComps;
        fieryComps = completedTiers?.fiery || fieryComps;
        infernalComps = completedTiers?.infernal || infernalComps;

        totalComps = basicComps + hotComps + burningComps + fieryComps + infernalComps;
    }
}

function processMagicalPower(memberData) {
    const accessoryBag = memberData.accessory_bag_storage;
    if (accessoryBag) {
        magicalPower = accessoryBag.highest_magical_power || 0;
        selectedPower = accessoryBag.selected_power || '&fNONE';

        const checkTuning = accessoryBag.tuning?.slot_0 || 0;
        tuningPoints = getColorData("gettunings", checkTuning);
    }
}

function processGoldenDragon(pets) {
    if (!pets) return;
    const gdrags = [];

    pets.forEach(pet => {
        if (pet.type === "GOLDEN_DRAGON") {
            let petDetails = {
                exp: pet.exp,
                petitem: pet.heldItem ? `&8* &aPet item: &f${pet.heldItem}\n` : `&aPet item: &fNONE\n`
            };

            if (pet.exp > 210255385) {
                petDetails.name = `&7[Lvl 200] &6Golden Dragon`;
            } else {
                let gdragLvl = (((pet.exp - 25353230) / 1886700) + 1).toFixed(0);
                petDetails.name = `&7[Lvl ${gdragLvl}] &6Golden Dragon`;
            }

            gdrags.push(petDetails);
        }
    });

    if (gdrags.length !== 0) {
        gdrags.sort((a, b) => b.exp - a.exp);
        goldenDragon = gdrags[0].name;
        gdrags.forEach(gdrag => {
            goldenDragonLore += `${gdrag.name}\n${gdrag.petitem}`;
        });
    }
}

function finalizeData(currentProfile, uuid) {
    if (reaperPieces === 3) {
        extraReaper = '&2✔';
    }

    extraManaEnchantTotal = extraStrongMana + extraFerociousMana;
    oneBilBank = currentProfile.banking?.balance > 950000000 ? "&a" : "&c";
    goldenDragonLore += `&8* &aBank: &f${fixNumber(currentProfile?.banking?.balance) || "&cAPI OFF"}\n`;
    const gold = fixNumber(currentProfile?.members?.[uuid]?.collection?.GOLD_INGOT) || "&cAPI OFF";
    goldenDragonLore += `&8* &aGold: &f${gold}`;
}

function apiOff() {
    hyperion = hyperionLore = duplex = duplexLore = fatalTempo = fatalTempoLore = ragnarockAxe = ragnarockAxeLore = extraReaper = extraTerminator = extraDeployable = extraFireveil = extraDrill = `&cAPI OFF`;
    wardenHelmet = wardenHelmetLore = terrorChestplate = terrorChestplateLore = terrorChestplatePrefix = terrorLeggings = terrorLeggingsLore = terrorLeggingsPrefix = terrorBoots = terrorBootsLore = terrorBootsPrefix = `&cAPI OFF`;
}

function displayMessage(name) {
    const playerMessage = new Message(
        new TextComponent(`&2&m-----&f[- &2${name} &f-]&2&m-----`)
            .setClick("run_command", `/pv ${name}`)
    );

    const lifelineMessage = new Message(
        new TextComponent(`&aLifeline: &f${lifeline} (+&c${(lifeline * 2.5).toFixed(1)}%&f)`)
            .setHoverValue(lifelineLore)
            .setClick("run_command", `/ct copy Lifeline: ${lifeline}`)
    );

    const manaPoolMessage = new Message(
        new TextComponent(`&aMana Pool: &f${manaPool} (+&b${(manaPool * 20).toFixed(1)} intel&f)`)
            .setHoverValue(manaPoolLore)
            .setClick("run_command", `/ct copy Mana pool: ${manaPool}`)
    );

    const runsLore = `&2&lCompletions: &r\n\n&6Basic: &f${basicComps}\n&6Hot: &f${hotComps}\n&6Burning: &f${burningComps}\n&6Fiery: &f${fieryComps}\n&6Infernal: &f${infernalComps}`;
    const runsMessage = new Message(
        new TextComponent(`&aRuns: &f${infernalComps} (${totalComps})`)
            .setHoverValue(runsLore)
            .setClick("run_command", `/ct copy Infernal runs: ${infernalComps}`)
    );

    const mpLore = `&a&lMP Breakdown:\n\n&aSelected Power: &f${selectedPower}\n${tuningPoints}`;
    const mpMessage = new Message(
        new TextComponent(`&aMagical Power: &f${magicalPower}`)
            .setHoverValue(mpLore)
            .setClick("run_command", `/ct copy Magical Power: ${magicalPower}`)
    );

    const hyperionMessage = new Message(
        new TextComponent(`&aHyperion: ${hyperion}`)
            .setHoverValue(hyperionLore)
    );

    const duplexMessage = new Message(
        new TextComponent(`&aDuplex: ${duplex}`)
            .setHoverValue(duplexLore)
    );

    const fatalTempoMessage = new Message(
        new TextComponent(`&aFatal Tempo: ${fatalTempo}`)
            .setHoverValue(fatalTempoLore)
    );

    const ragnarockAxeMessage = new Message(
        new TextComponent(`&aRagnarock Axe: ${ragnarockAxe}`)
            .setHoverValue(ragnarockAxeLore)
    );

    const extraMessage = new Message(
        new TextComponent(`&aExtra &7[HOVER]`)
            .setHoverValue(`&a&lExtra items:\n&8* &aReaper: ${extraReaper}\n&8* &aTerminator: ${extraTerminator}\n&8* &aDeployable: ${extraDeployable}\n&8* &aFire veil: ${extraFireveil}\n&8* &aDrill: ${extraDrill}\n&8* &aLegion: &b${extraLegionEnchant} (+${(extraLegionEnchant * 0.07).toFixed(2)}% stats)\n&8* &aRep: &b${reputation}\n\n&a&lMana Enchants &b(${extraManaEnchantTotal})\n&8* &aStrong: &b${extraStrongMana} (${(extraStrongMana * 0.1).toFixed(2)}% of Mana)\n&8* &aFero: &b${extraFerociousMana} (${(extraFerociousMana * 0.1).toFixed(2)}% of Mana)`)
    );

    const wardenHelmetMessage = new Message(
        new TextComponent(`&8* ${wardenHelmet}`)
            .setHoverValue(wardenHelmetLore)
    );

    const terrorChestplateMessage = new Message(
        new TextComponent(`${terrorChestplatePrefix} ${terrorChestplate}`)
            .setHoverValue(terrorChestplateLore)
    );

    const terrorLeggingsMessage = new Message(
        new TextComponent(`${terrorLeggingsPrefix} ${terrorLeggings}`)
            .setHoverValue(terrorLeggingsLore)
    );

    const terrorBootsMessage = new Message(
        new TextComponent(`${terrorBootsPrefix} ${terrorBoots}`)
            .setHoverValue(terrorBootsLore)
    );

    const goldenDragonMessage = new Message(
        new TextComponent(`${oneBilBank}* ${goldenDragon}`)
            .setHoverValue(goldenDragonLore)
    );

    const kickMessage = new Message(
        new TextComponent(`&cRemove &4${name} &cfrom the party`)
            .setClick("run_command", `/p kick ${name}`)
    );

    ChatLib.chat(playerMessage);
    ChatLib.chat(lifelineMessage);
    ChatLib.chat(manaPoolMessage);
    ChatLib.chat(runsMessage);
    ChatLib.chat(mpMessage);
    ChatLib.chat(`&r`);
    ChatLib.chat(hyperionMessage);
    ChatLib.chat(duplexMessage);
    ChatLib.chat(fatalTempoMessage);
    ChatLib.chat(ragnarockAxeMessage);
    ChatLib.chat(extraMessage);
    ChatLib.chat(`&r&r`);
    ChatLib.chat(wardenHelmetMessage);
    ChatLib.chat(terrorChestplateMessage);
    ChatLib.chat(terrorLeggingsMessage);
    ChatLib.chat(terrorBootsMessage);
    ChatLib.chat(goldenDragonMessage);
    ChatLib.chat("&2&m----------------------------&r");
    ChatLib.chat(kickMessage);
}

export default showKuudraInfo;
