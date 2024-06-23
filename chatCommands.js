import { request } from '../requestV2';
import { decompress } from './utils/generalUtils.js';

function getCommand(ign, apiKey, type) {
    request({
        url: `https://api.sm0kez.com/profile/${ign}/selected`,
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": apiKey
        },
        json: true
    })
        .then(response => {
            if (response.success) {
                processData(response.members?.[response.uuid], response.name);
            } else {
                ChatLib.command(`pc ${response.error || "Player not found"}`);
            }
        })
        .catch(error => console.error("Error in first request:", error));

    const processData = (memberData, name) => {
        if (type === "runs") {
            const runs = memberData.nether_island_player_data?.kuudra_completed_tiers?.infernal || 0;
            ChatLib.command(`pc ${runs} runs`);
        } else if (type === "stats") {
            processStats(memberData);
        } else if (type === "rtca") {
            rtca(memberData, name);
        }
    };
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

    inventoryData.forEach((data, index) => {
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
