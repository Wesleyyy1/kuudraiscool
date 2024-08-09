import Settings from "./settings/config.js";
import getCommand from "./chatCommands.js";
import checkParty from "./doogans.js";
import searchItem from "./searchItem.js";
import showKuudraInfo from "./kuudraInfo.js";
import { checkUpdate } from "./utils/updateChecker.js";
import { errorHandler, checkApiKey } from "./utils/generalUtils.js";
import "./runOverview.js";
import "./kuudra-prices/attributePrices.js";
import { apPartyCommand } from "./kuudra-prices/attributePrices.js";

// Checks on launch
setTimeout(() => {
    checkUpdate();
    checkApiKey();
    console.log("Kuudraiscool load!");
}, 1000);

// Register chat event for party finder
register("chat", (player) => {
    if (!Settings.partyfinder || player == Player.getName()) return;
    showKuudraInfo(player, false);
}).setCriteria(/^Party Finder > (.+) joined the group! ((.+))$/);

// Register chat event for party commands
register("chat", (msg) => {
    const message = msg.toString();
    try {
        if (Settings.partycommands && message.startsWith("Party >")) {
            const parseCommand = (command) => {
                const parts = message.split(command);
                if (parts.length > 1) {
                    const args = parts[1].trim().split(" ");
                    return args.filter(arg => arg);
                }
                return [];
            };

            if (message.includes(": .runs ")) {
                let ign = parseCommand(".runs")[0] || Player.getName();
                getCommand(ign, "runs");
            } else if (message.includes(": .stats ")) {
                let ign = parseCommand(".stats")[0] || Player.getName();
                getCommand(ign, "stats");
            } else if (message.includes(": .rtca ")) {
                let ign = parseCommand(".rtca")[0] || Player.getName();
                getCommand(ign, "rtca");
            } else if (message.includes(": .kic ")) {
                ChatLib.command('pc [KIC] > https://discord.gg/gsz58gazAK');
            } else if (message.includes(": .ap ") || message.includes(": .attributeprice ")) {
                let args = parseCommand(".ap");
                let attribute = args[0] || null;
                let lvl = args[1] || null;
                apPartyCommand(attribute, lvl);
            }
        }
    } catch (error) {
        errorHandler("Error while performing chat command", error, "index.js", `Message: ${message}`);
    }
}).setCriteria("${msg}");

// Register command to set API key
register("command", (...args) => {
    if (args[0]) {
        updateApiKey(args[0]);
    } else {
        ChatLib.chat("&7[&a&lKIC&r&7]&r &aUse /apikey <key>");
    }
}).setName("apikey", true);

register("command", () => {
    checkApiKey();
}).setName("checkapikey", true);

function updateApiKey(key) {
    if (key === Settings.apikey) return ChatLib.chat("&7[&a&lKIC&r&7]&r &cYou are already using this API key!");
    checkApiKey(key);
}

// Register command to get Kuudra info
register("command", (...args) => {
    const ign = args[0] || Player.getName();
    showKuudraInfo(ign, true);
}).setName("kuudra", true);

// Register command to search item for a player
register("command", (...args) => {
    if (args[0] && args[1]) {
        const query = args.slice(1).join(" ");
        searchItem(args[0], query);
    } else {
        ChatLib.chat("&7[&a&lKIC&r&7]&r &cUse /lf <player> <query> to search a player for an item!");
    }
}).setName("lf", true);

// Register command to toggle party finder
register("command", () => {
    togglePartyFinder();
}).setName("togglepartyfinder", true).setAliases("togglepf");

// Register command to toggle run overview
register("command", () => {
    toggleRunOverview();
}).setName("togglerunoverview", true).setAliases("togglerun");

function togglePartyFinder() {
    Settings.partyfinder = !Settings.partyfinder;
    
    if (Settings.partyfinder) {
        ChatLib.chat("&aParty Finder stats is now enabled!");
    } else {
        ChatLib.chat("&cParty Finder stats is now disabled!");
    }
}

function toggleRunOverview() {
    Settings.runoverview = !Settings.runoverview;

    if (Settings.runoverview) {
        ChatLib.chat("&aRun overview is now enabled!");
    } else {
        ChatLib.chat("&cRun overview is now disabled!");
    }
}

// Register commands to join specific instances
register("command", () => ChatLib.command("joininstance KUUDRA_NORMAL")).setName("t1", true);
register("command", () => ChatLib.command("joininstance KUUDRA_HOT")).setName("t2", true);
register("command", () => ChatLib.command("joininstance KUUDRA_BURNING")).setName("t3", true);
register("command", () => ChatLib.command("joininstance KUUDRA_FIERY")).setName("t4", true);
register("command", () => ChatLib.command("joininstance KUUDRA_INFERNAL")).setName("t5", true);

// Register main kuudraiscool command
register("command", (...args) => {
    if(!args[0]){
        Settings.openGUI();
        return;
    }
    const ign = Player.getName();
    switch (args[0]) {
        case "togglepartyfinder":
        case "togglepf":
            togglePartyFinder();
            break;
        case "togglerun":
        case "togglerunoverview":
            toggleRunOverview();
            break;
        case "kuudra":
            showKuudraInfo(args[1] || ign, true);
            break;
        case "apikey":
            if (!args[1]) return ChatLib.chat("&7[&a&lKIC&r&7]&r &aUse /kic apikey <key>");
            updateApiKey(args[1]);
            break;
        case "t1":
            ChatLib.command("joininstance KUUDRA_NORMAL");
            break;
        case "t2":
            ChatLib.command("joininstance KUUDRA_HOT");
            break;
        case "t3":
            ChatLib.command("joininstance KUUDRA_BURNING");
            break;
        case "t4":
            ChatLib.command("joininstance KUUDRA_FIERY");
            break;
        case "t5":
            ChatLib.command("joininstance KUUDRA_INFERNAL");
            break;
        case "settings":
            Settings.openGUI();
            break;
        default:
            ChatLib.chat("&r")
            ChatLib.chat("&r&2&lKuudraiscool commands");
            ChatLib.chat("&8* &a/kic settings");
            ChatLib.chat("&8* &a/kic togglepartyfinder (togglepf)");
            ChatLib.chat("&8* &a/kic togglerunoverview (togglerun)");
            ChatLib.chat("&8* &a/t2/t3/t4/t5");
            ChatLib.chat("&8* &a/apikey <key>");
            ChatLib.chat("&8* &a/kuudra [player]");
            ChatLib.chat("&8* &a/cancelrunoverview");
            ChatLib.chat("&r")
            ChatLib.chat("&r&2&lChat commands");
            ChatLib.chat("&8* &a .stats");
            ChatLib.chat("&8* &a .runs");
            ChatLib.chat("&8* &a .rtca");
            ChatLib.chat("&r")
            break;
    }
}).setName("kuudraiscool", true).setAliases("kic", "ki");

// Register chat event for party data
register("chat", (msg) => {
    if (msg.includes("Team Score:") && !msg.startsWith("Party >") && !msg.startsWith("Guild >")) {
        checkParty();
    }
}).setCriteria("${msg}");

register("command", () => {
    checkParty();
}).setName("doogans", true);
