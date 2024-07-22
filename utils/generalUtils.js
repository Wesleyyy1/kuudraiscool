import request from '../../requestV2';
import Settings from '../settings/config.js';

const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const Base64 = Java.type("java.util.Base64");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");

let currentVersion = "";
let keyValid = false;
let invalidReason = "";
let roles = [];

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
        errorHandler('Error while decompressing', error, 'generalUtils.js');
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
            if (type && typeof type === 'object') {
                const filteredData = Object.entries(type)
                    .filter(([key, value]) => value && tuningStats[key])
                    .map(([key, value]) => {
                        const [name, color, multiplier] = tuningStats[key];
                        return `&aTuning: ${color}${(value * multiplier).toFixed(2)} ${name}`;
                    });
                return filteredData.join('\n');
            }
            return "No tuning data found.";
        default:
            return "Invalid module name.";
    }
}

function capitalizeEachWord(input) {
    return input.split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

function errorHandler(msg, error, origin) {
    if (!error) return;
    console.error(error);

    let requestBody = {};
    requestBody.username = Player.getName();

    requestBody.content = `${msg}\n- Origin: ${origin}\n- Error: ${error.message || ''}\n- File: ${error.fileName || ''}\n- Line: ${error.lineNumber || ''}\n- Version: ${currentVersion}`;

    request({
        url: 'https://api.sm0kez.com/error/module',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (ChatTriggers)',
            'API-Key': Settings.apikey
        },
        body: requestBody,
        json: true
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
        request({
            url: 'https://api.sm0kez.com/key',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (ChatTriggers)',
                'API-Key': apiKey || Settings.apikey
            },
            json: true
        })
            .then(response => {
                if (response.status == "ACTIVE") {
                    keyValid = true;
                    const previousRoles = roles;
                    roles = response.roles;
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
                    invalidReason = `&7[&a&lKIC&r&7]&r&c Your API key is currently ${response.status}. Please verify your API key or get a new one from the Discord: https://discord.gg/gsz58gazAK`;
                    ChatLib.chat(invalidReason);
                    Settings.apikey = "";
                    roles = [];
                    keyValid = false;
                    return false;
                }
            })
            .catch(error => {
                invalidReason = "&7[&a&lKIC&r&7]&r&c The API key provided is incorrect. Please verify your API key or get a new one from the Discord: https://discord.gg/gsz58gazAK";
                ChatLib.chat(invalidReason);
                Settings.apikey = "";
                roles = [];
                keyValid = false;
                return false;
            }
        );
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

export { fixNumber, decompress, getColorData, capitalizeEachWord, formatTime, errorHandler, setVersion, checkApiKey, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg };
