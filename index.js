import Settings from "./settings/config.js";
import getCommand from "./chatCommands.js";
import checkParty from "./doogans.js";
import searchItem from "./searchItem.js";
import showKuudraInfo from "./kuudraInfo.js";
import Party from "./utils/Party.js";
import { checkUpdate } from "./utils/updateChecker.js";
import { apPartyCommand } from "./kuudra-prices/attributePrices.js";
import { checkApiKey, kicPrefix, getDiscord, setRegisters, delay } from "./utils/generalUtils.js";
import "./runOverview.js";
import "./kuudra-prices/attributePrices.js";
import "./mvpEmoji.js";
import "./utils/World.js";
import "./kuudra-prices/kuudraProfit.js";
import "./utils/autoKick.js"

let firstChecks = false;
const playername = Player.getName()

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
    } else if (command === ".kick" && Party.leader == Player.getName()){
        const p = args[0] || "suuersindre"
        delay(() => kickCommand(p), 1000);
    } else {
        let ign = args[0] || Player.getName();
        getCommand(ign, command.substring(1));
    }
};

function kickCommand(p){
    ChatLib.command(`p kick ${p}`);
}

// Register chat event for chat commands
register("chat", (msg) => {
    if (!Settings.chatcommands) return;

    if (msg.startsWith("Party >")) {
        if (!Settings.partycommands) return;

        const commands = [".runs", ".stats", ".rtca", ".kic", ".ap", ".attributeprice", ".kick", ".cata"];
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

// Create the help message
const kicCommandsMsg = new Message();
kicCommandsMsg.addTextComponent(new TextComponent("\n&r&2&lKuudraiscool commands\n"))
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/kic settings\n").setHoverValue("&7Opens the settings menu"))
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/apikey <KIC api-key>\n").setHoverValue("&7Change/set your api key\n&7&o(Use your KIC api key, not Hypixel)"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/kuudra [player]\n").setHoverValue("&7Checks kuudra info\n&7Example: /kuudra rainbode"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/ap <attribute> [level] <attribute> [level]\n").setHoverValue("&7Checks the auctionhouse for current attribute prices\n&7Example: /ap ll mp"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/doogans\n").setHoverValue("&7Checks your entire party for soulflow and arrows"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/kuudraprofit edit/reset\n").setHoverValue("&7Change the position of the profit calc"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/runoverviewpreview\n").setHoverValue("&7Shows the current kuudra runoverview (if in run)"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/cancelrunoverview\n").setHoverValue("&7Cancels the current kuudra runoverview (if in run)"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/kic checkapikey\n").setHoverValue("&7Checks the status of your current api-key"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a/lf <player> <item>\n\n").setHoverValue(`&7Searches a player for a specific item\n&7Example 1: /lf ${playername} Hyperion\n&7Example 2: /lf ${playername} lore: Ability: Wither Impact`));
kicCommandsMsg.addTextComponent(new TextComponent("&r&2&lChat commands\n"));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .stats [player]\n").setHoverValue(`&a&lKuudra Stats\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .stats rainbode\n&r&9Party &8> &b[MVP&c+&b] ${playername}&f: &rLifeline: 70 | Mana pool: 70 | Magical power: 1682`));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .runs [player]\n").setHoverValue(`&a&lT5 Runs\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .runs rainbode\n&9Party &8> &b[MVP&c+&b] ${playername}&f: 10673 runs`));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .rtca [player]\n").setHoverValue(`&a&lRoad To Class Average\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .rtca rainbode\n&9Party &8> &b[MVP&c+&b] ${playername} &f: rainbode H: 802 - M: 72 - B: 512 - A: 702 - T: 181 (265h)`));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .ap <attribute> [level]\n").setHoverValue(`&a&lAttribute Price\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .ap mf 5\n&9Party &8> &b[MVP&c+&b] ${playername}&f: &rMagic Find 5 > Helmet: 5.40M - Cp: 5.22M - Legs: 5.00M - Boots: 4.85M - Neck: 6.00M - Cloak: 20.00M - Belt: 20.00M - Brace: 19.00M`));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .kick <player>\n").setHoverValue(`&a&lKick a player\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .kick SuuerSindre\n&9&m-----------------------------------------------------\n&b[MVP&r&c+&r&b] SuuerSindre &r&ehas been removed from the party.\n&9&m-----------------------------------------------------`));
kicCommandsMsg.addTextComponent(new TextComponent("&8* &a .cata [player]\n\n").setHoverValue(`&a&lCata Info\n\n&9Party &8> &b[MVP&0+&b] Wesleygame&f: .cata Wesleygame\n&9Party &8> &b[MVP&0+&b] Wesleygame&f: &rWesleygame's Cata: 48.77 - PB: 05:37:20 - MP: 1404 - Secrets: 28.51K&r`))
kicCommandsMsg.addTextComponent(new TextComponent("&2[] = optional &7| &2<> = required\n").setHoverValue("e"));

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

Settings.registerListener("Minimum T5 Completions", () => {
    if (isNaN(Settings.minT5Completions)) {
        delay(() => resetSettingsString(false), 2000);
        ChatLib.chat("t5")
    }
})
Settings.registerListener("Minimum Magical Power", () => {
    if (isNaN(Settings.minMagicalPower)) {
        delay(() => resetSettingsString(true), 2000);
        ChatLib.chat("mp")
    }
})
function resetSettingsString(type){
    type ? Settings.minMagicalPower = "0" : Settings.minT5Completions = "0";
}