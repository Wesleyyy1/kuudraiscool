import Settings from "./settings/config.js";
import axios from "axios";
import {
    decompress,
    fixNumber,
    getColorData,
    isKeyValid,
    getRoles,
    errorHandler,
    showInvalidReasonMsg,
    showMissingRolesMsg,
    capitalizeEachWord,
    kicPrefix
} from "./utils/generalUtils.js";
import { getLevel } from "./utils/petLevelUtils.js";
import Party from "./utils/Party.js";

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
    DIVAN_DRILL: "DIVAN_DRILL",
    BLAZETEKK_HAM_RADIO: "BLAZETEKK_HAM_RADIO",
    INFERNAL_TERROR_HELMET: "INFERNAL_TERROR_HELMET"
};

const equipmentTypes = [
    { type: "NECKLACE", key: "necklace" },
    { type: "CLOAK", key: "cloak" },
    { type: ["BELT", "GAUNTLET"], key: "belt" },
    { type: ["GLOVES", "BRACELET"], key: "bracelet" }
];

let comps = {};

let mp = {};

let armor = {
    helmet: {},
    chestplate: {},
    leggings: {},
    boots: {}
};

let equipment = {
    necklace: {},
    cloak: {},
    belt: {},
    bracelet: {}
};

let items = {
    ragnarock: {},
    drill: {},
    deployable: {}
}

let extraHamRadio, extraFireveil, reaperPieces, hyperion, hyperionLore, duplex, duplexLore, extraReaper, extraTerminator, reputation, goldenDragon, goldenDragonLore, oneBilBank;

function setDefaults() {
    reaperPieces = reputation = 0;
    extraHamRadio = extraFireveil = hyperion = hyperionLore = duplex = duplexLore = extraReaper = extraTerminator = `&4X`;
    goldenDragon = "&4No Golden Dragon";

    goldenDragonLore = `&r`;
    oneBilBank = `&c`;

    comps = {
        basic: 0,
        hot: 0,
        burning: 0,
        fiery: 0,
        infernal: 0,
        total: 0,
        score: 0
    };

    mp = {
        magicalPower: 0,
        selectedPower: "",
        tuningPoints: 0
    };

    armor = {
        helmet: {
            name: "&4No helmet",
            lore: "&4No helmet",
            prefix: "&8*",
            priority: 10,
            mp: 0,
            ll: 0,
            legion: 0,
            strong: 0,
            fero: 0
        },
    
        chestplate: {
            name: "&4No chestplate",
            lore: "&4No chestplate",
            prefix: "&8*",
            priority: 10,
            mp: 0,
            ll: 0,
            legion: 0,
            strong: 0,
            fero: 0
        },
    
        leggings: {
            name: "&4No leggings",
            lore: "&4No leggings",
            prefix: "&8*",
            priority: 10,
            mp: 0,
            ll: 0,
            legion: 0,
            strong: 0,
            fero: 0
        },
        
        boots: {
            name: "&4No boots",
            lore: "&4No boots",
            prefix: "&8*",
            priority: 10,
            mp: 0,
            ll: 0,
            legion: 0,
            strong: 0,
            fero: 0
        }
    };

    equipment = {
        necklace: {
            name: "&4No necklace",
            mp: 0,
            ll: 0
        },
        cloak: {
            name: "&4No cloak",
            mp: 0,
            ll: 0
        },
        belt: {
            name: "&4No belt",
            mp: 0,
            ll: 0
        },
        bracelet: {
            name: "&4No bracelet",
            mp: 0,
            ll: 0
        }
    };

    items = {
        ragnarock: {
            name: "&4X",
            lore: "&4X",
            priority: 10,
            chimera: 0
        },
        drill: {
            name: "&4X",
            lore: "&4X",
            priority: 10
        },
        deployable: {
            name: "&4X",
            priority: 10
        }
    }
}

function showKuudraInfo(playername, manually) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    setDefaults();

    axios.get(`https://api.sm0kez.com/hypixel/profile/${playername}/selected`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        }
    })
        .then(response => {
            const data = response.data;

            if (data.success) {
                processKuudraData(data, manually);
            } else {
                ChatLib.chat(`${kicPrefix} &cPlayer not found!`);
            }
        })
        .catch(error => {
            if (error.isAxiosError && error.code != 500) {
                ChatLib.chat(`${kicPrefix} &c${error.response.data}`);
            } else {
                ChatLib.chat(`${kicPrefix} &cSomething went wrong while gathering ${playername}'s data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting profile data", error.message, "kuudraInfo.js", `User: ${playername} | Manually: ${manually}`);
            }
        });
}

function processKuudraData(response, manually) {
    const { name, uuid, members } = response;
    const memberData = members[uuid];
    const netherData = memberData.nether_island_player_data;
    const inventory = memberData.inventory;

    processMagicalPower(memberData, netherData);
    processRuns(netherData);
    processReputation(netherData);
    processGoldenDragon(memberData.pets_data.pets);

    if (inventory) {
        processInventory(inventory.inv_contents?.data);
        processArmor(inventory.inv_armor?.data);
        processWardrobe(inventory.wardrobe_contents?.data);
        processEquipment(inventory.equipment_contents?.data);

        if (manually) {
            processEnderchest(inventory.ender_chest_contents?.data);
            processBackpacks(inventory.backpack_contents);
        }

        finalizeData(response, uuid);
    } else {
        apiOff();
    }

    displayMessage(name, manually);
}

function processReputation(netherData) {
    const mageRep = netherData?.mages_reputation || 0;
    const barbRep = netherData?.barbarians_reputation || 0;
    reputation = Math.max(mageRep, barbRep);
}

function processItems(items) {
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
        let searchLore = lore.join(" ");
        let name = display.getString("Name");
        let displayLore = `${name}\n${lore.join("\n")}`;
        let reforge = extraAttributes.getString("modifier");
        let enchants = extraAttributes.getCompoundTag("enchantments").toObject();
        let gemstone = extraAttributes.getCompoundTag("gems")?.getString("COMBAT_0") || extraAttributes.getCompoundTag("gems")?.getString("COMBAT_1") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_0")?.getString("quality") || extraAttributes.getCompoundTag("gems")?.getTag("COMBAT_1")?.getString("quality");

        checkItem(id, searchLore, displayLore, attributes, name, reforge, enchants, gemstone);
        checkEquipment(id, attributes, name);
    }
}

function processInventory(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    processItems(items);
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
        let displayLore = `${name}\n${lore.join("\n")}`;
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
        let displayLore = `${name}\n${lore.join("\n")}`;
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

function processEnderchest(data) {
    const items = decompress(data);

    if (!items) {
        apiOff();
        return;
    }

    processItems(items);
}

function processBackpacks(contents) {
    if (!contents) return;

    Object.keys(contents).forEach((data) => {
        const items = decompress(contents[data]?.data);

        if (!items) {
            apiOff();
            return;
        }

        processItems(items);
    })
}

function checkItem(id, searchLore, displayLore, attributes, name, reforge, enchants, gemstone) {
    if (ITEM_IDS.WITHER_BLADES.has(id)) {
        if (searchLore.includes("Wither Impact")) {
            hyperion = "&2✔";
            hyperionLore = displayLore;
        }
    } else if (id === ITEM_IDS.TERMINATOR) {
        if (searchLore.includes("Duplex")) {
            duplex = "&2✔";
            duplexLore = displayLore;
        }
        extraTerminator = "&2✔";
    } else if (id === ITEM_IDS.RAGNAROCK_AXE) {
        checkRagnarockAxe(displayLore, reforge, enchants, gemstone);
    } else if ([ITEM_IDS.OVERFLUX_POWER_ORB, ITEM_IDS.PLASMAFLUX_POWER_ORB, ITEM_IDS.SOS_FLARE].includes(id)) {
        checkDeployable(id, name);
    } else if (id === ITEM_IDS.FIRE_VEIL_WAND) {
        extraFireveil = name;
    } else if (id == ITEM_IDS.TITANIUM_DRILL_4 || id == ITEM_IDS.DIVAN_DRILL) {
        checkDrill(id, displayLore);
    } else if (id == ITEM_IDS.BLAZETEKK_HAM_RADIO) {
        extraHamRadio = name;
    } else {
        checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone);
    }
}

function checkRagnarockAxe(displayLore, reforge, enchants, gemstone) {
    const currentItem = items.ragnarock;
    
    const chimeraLevel = enchants && enchants.ultimate_chimera ? parseInt(enchants.ultimate_chimera) : 0;
    if (chimeraLevel > currentItem.chimera) {
        updateRagnarockAxe(displayLore, 1, chimeraLevel);
        return;
    } else if (chimeraLevel === currentItem.chimera) {
        if (reforge && reforge.includes("withered")) {
            if (currentItem.priority > 2) {
                updateRagnarockAxe(displayLore, 2, chimeraLevel);
                return;
            }
        } else if (gemstone && gemstone.length > 0) {
            if (currentItem.priority > 3) {
                updateRagnarockAxe(displayLore, 3, chimeraLevel);
                return;
            }
        } else {
            if (currentItem.priority > 4) {
                updateRagnarockAxe(displayLore, 4, chimeraLevel);
                return;
            }
        }
    }
}

function updateRagnarockAxe(displayLore, priority, chimeraLevel) {
    items.ragnarock.name = "&2✔";
    items.ragnarock.lore = displayLore;
    items.ragnarock.priority = priority;
    items.ragnarock.chimera = chimeraLevel;
}

function checkDeployable(id, name) {
    const currentPriority = items.deployable.priority;
    const newPriority = getDeployablePriority(id);

    if (newPriority < currentPriority) {
        items.deployable.name = name;
        items.deployable.priority = newPriority;
    }
}

function getDeployablePriority(id) {
    switch (id) {
        case ITEM_IDS.SOS_FLARE:
            return 1;
        case ITEM_IDS.PLASMAFLUX_POWER_ORB:
            return 2;
        case ITEM_IDS.OVERFLUX_POWER_ORB:
            return 3;
        default:
            return 99;
    }
}

function checkDrill(id, displayLore) {
    const currentPriority = items.drill.priority;
    const newPriority = getDrillPriority(id);

    if (newPriority < currentPriority) {
        items.drill.name = "&2✔";
        items.drill.lore = displayLore;
        items.drill.priority = newPriority;
    }
}

function getDrillPriority(id) {
    switch (id) {
        case ITEM_IDS.DIVAN_DRILL:
            return 1;
        case ITEM_IDS.TITANIUM_DRILL_4:
            return 2;
        default:
            return 99;
    }
}

function checkEquipment(id, attributes, name) {
    if (attributes) {
        equipmentTypes.forEach(({ type, key }) => {
            if (Array.isArray(type)) {
                if (type.some(t => id.includes(t))) {
                    checkAndUpdateEquipment(key, attributes, name);
                }
            } else {
                if (id.includes(type)) {
                    checkAndUpdateEquipment(key, attributes, name);
                }
            }
        });
    }
}

function checkAndUpdateEquipment(key, attributes, name) {
    let ll = attributes.lifeline;
    if (ll) {
        let ll_lvl = parseInt(ll);
        if (equipment[key].ll < ll_lvl) {
            equipment[key].name = name;
            updateLLMP(attributes, equipment[key]);
        }
    }
}

function checkArmor(id, displayLore, attributes, name, reforge, enchants, gemstone) {
    if (id === ITEM_IDS.WARDEN_HELMET) {
        if (reforge === "ancient" && enchants && enchants.ultimate_legion) {
            updateHelmet(name, displayLore, attributes, enchants, gemstone, 1);
        } else if (armor.helmet.priority > 3) {
            updateHelmet(name, displayLore, attributes, enchants, gemstone, 3);
        }
    } else if (id === ITEM_IDS.INFERNAL_TERROR_HELMET && armor.helmet.priority > 2) {
        updateHelmet(name, displayLore, attributes, enchants, gemstone, 2);
    } else if ([ITEM_IDS.REAPER_CHESTPLATE, ITEM_IDS.REAPER_LEGGINGS, ITEM_IDS.REAPER_BOOTS].includes(id)) {
        reaperPieces++;
    } else if (id.includes("TERROR")) {
        checkTerror(attributes, id, displayLore, name, reforge, enchants, gemstone);
    }
}

function updateHelmet(name, displayLore, attributes, enchants, gemstone, priority) {
    if (priority < armor.helmet.priority) {
        armor.helmet.name = name;
        armor.helmet.lore = displayLore;
        armor.helmet.priority = priority;
        armor.helmet.prefix = getColorData("gemstonechecker", gemstone);
        updateLLMP(attributes, armor.helmet);
        updateEnchants(enchants, armor.helmet);
    }
}

function updateLLMP(attributes, item) {
    if (attributes) {
        let ll = attributes.lifeline;
        if (ll) {
            item.ll = parseInt(ll);

            let mp = attributes.mana_pool;
            if (mp) {
                item.mp = parseInt(mp);
            }
        }
    }
}

function updateEnchants(enchants, item) {
    if (enchants) {
        const legion = enchants.ultimate_legion;
        if (legion) {
            item.legion = parseInt(legion);
        }

        const strongMana = enchants.strong_mana;
        if (strongMana) {
            item.strong = parseInt(strongMana);
        }

        const ferociousMana = enchants.ferocious_mana;
        if (ferociousMana) {
            item.fero = parseInt(ferociousMana);
        }
    }
}

function checkTerror(attributes, id, displayLore, name, reforge, enchants, gemstone) {
    let itemSlot;

    if (id.includes("CHESTPLATE")) {
        itemSlot = "chestplate";
    } else if (id.includes("LEGGINGS")) {
        itemSlot = "leggings";
    } else if (id.includes("BOOTS")) {
        itemSlot = "boots";
    } else {
        return;
    }

    let currentItem = armor[itemSlot];
    let currentPriority = currentItem.priority;
    let newItemPriority = getPriority(id);

    if (newItemPriority < currentPriority) {
        updateItem(itemSlot, name, displayLore, attributes, enchants, gemstone, newItemPriority);
    } else if (newItemPriority === currentPriority) {
        if (shouldReplace(currentItem, attributes, enchants, reforge)) {
            updateItem(itemSlot, name, displayLore, attributes, enchants, gemstone, newItemPriority);
        }
    }
}

function getPriority(id) {
    if (id.includes("INFERNAL")) return 1;
    if (id.includes("FIERY")) return 2;
    if (id.includes("BURNING")) return 3;
    if (id.includes("HOT")) return 4;
    if (id.includes("CHESTPLATE") || id.includes("LEGGINGS") || id.includes("BOOTS")) return 5;
    return 99;
}

function shouldReplace(currentItem, attributes, enchants, reforge) {
    let newLL = attributes.lifeline ? parseInt(attributes.lifeline) : 0;
    let currentLL = currentItem.ll || 0;

    if (currentLL > newLL) return false;

    if (newLL > currentLL) return true;
    if (newLL === currentLL) {
        let newMP = attributes.mana_pool ? parseInt(attributes.mana_pool) : 0;
        let currentMP = currentItem.mp || 0;
        if (newMP > currentMP) return true;
    }

    let newLegion = enchants.ultimate_legion ? parseInt(enchants.ultimate_legion) : 0;
    let currentLegion = currentItem.legion || 0;

    if (newLegion > currentLegion) return true;

    return (reforge && !currentItem.prefix.includes(reforge));
}

function updateItem(slot, name, displayLore, attributes, enchants, gemstone, priority) {
    let item = armor[slot];

    item.name = name;
    item.lore = displayLore;
    item.prefix = getColorData("gemstonechecker", gemstone);
    item.priority = priority;
    
    updateLLMP(attributes, item);
    updateEnchants(enchants, item);
}

function processRuns(netherData) {
    const completedTiers = netherData?.kuudra_completed_tiers;

    if (completedTiers) {
        comps.basic = completedTiers?.none || 0;
        comps.hot = completedTiers?.hot || 0;
        comps.burning = completedTiers?.burning || 0;
        comps.fiery = completedTiers?.fiery || 0;
        comps.infernal = completedTiers?.infernal || 0;
        comps.total = comps.basic + comps.hot + comps.burning + comps.fiery + comps.infernal;
        comps.score = comps.basic * 0.5 + comps.hot + comps.burning * 2 + comps.fiery * 4 + comps.infernal * 8
    }
}

function processMagicalPower(memberData, netherData) {
    let maxMp = 0;
    let totalMp = 0;

    const accessoryBag = memberData.accessory_bag_storage;
    if (accessoryBag) {
        maxMp = accessoryBag.highest_magical_power || 0;
        const checkTuning = accessoryBag.tuning?.slot_0 || 0;

        mp.selectedPower = capitalizeEachWord(accessoryBag.selected_power.replaceAll("_", " ")) || "&fNONE";
        mp.tuningPoints = getColorData("gettunings", checkTuning);
    } else {
        mp.selectedPower = "&4API OFF";
        mp.tuningPoints = "&4API OFF";
    }

    const talismanBag = memberData.inventory?.bag_contents?.talisman_bag;
    const hasConsumedPrism = memberData.rift?.access?.consumed_prism;
    let hasAbicase = false;
    const talismanIds = new Set();

    if (talismanBag) {
        const talismans = decompress(talismanBag.data);
        if (!talismans) return;

        for (let i = 0; i < talismans.func_74745_c(); i++) {
            let talisman = talismans.func_150305_b(i);
            if (!talisman) continue;

            let tag = new NBTTagCompound(talisman).getCompoundTag("tag");
            if (tag.hasNoTags()) continue;

            let id = tag.getCompoundTag("ExtraAttributes").getString("id");
            if (talismanIds.has(id)) continue;
            talismanIds.add(id);

            let display = tag.getCompoundTag("display");
            let searchLore = (display.toObject()["Lore"] || []).join(" ").removeFormatting();

            if (id === "ABICASE") {
                hasAbicase = true;
            }

            if (searchLore.includes("UNCOMMON")) {
                totalMp += 5;
            } else if (searchLore.includes("COMMON")) {
                totalMp += 3;
            } else if (searchLore.includes("RARE")) {
                totalMp += 8;
            } else if (searchLore.includes("EPIC")) {
                totalMp += 12;
            } else if (searchLore.includes("LEGENDARY")) {
                totalMp += (id === "HEGEMONY_ARTIFACT") ? 32 : 16;
            } else if (searchLore.includes("MYTHIC")) {
                totalMp += (id === "HEGEMONY_ARTIFACT") ? 44 : 22;
            } else if (searchLore.includes("VERY SPECIAL")) {
                totalMp += 5;
            } else if (searchLore.includes("SPECIAL")) {
                totalMp += 3;
            }
        }

        if (hasConsumedPrism) {
            totalMp += 11;
        }

        if (hasAbicase) {
            const activeContacts = netherData.abiphone.active_contacts;
            if (activeContacts) {
                totalMp += Math.floor(activeContacts.length / 2);
            }
        }

        mp.magicalPower = totalMp > maxMp ? maxMp : totalMp;
    } else {
        mp.magicalPower = maxMp;
    }
}

function processGoldenDragon(pets) {
    if (!pets) return;
    const gdrags = [];

    pets.forEach(pet => {
        if (pet.type === "GOLDEN_DRAGON") {
            let petDetails = {
                exp: pet.exp,
                petitem: pet.heldItem ? `&8* &aPet item: &f${capitalizeEachWord(pet.heldItem.replaceAll("PET_ITEM_", "").replaceAll("_", " "))}\n` : `&aPet item: &fNONE\n`
            };

            petDetails.name = `&7[Lvl ${getLevel(pet.exp, null, true)}] &6Golden Dragon`;

            gdrags.push(petDetails);
        };
    });

    if (gdrags.length !== 0) {
        gdrags.sort((a, b) => b.exp - a.exp);
        goldenDragon = gdrags[0].name;
        gdrags.forEach(gdrag => {
            goldenDragonLore += `${gdrag.name}\n${gdrag.petitem}\n`;
        });
    }
}

function finalizeData(currentProfile, uuid) {
    if (reaperPieces === 3) {
        extraReaper = "&2✔";
    }

    const bankBalance = currentProfile.banking?.balance;
    
    if (bankBalance) {
        oneBilBank = bankBalance ? bankBalance > 950000000 ? "&a" : "&c" : "&c";
        goldenDragonLore += `&8* &aBank: &f${fixNumber(bankBalance) || "&cAPI OFF"}\n`;
    } else {
        oneBilBank = "&c";
        goldenDragonLore += `&8* &aBank: &cAPI OFF\n`;
    }
    
    goldenDragonLore += `&8* &aPurse: &f${fixNumber(currentProfile.members[uuid].currencies?.coin_purse) || 0}\n`;
    const gold = fixNumber(currentProfile?.members?.[uuid]?.collection?.GOLD_INGOT) || "&cAPI OFF";
    goldenDragonLore += `&8* &aGold: &f${gold}`;
}

function apiOff() {
    hyperion = hyperionLore = duplex = duplexLore = ragnarockAxe = ragnarockAxeLore = extraReaper = extraTerminator = extraDeployable = extraFireveil = drill = drillLore = extraHamRadio = `&cAPI OFF`;
    
    armor.helmet.name = armor.helmet.lore = "&cAPI OFF";
    armor.chestplate.name = armor.chestplate.lore = "&cAPI OFF";
    armor.leggings.name = armor.leggings.lore = "&cAPI OFF";
    armor.boots.name = armor.boots.lore = "&cAPI OFF";
}

function generateLLMPLore(type) {
    let total = 0;
    let lore = `&a&l${type == "ll" ? "Lifeline" : "Mana Pool"} Breakdown:\n\n`;

    const items = { ...equipment, ...armor };

    Object.keys(items).forEach(key => {
        const item = items[key];
        const value = item[type];

        if (value && value > 0) {
            total += value;
            lore += `${item.name} &f+${value}\n`;
        }
    });

    return { total, lore };
}

function displayMessage(name, manually) {
    const playerMessage = new TextComponent(`&2&m-----&f[- &2${name} &7[Lvl ${(comps.score / 100) | 0}] &f-]&2&m-----\n`)
        .setHoverValue(`&a&lKuudra score: &f${comps.score.toFixed()}`)
        .setClick("run_command", `/pv ${name}`);

    const lifeline = generateLLMPLore("ll");
    const lifelineMessage = new TextComponent(`&aLifeline: &f${lifeline.total} (+&c${(lifeline.total * 2.5).toFixed(1)}%&f)\n`)
        .setHoverValue(lifeline.lore)
        .setClick("run_command", `/ct copy Lifeline: ${lifeline.total}`);

    const manaPool = generateLLMPLore("mp");
    const manaPoolMessage = new TextComponent(`&aMana Pool: &f${manaPool.total} (+&b${(manaPool.total * 20).toFixed(1)} intel&f)\n`)
        .setHoverValue(manaPool.lore)
        .setClick("run_command", `/ct copy Mana pool: ${manaPool.total}`);

    const runsLore = `&2&lCompletions: &r\n\n&6Basic: &f${comps.basic}\n&6Hot: &f${comps.hot}\n&6Burning: &f${comps.burning}\n&6Fiery: &f${comps.fiery}\n&6Infernal: &f${comps.infernal}`;
    const runsMessage = new TextComponent(`&aRuns: &f${comps.infernal} (${comps.total})\n`)
        .setHoverValue(runsLore)
        .setClick("run_command", `/ct copy Infernal runs: ${comps.infernal}`);

    const mpLore = `&a&lMP Breakdown:\n\n&aSelected Power: &f&l${mp.selectedPower}\n&aTuning: ${mp.tuningPoints}`;
    const mpMessage = new TextComponent(`&aMagical Power: &f${mp.magicalPower}\n`)
        .setHoverValue(mpLore)
        .setClick("run_command", `/ct copy Magical Power: ${mp.magicalPower}`);

    const hyperionMessage = new TextComponent(`&aHyperion: ${hyperion}\n`)
        .setHoverValue(hyperionLore);

    const duplexMessage = new TextComponent(`&aDuplex: ${duplex}\n`)
        .setHoverValue(duplexLore);

    const drillMessage = new TextComponent(`&aDrill: ${items.drill.name}\n`)
        .setHoverValue(items.drill.lore);

    const ragnarockAxeMessage = new TextComponent(`&aRagnarock Axe: ${items.ragnarock.name}\n`)
        .setHoverValue(items.ragnarock.lore);

    const legion = armor.helmet.legion + armor.chestplate.legion + armor.leggings.legion + armor.boots.legion;
    const strong = armor.helmet.strong + armor.chestplate.strong + armor.leggings.strong + armor.boots.strong;
    const fero = armor.helmet.fero + armor.chestplate.fero + armor.leggings.fero + armor.boots.fero;
    const extraMessage = new TextComponent(`&aExtra &7[HOVER]\n`)
        .setHoverValue(`&a&lExtra items:\n&8* &aReaper: ${extraReaper}\n&8* &aTerminator: ${extraTerminator}\n&8* &aDeployable: ${items.deployable.name}\n&8* &aFire Veil: ${extraFireveil}\n&8* &aRadio: ${extraHamRadio}\n&8* &aLegion: &b${legion} (+${(legion * 0.07).toFixed(2)}% stats)\n&8* &aRep: &b${reputation}\n\n&a&lMana Enchants &b(${strong + fero})\n&8* &aStrong: &b${strong} (${(strong * 0.1).toFixed(2)}% of Mana)\n&8* &aFero: &b${fero} (${(fero * 0.1).toFixed(2)}% of Mana)`);

    const helmetMessage = new TextComponent(`${armor.helmet.prefix} ${armor.helmet.name}\n`)
        .setHoverValue(armor.helmet.lore);

    const terrorChestplateMessage = new TextComponent(`${armor.chestplate.prefix} ${armor.chestplate.name}\n`)
        .setHoverValue(armor.chestplate.lore);

    const terrorLeggingsMessage = new TextComponent(`${armor.leggings.prefix} ${armor.leggings.name}\n`)
        .setHoverValue(armor.leggings.lore);

    const terrorBootsMessage = new TextComponent(`${armor.boots.prefix} ${armor.boots.name}\n`)
        .setHoverValue(armor.boots.lore);

    const goldenDragonMessage = new TextComponent(`${oneBilBank}* ${goldenDragon}\n`)
        .setHoverValue(goldenDragonLore);

    const kickMessage = new TextComponent(`&cRemove &4${name} &cfrom the party`)
        .setClick("run_command", `/p kick ${name}`);

    const message = new Message();
    message.addTextComponent(playerMessage);
    message.addTextComponent(lifelineMessage);
    message.addTextComponent(manaPoolMessage);
    message.addTextComponent(runsMessage);
    message.addTextComponent(mpMessage);
    message.addTextComponent(new TextComponent("\n"));
    message.addTextComponent(hyperionMessage);
    message.addTextComponent(duplexMessage);
    message.addTextComponent(drillMessage);
    message.addTextComponent(ragnarockAxeMessage);
    message.addTextComponent(extraMessage);
    message.addTextComponent(new TextComponent("\n"));
    message.addTextComponent(helmetMessage);
    message.addTextComponent(terrorChestplateMessage);
    message.addTextComponent(terrorLeggingsMessage);
    message.addTextComponent(terrorBootsMessage);
    message.addTextComponent(goldenDragonMessage);
    message.addTextComponent(new TextComponent("&2&m----------------------------&r"));
    
    if (!manually && Party.leader == Player.getName()) {
        message.addTextComponent(kickMessage);
    }
    
    ChatLib.chat(message);
}

export default showKuudraInfo;
