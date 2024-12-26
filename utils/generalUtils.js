import axios from "axios";
import Settings from "../settings/config.js";
import { COLORS } from "./constants.js";

const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const Base64 = Java.type("java.util.Base64");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");
const Threading = Java.type("gg.essential.api.utils.Multithreading");

let currentVersion = "";
let keyValid = false;
let invalidReason = "";
let roles = [];
let discordUrl = "https://discord.gg/gsz58gazAK";
const kicPrefix = "&7[&a&lKIC&r&7]&r";
const kicDebugPrefix = "&7[&2&lKIC-DEBUG&r&7]&r";
let registers = [];
let worldJoin = [];
let worldLeave = [];

function kicDebugMsg(msg) {
    if (Settings.kicDebug) {
        ChatLib.chat(`${kicDebugPrefix} &c${msg}`);
    }
}

function getColorCode(setting) {
    if (typeof setting === "number" && setting >= 0 && setting < Object.keys(COLORS).length) {
        return COLORS[Object.keys(COLORS)[setting]];
    }
    return COLORS.WHITE;
}

function formatTimeShort(timeInMs, showMs = true) {
    if (!timeInMs) return 0;
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    const msMSg = `.${milliseconds.toString().padStart(2, "0")}`;
    return `${minutes}:${seconds}${showMs ? msMSg : ""}`;
}

function formatTimeMain(seconds, fixed = 0, units = 4) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = (seconds % 60).toFixed(fixed);
  
    const timeParts = [];
  
    if (days > 0 && units > 0) {
      timeParts.push(`${days}d`);
      units--;
    }
  
    if ((hours > 0 || days > 0) && units > 0) {
      timeParts.push(`${hours.toString().padStart(days > 0 ? 2 : 1, "0")}h`);
      units--;
    }
  
    if ((minutes > 0 || hours > 0 || days > 0) && units > 0) {
      timeParts.push(`${minutes.toString().padStart(hours > 0 || days > 0 ? 2 : 1, "0")}m`);
      units--;
    }
  
    if (units > 0) {
      timeParts.push(`${remainingSeconds.toString().padStart(minutes > 0 || hours > 0 || days > 0 ? 2 : 1, "0")}s`);
    }
  
    return timeParts.join("");
}

function fixNumber(labelValue) {
    if (!labelValue) return 0;
    const sign = Math.sign(labelValue);
    const absoluteValue = Math.abs(Number(labelValue));

    if (absoluteValue >= 1.0e+9) {
        return (sign * (absoluteValue / 1.0e+9)).toFixed(2) + "B";
    } else if (absoluteValue >= 1.0e+6) {
        return (sign * (absoluteValue / 1.0e+6)).toFixed(2) + "M";
    } else if (absoluteValue >= 1.0e+3) {
        return (sign * (absoluteValue / 1.0e+3)).toFixed(2) + "K";
    } else {
        return (sign * absoluteValue).toString();
    }
}

const decompress = (compressed) => {
    if (!compressed) return;
    try {
        return new CompressedStreamTools.func_74796_a(new ByteArrayInputStream(Base64.getDecoder().decode(compressed))).func_150295_c("i", 10);
    } catch (error) {
        errorHandler("Error while decompressing", error, "generalUtils.js", null);
        return;
    }
}

function getColorData(moduleName, type) {
    const tiers = {
        "MYTHIC": "&d",
        "LEGENDARY": "&6",
        "EPIC": "&5",
        "RARE": "&9",
        "UNCOMMON": "&a",
        "COMMON": "&f"
    };

    const gemstoneColors = {
        "ROUGH": "&f*",
        "FLAWED": "&a*",
        "FINE": "&9*",
        "FLAWLESS": "&5*",
        "PERFECT": "&6*"
    };

    const tuningStats = {
        "health": ["&cHealth", "&c", 5],
        "defense": ["&aDefense", "&a", 1],
        "walk_speed": ["&fSpeed", "&f", 1.5],
        "strength": ["&cStrength", "&c", 1],
        "critical_damage": ["&9CD", "&9", 1],
        "critical_chance": ["&9CC", "&9", 0.2],
        "attack_speed": ["&eATS", "&e", 0.3],
        "intelligence": ["&bIntel", "&b", 2]
    };

    switch (moduleName) {
        case "gemstonechecker":
            return type ? (gemstoneColors[type.toUpperCase()] || "&8*") : "&8*";
        case "gettunings":
            if (type && typeof type === "object") {
                const filteredData = Object.entries(type)
                    .filter(([key, value]) => value && tuningStats[key])
                    .map(([key, value]) => {
                        const [name, color, multiplier] = tuningStats[key];
                        return `${color}${(value * multiplier).toFixed(2)} ${name}`;
                    });
                return filteredData.join("\n");
            }
            return "No tuning data found.";
        case "rarity":
            return type ? (tiers[type.toUpperCase()] || "&8") : "&8";
        default:
            return "Invalid module name.";
    }
}

function capitalizeEachWord(input) {
    return input.split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
}

function errorHandler(msg, error, origin, extra) {
    if (!error) return;
    console.error(error);

    let requestBody = {};
    requestBody.username = Player.getName();

    requestBody.content = `${msg}\n- Origin: ${origin}\n- Error: ${error || ""}\n- Version: ${currentVersion}`;
    if (extra) {
        requestBody.content += `\n- Extra: ${ex}`;
    }

    axios.post("https://api.sm0kez.com/error/module", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: requestBody,
        parseBody: true
    })
        .catch(error => {
            // Ignore errors
        });
}

function setVersion(version) {
    currentVersion = version;
}

function setDiscord(discord) {
    discord = discord;
}

function getDiscord() {
    return discordUrl;
}

function checkApiKey(apiKey, manual = false) {
    const noApiKeyMessage = `${kicPrefix} &eThere is no API key set. If you have an API key, set it using /kic apikey <key>.\n&eIf you do not have an API key, join the Discord: ${getDiscord()}`;

    const key = apiKey || Settings.apikey;

    if (!Settings.apikey && !apiKey) {
        ChatLib.chat(noApiKeyMessage);
        invalidReason = noApiKeyMessage;
        roles = [];
        keyValid = false;
        return false;
    }

    axios.get("https://api.sm0kez.com/key", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": key
        }
    })
        .then(response => {
            const data = response.data;

            if (data.status === "ACTIVE") {
                handleActiveApiKey(data, apiKey, manual);
            } else {
                handleInactiveApiKey(data.status);
            }
        })
        .catch(error => {
            if (error.response && (error.response.status === 502 || error.response.status === 503)) {
                ChatLib.chat(`${kicPrefix} &cThe API is currently offline.`);
            } if (error.response && error.response.status === 429) {
                ChatLib.chat(`${kicPrefix} &cYou cannot make anymore request to the api at this time please try again later.`);
            } else {
                handleApiError(error);
            }
        });
}

function handleActiveApiKey(data, apiKey, manual) {
    keyValid = true;
    invalidReason = "";
    roles = data.roles;

    if (apiKey) {
        Settings.apikey = apiKey;
        ChatLib.chat(`${kicPrefix} &aYour API key has been set!`);
    } else if (manual) {
        ChatLib.chat(`${kicPrefix} &aYou're API key has been verified and is working.`);
    }
}

function handleInactiveApiKey(status) {
    invalidReason = `${kicPrefix} &cYour API key is currently ${status}. Please verify your API key or get a new one from the Discord: ${getDiscord()}`;
    ChatLib.chat(invalidReason);
    roles = [];
    keyValid = false;
}

function handleApiError(error) {
    const incorrectApiKeyMessage = `${kicPrefix} &cThe API key provided is incorrect. Please verify your API key or get a new one from the Discord: ${getDiscord()}`;
    if (error.isAxiosError && error.response && error.response.status !== 500) {
        invalidReason = incorrectApiKeyMessage;
        ChatLib.chat(incorrectApiKeyMessage);
    } else {
        ChatLib.chat(`${kicPrefix} &cSomething went wrong while checking your API key!\n&cPlease report this in the discord server!`);
        errorHandler("Error while getting profile data", error.message, "generalUtils.js", null);
    }

    roles = [];
    keyValid = false;
}

function isKeyValid() {
    return keyValid;
}

function getRoles() {
    return roles;
}

function showInvalidReasonMsg() {
    ChatLib.chat(invalidReason);
}

function showMissingRolesMsg() {
    ChatLib.chat(`${kicPrefix} &cYou are missing the necessary roles to use this feature. Please check your roles or contact support for assistance.`);
}

function delay(func, time) {
    if (time) {
        Threading.schedule(() => { func() }, time, java.util.concurrent.TimeUnit.MILLISECONDS);
    } else {
        Threading.runAsync(() => { func() });
    }
}

function registerWhen(trigger, dependency, active = false) {
    registers.push([trigger.unregister(), dependency, active]);
}

function setRegisters() {
    registers.forEach(trigger => {
        if (trigger[1]() && !trigger[2]) {
            trigger[0].register();
            trigger[2] = true;
        } else if (!trigger[1]() && trigger[2]) {
            trigger[0].unregister();
            trigger[2] = false;
        }
    });
}

function onWorldJoin(func) { worldJoin.push(func); }

function onWorldLeave(func) { worldLeave.push(func); }

register("worldLoad", () => {
    let i = worldJoin.length;
    while (i--) {
        worldJoin[i]();
    };
})

register("worldUnload", () => {
    let i = worldLeave.length;
    while (i--) {
        worldLeave[i]();
    };
})

register("serverDisconnect", () => {
    let i = worldLeave.length;
    while (i--) {
        worldLeave[i]();
    };
})

export {
    getColorCode,
    fixNumber,
    decompress,
    getColorData,
    capitalizeEachWord,
    formatTime,
    formatTimeShort,
    formatTimeMain,
    errorHandler,
    setVersion,
    checkApiKey,
    isKeyValid,
    getRoles,
    showInvalidReasonMsg,
    showMissingRolesMsg,
    setDiscord,
    getDiscord,
    kicPrefix,
    delay,
    registerWhen,
    setRegisters,
    onWorldJoin,
    onWorldLeave,
    kicDebugMsg
};
