import axios from "axios";
import Settings from "./settings/config.js";
import { decompress, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, kicPrefix, fixNumber } from "./utils/generalUtils.js";

function getCommand(ign, type) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    axios.get(`https://api.sm0kez.com/hypixel/profile/${ign}/selected`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        }
    })
        .then(response => {
            const data = response.data;

            if (data.success) {
                processData(data.members?.[data.uuid], data.name);
            } else {
                ChatLib.command(`pc ${data.error || "Player not found!"}`);
            }
        })
        .catch(error => {
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (error.isAxiosError && error.code != 500) {
                ChatLib.chat(`${kicPrefix} &c${error.response.data}`);
            } else {
                ChatLib.chat(`${kicPrefix} &cSomething went wrong while gathering ${ign}'s data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting profile data", error.message, "chatCommands.js", `User: ${ign} | Type: ${type}`);
            }
        });

    const processData = (memberData, name) => {
        if (type === "runs") {
            const runs = memberData.nether_island_player_data?.kuudra_completed_tiers?.infernal || 0;
            ChatLib.command(`pc ${runs} runs`);
        } else if (type === "stats") {
            processStats(memberData);
        } else if (type === "rtca") {
            rtca(memberData, name);
        } else if (type === "cata") {
            getDungeonData(memberData, name);
        }
    };
}

function getDungeonData(memberData, name){

    // get cata lvl
    const xpChart = [50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260, 7380, 10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000, 132000, 180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000, 2500000, 3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000, 19000000, 24000000, 30000000, 38000000, 48000000, 60000000, 75000000, 93000000, 116250000];

    const xp = memberData?.dungeons?.dungeon_types?.catacombs?.experience || 0;
    const maxLevel = xpChart.length;
    const extraXPPerLevel = 200000000;
    const maxXPInChart = 569809640;

    let cata = 0;
    let cumulativeXP = 0;

    for (let i = 0; i < maxLevel; i++) {
        cumulativeXP += xpChart[i]
        if (xp < cumulativeXP) {

            const previousXP = cumulativeXP - xpChart[i];
            const levelFraction = (xp - previousXP) / xpChart[i];
            cata = i + levelFraction; 
            break;
        }
    }

    if (xp > maxXPInChart) {
        cata = maxLevel + (xp - maxXPInChart) / extraXPPerLevel;
    }

    cata = cata.toFixed(2);

    // get pb
    let pb = (memberData.dungeons?.dungeon_types?.master_catacombs?.fastest_time[7] || 0)
    pb = (pb / 1000 / 60).toFixed(2);
    Array = pb.split(".");
    if (Array[0] < 10){
        arraylessthan10 = `0` + Array[0]
    } else {
        arraylessthan10 = Array[0]
    }
    pb =  (60 / 100 * Array[1]).toFixed(2)
    Array = pb.split(".")
    pb = arraylessthan10 + ":" + Array[0] + ":" + Array[1]


    // get mp
    let mp = 0;
    let maxMp = 0;
    let totalMp = 0;

    const accessoryBag = memberData.accessory_bag_storage;
    if (accessoryBag) {
        maxMp = accessoryBag.highest_magical_power || 0;
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
            const activeContacts = memberData?.nether_island_player_data?.abiphone?.active_contacts;
            if (activeContacts) {
                totalMp += Math.floor(activeContacts.length / 2);
            }
        }

        mp = totalMp > maxMp ? maxMp : totalMp;
    } else {
        mp = maxMp;
    }

    const secrets = fixNumber(memberData?.dungeons?.secrets)
    
    ChatLib.command(`pc ${name}'s Cata: ${cata} - PB: ${pb} - MP: ${mp} - Secrets: ${secrets}`)
    

}

function processStats(memberData) {
    let lifeline = 0;
    let manaPool = 0;

    const inventoryData = [
        memberData.inventory?.inv_contents?.data,
        memberData.inventory?.inv_armor?.data,
        memberData.inventory?.wardrobe_contents?.data,
        memberData.inventory?.equipment_contents?.data
    ];

    inventoryData.forEach((data) => {
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
            let reforge = extraAttributes.getString("modifier");
            let id = extraAttributes.getString("id");

            if (attributes && reforge) {
                if (["NECKLACE", "CLOAK", "BELT", "GAUNTLET", "GLOVES", "TERROR"].some(equip => id.includes(equip))) {
                    let ll = attributes.lifeline;
                    if (ll) {
                        const ll_lvl = parseInt(ll);
                        lifeline += ll_lvl;

                        let mp = attributes.mana_pool;
                        if (mp) {
                            const mp_lvl = parseInt(mp);
                            manaPool += mp_lvl;
                        }
                    }
                }
            }
        }
    });

    const mp = memberData.accessory_bag_storage?.highest_magical_power || 0;
    ChatLib.command(`pc Lifeline: ${lifeline} | Mana pool: ${manaPool} | Magical power: ${mp}`);
};

function rtca(memberData, name) {
    const TOTAL_XP = 569809640;
    const SEL_CLASS_XP = 360000;
    const UNSEL_CLASS_XP = 90000;
    const AVG_RUN_TIME_MINUTES = 7;

    let classXP = {
        healer: TOTAL_XP - (memberData.dungeons?.player_classes?.healer?.experience || 0),
        mage: TOTAL_XP - (memberData.dungeons?.player_classes?.mage?.experience || 0),
        berserk: TOTAL_XP - (memberData.dungeons?.player_classes?.berserk?.experience || 0),
        archer: TOTAL_XP - (memberData.dungeons?.player_classes?.archer?.experience || 0),
        tank: TOTAL_XP - (memberData.dungeons?.player_classes?.tank?.experience || 0)
    };

    let runs = {
        healer: 0,
        mage: 0,
        berserk: 0,
        archer: 0,
        tank: 0
    };

    while (Object.values(classXP).some(xp => xp > 0)) {
        let highestXPClass = Object.keys(classXP).reduce((a, b) => (classXP[a] >= classXP[b] ? a : b));
        if (classXP[highestXPClass] < 0) break;

        for (let className in classXP) {
            classXP[className] -= (className === highestXPClass ? SEL_CLASS_XP : UNSEL_CLASS_XP);
        }

        runs[highestXPClass]++;
    }

    const totalRuns = Object.values(runs).reduce((a, b) => a + b, 0);
    const totalHours = Math.round((totalRuns * AVG_RUN_TIME_MINUTES) / 60);

    ChatLib.command(`pc ${name} H: ${runs.healer} - M: ${runs.mage} - B: ${runs.berserk} - A: ${runs.archer} - T: ${runs.tank} (${totalHours}h)`);
}

export default getCommand;
