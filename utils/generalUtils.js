import axios from "axios";
import Settings from "../settings/config.js";

const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const Base64 = Java.type("java.util.Base64");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");

let currentVersion = "";
let keyValid = false;
let invalidReason = "";
let roles = [];

const gregCumulativeXP = [
    0, 660, 1390, 2190, 3070, 4030, 5080, 6230, 7490, 8870, 10380, 12030, 13830, 15790, 
    17920, 20230, 22730, 25430, 28350, 31510, 34930, 38630, 42630, 46980, 51730, 56930, 
    62630, 68930, 75930, 83730, 92430, 102130, 112930, 124930, 138230, 152930, 169130, 
    186930, 206430, 227730, 250930, 276130, 303530, 333330, 365730, 400930, 439130, 
    480530, 525330, 573730, 625930, 682130, 742530, 807330, 876730, 950930, 1030130, 
    1114830, 1205530, 1302730, 1406930, 1518630, 1638330, 1766530, 1903730, 2050430, 
    2207130, 2374830, 2554530, 2747230, 2953930, 3175630, 3413330, 3668030, 3940730, 
    4232430, 4544130, 4877830, 5235530, 5619230, 6030930, 6472630, 6949330, 7466030, 
    8027730, 8639430, 9306130, 10032830, 10824530, 11686230, 12622930, 13639630, 14741330, 
    15933030, 17219730, 18606430, 20103130, 21719830, 23466530, 25353230, 25353230, 25358785, 
    27245485, 29132185, 31018885, 32905585, 34792285, 36678985, 38565685, 40452385, 42339085, 
    44225785, 46112485, 47999185, 49885885, 51772585, 53659285, 55545985, 57432685, 59319385, 
    61206085, 63092785, 64979485, 66866185, 68752885, 70639585, 72526285, 74412985, 76299685, 
    78186385, 80073085, 81959785, 83846485, 85733185, 87619885, 89506585, 91393285, 93279985, 
    95166685, 97053385, 98940085, 100826785, 102713485, 104600185, 106486885, 108373585, 110260285, 
    112146985, 114033685, 115920385, 117807085, 119693785, 121580485, 123467185, 125353885, 127240585, 
    129127285, 131013985, 132900685, 134787385, 136674085, 138560785, 140447485, 142334185, 144220885, 
    146107585, 147994285, 149880985, 151767685, 153654385, 155541085, 157427785, 159314485, 161201185, 
    163087885, 164974585, 166861285, 168747985, 170634685, 172521385, 174408085, 176294785, 178181485, 
    180068185, 181954885, 183841585, 185728285, 187614985, 189501685, 191388385, 193275085, 195161785, 
    197048485, 198935185, 200821885, 202708585, 204595285, 206481985, 208368685, 210255385
];

function getGregLevel(xp) {
    for (let i = gregCumulativeXP.length - 1; i >= 0; i--) {
        if (xp >= gregCumulativeXP[i]) {
            return i + 1;
        }
    }
    return 1;
}

function fixNumber(labelValue) {
    return Math.abs(Number(labelValue)) >= 1.0e+9
        ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
        : Math.abs(Number(labelValue)) >= 1.0e+6
            ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
            : Math.abs(Number(labelValue)) >= 1.0e+3
                ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"
                : Math.abs(Number(labelValue));
}

const decompress = (compressed) => {
    if (!compressed) return;
    try {
        return new CompressedStreamTools.func_74796_a(new ByteArrayInputStream(Base64.getDecoder().decode(compressed))).func_150295_c("i", 10);
    } catch (error) {
        errorHandler("Error while decompressing", error, "generalUtils.js");
        return;
    }
}

function getColorData(moduleName, type) {
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
                        return `&aTuning: ${color}${(value * multiplier).toFixed(2)} ${name}`;
                    });
                return filteredData.join("\n");
            }
            return "No tuning data found.";
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

function errorHandler(msg, error, origin) {
    if (!error) return;
    console.error(error);

    let requestBody = {};
    requestBody.username = Player.getName();

    requestBody.content = `${msg}\n- Origin: ${origin}\n- Error: ${error || ""}\n- Version: ${currentVersion}`;

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

function checkApiKey(apiKey) {
    if ((!Settings.apikey || Settings.apikey == "") && !apiKey) {
        invalidReason = "&7[&a&lKIC&r&7]&r&e There is no API key set. If you have an API key, set it using /kic apikey <key>.\n&eIf you do not have an API key, join the Discord: https://discord.gg/gsz58gazAK";
        ChatLib.chat(invalidReason);
        roles = [];
        keyValid = false;
        return false;
    } else {
        axios.get("https://api.sm0kez.com/key", {
            headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)",
                "API-Key": apiKey || Settings.apikey
            }
        })
            .then(response => {
                const data = response.data;
    
                if (data.status == "ACTIVE") {
                    keyValid = true;
                    const previousRoles = roles;
                    roles = data.roles;
                    invalidReason = "";
                    if (apiKey) {
                        Settings.apikey = apiKey;
                        ChatLib.chat("&7[&a&lKIC&r&7]&r&a Your API key has been set!");
                    }

                    if (previousRoles.length != 0 && roles.length > previousRoles.length) {
                        ChatLib.chat("&7[&a&lKIC&r&7]&r&a Your roles have been updated with new roles!");
                    } else if (previousRoles.length != 0 && roles.length < previousRoles.length) {
                        ChatLib.chat("&7[&a&lKIC&r&7]&r&a Some roles have been removed.");
                    }

                    return true;
                } else {
                    invalidReason = `&7[&a&lKIC&r&7]&r&c Your API key is currently ${data.status}. Please verify your API key or get a new one from the Discord: https://discord.gg/gsz58gazAK`;
                    ChatLib.chat(invalidReason);
                    Settings.apikey = "";
                    roles = [];
                    keyValid = false;
                    return false;
                }
            })
            .catch(error => {
                if (error.isAxiosError && error.code != 500) {
                    invalidReason = "&7[&a&lKIC&r&7]&r&c The API key provided is incorrect. Please verify your API key or get a new one from the Discord: https://discord.gg/gsz58gazAK";
                    ChatLib.chat(invalidReason);
                    Settings.apikey = "";
                    roles = [];
                    keyValid = false;
                    return false;
                } else {
                    ChatLib.chat(`&7[&a&lKIC&r&7]&r &cSomething went wrong while checking your API key!\n&cPlease report this in the discord server!`);
                    errorHandler("Error while getting profile data", error.message, "generalUtils.js");
                }
            });
    }
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
    ChatLib.chat("&7[&a&lKIC&r&7]&r&c You are missing the necessary roles to use this feature. Please check your roles or contact support for assistance.");
}

export { fixNumber, decompress, getColorData, capitalizeEachWord, formatTime, errorHandler, setVersion, checkApiKey, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, getGregLevel };
