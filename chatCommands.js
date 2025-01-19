import axios from "axios";
import Settings from "./settings/config.js";
import {
    calculateMagicalPower,
    decompress,
    delay,
    errorHandler,
    extractUsernameFromMsg,
    fixNumber,
    getDiscord,
    getRoles,
    isKeyValid,
    showInvalidReasonMsg,
    showMissingRolesMsg
} from "./utils/generalUtils.js";
import {apChatCommand} from "./kuudra/attributePrices.js";
import Party from "./utils/Party.js";

const TOTAL_XP = 569809640;
const SEL_CLASS_XP = 360000;
const UNSEL_CLASS_XP = 90000;
const AVG_RUN_TIME_MINUTES = 7;

function getCommand(context, ign, type) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    axios
        .get(`https://api.sm0kez.com/hypixel/profile/${ign}/selected`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)",
                "API-Key": Settings.apikey,
            },
        })
        .then((response) => handleResponse(response.data, context, ign, type))
        .catch((error) => {
            ChatLib.command(`${context} INVALID`);
            if (!error.isAxiosError || error.code === 500) {
                errorHandler(`Error while getting profile data for ${ign}`, error.message, "chatCommands.js", `User: ${ign} | Type: ${type}`);
            }
        });
}

function handleResponse(data, context, ign, type) {
    if (!data.success) {
        ChatLib.command(`${context} INVALID`);
        return;
    }

    const memberData = data.members?.[data.uuid];
    if (!memberData) {
        ChatLib.command(`${context} INVALID`);
        return;
    }

    switch (type) {
        case "runs":
            handleRuns(context, memberData);
            break;
        case "stats":
            processStats(memberData, context);
            break;
        case "rtca":
            handleRtca(context, data.name, memberData);
            break;
        case "cata":
            handleCata(context, data.name, memberData);
            break;
        default:
            return;
    }
}

function handleRuns(context, memberData) {
    const runs = memberData.nether_island_player_data?.kuudra_completed_tiers?.infernal || 0;
    ChatLib.command(`${context} ${runs} runs`);
}

function handleCata(context, name, memberData) {
    const cata = calculateCataLevel(memberData);
    const pb = formatPersonalBest(memberData);
    const mp = calculateMagicalPower(memberData);
    const secrets = fixNumber(memberData?.dungeons?.secrets || 0);

    ChatLib.command(`${context} ${name}'s Cata: ${cata} - PB: ${pb} - MP: ${mp} - Secrets: ${secrets}`);
}

function calculateCataLevel(memberData) {
    const xpChart = [
        50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260, 7380, 10300, 14400, 20000, 27600, 38000,
        52500, 71500, 97000, 132000, 180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000, 2500000,
        3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000, 19000000, 24000000, 30000000, 38000000,
        48000000, 60000000, 75000000, 93000000, 116250000,
    ];
    const xp = memberData?.dungeons?.dungeon_types?.catacombs?.experience || 0;
    let cumulativeXP = 0;

    for (let i = 0; i < xpChart.length; i++) {
        cumulativeXP += xpChart[i];
        if (xp < cumulativeXP) {
            const previousXP = cumulativeXP - xpChart[i];
            return (i + (xp - previousXP) / xpChart[i]).toFixed(2);
        }
    }

    return (xpChart.length + (xp - xpChart.reduce((a, b) => a + b)) / 200000000).toFixed(2);
}

function formatPersonalBest(memberData) {
    const pbRaw = memberData.dungeons?.dungeon_types?.master_catacombs?.fastest_time?.[7] || 0;
    const minutes = Math.floor(pbRaw / 60000).toString().padStart(2, "0");
    const seconds = Math.floor((pbRaw % 60000) / 1000).toString().padStart(2, "0");
    const milliseconds = (pbRaw % 1000).toString().padStart(3, "0");
    return `${minutes}:${seconds}:${milliseconds}`;
}

function processStats(memberData, context) {
    const inventoryData = [
        memberData.inventory?.inv_contents?.data,
        memberData.inventory?.inv_armor?.data,
        memberData.inventory?.wardrobe_contents?.data,
        memberData.inventory?.equipment_contents?.data,
    ];

    let lifeline = 0,
        manaPool = 0;

    inventoryData.forEach((data) => {
        const items = decompress(data);
        if (!items) return;

        for (let i = 0; i < items.func_74745_c(); i++) {
            const item = items.func_150305_b(i);
            if (!item) continue;

            const tag = new NBTTagCompound(item).getCompoundTag("tag");
            const attributes = tag.getCompoundTag("ExtraAttributes")?.getCompoundTag("attributes").toObject();
            const id = tag.getCompoundTag("ExtraAttributes")?.getString("id");

            if (attributes && ["NECKLACE", "CLOAK", "BELT", "GAUNTLET", "GLOVES", "TERROR"].some((equip) => id?.includes(equip))) {
                lifeline += parseInt(attributes.lifeline || 0);
                manaPool += parseInt(attributes.mana_pool || 0);
            }
        }
    });

    const mp = calculateMagicalPower(memberData);
    ChatLib.command(`${context} Lifeline: ${lifeline} | Mana pool: ${manaPool} | Magical power: ${mp}`);
}

function handleRtca(context, name, memberData) {
    const classXP = calculateClassXP(memberData);
    const runs = calculateRuns(classXP);
    const totalHours = Math.round((Object.values(runs).reduce((a, b) => a + b) * AVG_RUN_TIME_MINUTES) / 60);

    ChatLib.command(`${context} ${name} H: ${runs.healer} - M: ${runs.mage} - B: ${runs.berserk} - A: ${runs.archer} - T: ${runs.tank} (${totalHours}h)`);
}

function calculateClassXP(memberData) {
    return {
        healer: TOTAL_XP - (memberData.dungeons?.player_classes?.healer?.experience || 0),
        mage: TOTAL_XP - (memberData.dungeons?.player_classes?.mage?.experience || 0),
        berserk: TOTAL_XP - (memberData.dungeons?.player_classes?.berserk?.experience || 0),
        archer: TOTAL_XP - (memberData.dungeons?.player_classes?.archer?.experience || 0),
        tank: TOTAL_XP - (memberData.dungeons?.player_classes?.tank?.experience || 0),
    };
}

function calculateRuns(classXP) {
    const runs = {healer: 0, mage: 0, berserk: 0, archer: 0, tank: 0};

    while (Object.values(classXP).some((xp) => xp > 0)) {
        const highestXPClass = Object.keys(classXP).reduce((a, b) => (classXP[a] >= classXP[b] ? a : b));
        Object.keys(classXP).forEach((className) => {
            classXP[className] -= className === highestXPClass ? SEL_CLASS_XP : UNSEL_CLASS_XP;
        });
        runs[highestXPClass]++;
    }

    return runs;
}

const parseCommand = (message) => {
    const startIdx = message.indexOf(": ") + 2;
    const commandPart = message.substring(startIdx).trim();
    const parts = commandPart.split(" ");
    const command = parts[0];
    const args = parts.slice(1).filter(arg => arg);

    return {command, args};
};

const handleCommand = (context, commandInfo, msg) => {
    const command = commandInfo.command;
    const args = commandInfo.args;

    if (command === ".ap" || command === ".attributeprice") {
        let attribute = args[0] || null;
        let lvl = args[1] || null;
        apChatCommand(attribute, lvl, context);
    } else if (command === ".kic") {
        delay(() => {
            ChatLib.command(`${context} [KIC] > ${getDiscord()}`);
        }, 500);
    } else if (command === ".kick" && Party.amILeader()) {
        const p = args[0] || "51fe055890e7463383a8feac3a7d3708";
        delay(() => {
            ChatLib.command(`p kick ${p}`);
        }, 500);
    } else {
        let ign = args[0] || extractUsernameFromMsg(msg);
        getCommand(context, ign, command.substring(1));
    }
};

function getPartyCmdsList() {
    const cmds = [];
    cmds.push(".kic");
    if (Settings.partyCommandRuns) cmds.push(".runs");
    if (Settings.partyCommandStats) cmds.push(".stats");
    if (Settings.partyCommandRtca) cmds.push(".rtca");
    if (Settings.partyCommandAp) cmds.push(".ap");
    if (Settings.partyCommandKick) cmds.push(".kick");
    if (Settings.partyCommandCata) cmds.push(".cata");
    return cmds;
}

function getDmCmdsList() {
    const cmds = [];
    cmds.push(".kic");
    if (Settings.dmCommandRuns) cmds.push(".runs");
    if (Settings.dmCommandStats) cmds.push(".stats");
    if (Settings.dmCommandRtca) cmds.push(".rtca");
    if (Settings.dmCommandAp) cmds.push(".ap");
    if (Settings.dmCommandCata) cmds.push(".cata");
    return cmds;
}

register("chat", (msg) => {
    if (!Settings.partyCommands && !Settings.dmCommands) return;

    if (msg.startsWith("Party >")) {
        if (!Settings.partyCommands) return;

        const commands = getPartyCmdsList();
        const commandInfo = parseCommand(msg);
        if (commands.includes(commandInfo.command)) {
            handleCommand("pc", commandInfo, msg);
        }
    } else if (msg.startsWith("From ")) {
        if (!Settings.dmCommands) return;

        const commands = getDmCmdsList();
        const commandInfo = parseCommand(msg);
        if (commands.includes(commandInfo.command)) {
            handleCommand("r", commandInfo, msg);
        }
    }
}).setCriteria("${msg}");