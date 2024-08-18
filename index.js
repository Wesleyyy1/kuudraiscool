import Settings from "./settings/config.js";
import getCommand from "./chatCommands.js";
import checkParty from "./doogans.js";
import searchItem from "./searchItem.js";
import showKuudraInfo from "./kuudraInfo.js";
import Party from "./utils/Party.js";
import { checkUpdate } from "./utils/updateChecker.js";
import { apPartyCommand } from "./kuudra-prices/attributePrices.js";
import { checkApiKey, kicPrefix, getDiscord, setRegisters } from "./utils/generalUtils.js";
import "./runOverview.js";
import "./kuudra-prices/attributePrices.js";
import "./mvpEmoji.js";
import "./utils/World.js";
import "./kuudra-prices/kuudraProfit.js";

let firstChecks = false;

const firstChecksReg = register("worldLoad", () => {
    setTimeout(() => {
        if (firstChecks) return;
        checkUpdate();
        checkApiKey();
        Party.checkParty();
        setRegisters();
        firstChecks = true;
        firstChecksReg.unregister();
    }, 3000);
})

// Register chat event for party finder
register("chat", (player) => {
    if (!Settings.partyfinder || player == Player.getName()) return;
    showKuudraInfo(player, false);
}).setCriteria(/^Party Finder > (.+) joined the group! ((.+))$/);

const parseCommand = (message) => {
    const startIdx = message.indexOf(": ") + 2;
    const commandPart = message.substring(startIdx).trim();
    const parts = commandPart.split(" ");
    const command = parts[0];
    const args = parts.slice(1).filter(arg => arg);

    return { command, args };
};

const handleCommand = (context, commandInfo) => {
    const command = commandInfo.command;
    const args = commandInfo.args;

    if (command === ".ap" || command === ".attributeprice") {
        let attribute = args[0] || null;
        let lvl = args[1] || null;
        apPartyCommand(attribute, lvl, context);
    } else if (command === ".kic") {
        ChatLib.command(`${context} [KIC] > ${getDiscord()}`);
    } else {
        let ign = args[0] || Player.getName();
        getCommand(ign, command.substring(1));
    }
};

// Register chat event for chat commands
register("chat", (msg) => {
    if (!Settings.chatcommands) return;

    if (msg.startsWith("Party >")) {
        if (!Settings.partycommands) return;

        const commands = [".runs", ".stats", ".rtca", ".kic", ".ap", ".attributeprice"];
        const commandInfo = parseCommand(msg);
        if (commands.includes(commandInfo.command)) {
            handleCommand("pc", commandInfo);
        }
    } else if (msg.startsWith("From ")) {
        if (!Settings.dmcommands) return;

        const commands = [".runs", ".rtca", ".kic", ".ap", ".attributeprice"];
        const commandInfo = parseCommand(msg);
        if (commands.includes(commandInfo.command)) {
            handleCommand("r", commandInfo);
        }
    }
}).setCriteria("${msg}");

// Register command to set API key
register("command", (...args) => {
    if (args[0]) {
        updateApiKey(args[0]);
    } else {
        ChatLib.chat(`${kicPrefix} &aUse /apikey <key>`);
    }
}).setName("apikey", true);

function updateApiKey(key) {
    if (key === Settings.apikey) return ChatLib.chat(`${kicPrefix} &cYou are already using this API key!`);
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
        ChatLib.chat(`${kicPrefix} &cUse /lf <player> <query> to search a player for an item!`);
    }
}).setName("lf", true);

// Register commands to join specific instances
register("command", () => ChatLib.command("joininstance KUUDRA_NORMAL")).setName("t1", true);
register("command", () => ChatLib.command("joininstance KUUDRA_HOT")).setName("t2", true);
register("command", () => ChatLib.command("joininstance KUUDRA_BURNING")).setName("t3", true);
register("command", () => ChatLib.command("joininstance KUUDRA_FIERY")).setName("t4", true);
register("command", () => ChatLib.command("joininstance KUUDRA_INFERNAL")).setName("t5", true);

const kicCommandsMsg = new Message();
kicCommandsMsg.addTextComponent("\n&r&2&lKuudraiscool commands\n");
kicCommandsMsg.addTextComponent("&8* &a/kic settings\n");
kicCommandsMsg.addTextComponent("&8* &a/t1 /t2 /t3 /t4 /t5\n");
kicCommandsMsg.addTextComponent("&8* &a/apikey <key>\n");
kicCommandsMsg.addTextComponent("&8* &a/kuudra [player]\n");
kicCommandsMsg.addTextComponent("&8* &a/ap <attribute> [level] <attribute> [level]\n");
kicCommandsMsg.addTextComponent("&8* &a/doogans\n");
kicCommandsMsg.addTextComponent("&8* &a/kuudraprofit edit/reset\n");
kicCommandsMsg.addTextComponent("&8* &a/runoverviewpreview\n");
kicCommandsMsg.addTextComponent("&8* &a/cancelrunoverview\n");
kicCommandsMsg.addTextComponent("&8* &a/kic checkapikey\n\n");
kicCommandsMsg.addTextComponent("&r&2&lChat commands\n");
kicCommandsMsg.addTextComponent("&8* &a .stats [player]\n");
kicCommandsMsg.addTextComponent("&8* &a .runs [player]\n");
kicCommandsMsg.addTextComponent("&8* &a .rtca [player]\n");
kicCommandsMsg.addTextComponent("&8* &a .ap <attribute> [level]\n\n");
kicCommandsMsg.addTextComponent("&2[] = optional &7| &2<> = required\n");

// Register main kuudraiscool command
register("command", (...args) => {
    if (!args[0]) {
        Settings.openGUI();
        return;
    }
    const ign = Player.getName();
    switch (args[0]) {
        case "kuudra":
            showKuudraInfo(args[1] || ign, true);
            break;
        case "apikey":
            if (!args[1]) return ChatLib.chat(`${kicPrefix} &aUse /kic apikey <key>`);
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
        case "checkapikey":
            checkApiKey(null, true);
            break;
        default:
            ChatLib.chat(kicCommandsMsg);
            break;
    }
}).setName("kuudraiscool", true).setAliases("kic", "ki").setTabCompletions("kuudra", "apikey", "t1", "t2", "t3", "t4", "t5", "settings", "checkapikey");

// Register chat event for party data
register("chat", (msg) => {
    if (msg.includes("Team Score:") && !msg.startsWith("Party >") && !msg.startsWith("Guild >")) {
        checkParty();
    }
}).setCriteria("${msg}");

register("command", () => {
    checkParty();
}).setName("doogans", true);
