import axios from "axios";
import Settings from "../settings/config.js";
import {
    errorHandler,
    isKeyValid,
    getRoles,
    showInvalidReasonMsg,
    showMissingRolesMsg,
    kicPrefix
} from "../utils/generalUtils.js";

export function getPriceData(arg1, arg2, arg3, arg4, cmd, callback) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    if (!arg1) {
        ChatLib.chat(`${kicPrefix} &cUse /${cmd} <attribute> [level] <attribute> [level]`);
        return;
    }

    const attribute1 = arg1;
    let level1 = 0;
    let attribute2 = null;
    let level2 = 0;

    if (cmd === "ka" && arg1 && !arg2) {
        if (Settings.kaUseDefaultAttributeLvl) {
            level1 = Settings.kaDefaultAttributeLvl;
        }
    }

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

    axios.post(`https://api.sm0kez.com/crimson/attribute/prices?limit=${Settings.apAuctionLimit}&extra=${cmd === "ka" ? "true" : "false"}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: requestBody,
        parseBody: true
    })
        .then(response => {
            callback(response.data);
        })
        .catch(error => {
            if (error.isAxiosError && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } else if (error.isAxiosError && error.code != 500) {
                ChatLib.chat(`${kicPrefix} &c${error.response.data}`);
            } else {
                ChatLib.chat(`${kicPrefix} &cSomething went wrong while getting price data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting prices", error.message, "attributePrices.js", `Arg1: ${arg1} | Arg2: ${arg2} | Arg3: ${arg3} | Arg4: ${arg4}`);
            }
        });
}

export const attributes = [
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