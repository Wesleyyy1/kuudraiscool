const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const Base64 = Java.type("java.util.Base64");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");

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
    } catch (e) {
        console.error(e);
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

export { fixNumber, decompress, getColorData, capitalizeEachWord, formatTime };
