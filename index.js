import Settings from "./settings/config.js";
import DevConfig from "./settings/devConfig.js";
import CustomizeSettings from "./settings/customizeConfig.js";
import {checkUpdate} from "./utils/updateChecker.js";
import {checkApiKey, checkApiPing, delay, getRoles, kicPrefix, setRegisters} from "./utils/generalUtils.js";
import {kicData} from "./utils/data.js";
import "./kuudra/runOverview.js";
import "./mvpEmoji.js";
import "./chatCommands.js";
import "./utils/World.js";
import "./kuudra/kuudraProfit.js";
import "./kuudra/kicAuction.js";
import "./kuudra/kuudraInfo.js";
import "./doogans.js";
import "./searchItem.js";

register("gameLoad", () => {
    kicData.firstChecks = true;
    kicData.save();
});

const firstChecksReg = register("worldLoad", () => {
    firstChecksReg.unregister();
    if (kicData.firstChecks) {
        setRegisters();
        delay(() => {
            checkApiKey(null, false);
            checkUpdate();
        }, 1000);
        kicData.firstChecks = false;
        kicData.save();
    }
});

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

register("command", () => ChatLib.command("joininstance KUUDRA_NORMAL")).setName("t1", true);
register("command", () => ChatLib.command("joininstance KUUDRA_HOT")).setName("t2", true);
register("command", () => ChatLib.command("joininstance KUUDRA_BURNING")).setName("t3", true);
register("command", () => ChatLib.command("joininstance KUUDRA_FIERY")).setName("t4", true);
register("command", () => ChatLib.command("joininstance KUUDRA_INFERNAL")).setName("t5", true);

register("command", () => {
    const roles = getRoles();
    if (roles.includes("DEV") || roles.includes("TESTER")) {
        DevConfig.openGUI();
    } else {
        ChatLib.chat(`${kicPrefix} &4&lYou are not allowed to use this!`);
    }
}).setName("kic-dev");

register("command", () => {
    const roles = getRoles();
    if (roles.includes("DEV") || roles.includes("TESTER")) {
        checkApiPing();
    } else {
        ChatLib.chat(`${kicPrefix} &4&lYou are not allowed to use this!`);
    }
}).setName("kic-dev-ping");

// Create the help message
const kicCommandsMsg = new Message();
const playername = Player.getName();

const commands = [
    {text: "\n&r&2&lKuudraiscool commands\n"},
    {text: "&8* &a/kic help\n", hover: "&7Shows this menu"},
    {text: "&8* &a/kic settings\n", hover: "&7Opens the settings menu"},
    {
        text: "&8* &a/apikey <KIC api-key>\n",
        hover: "&7Change/set your api key\n&7&o(Use your KIC api key, not Hypixel)"
    },
    {text: "&8* &a/kuudra [player]\n", hover: "&7Checks kuudra info\n&7Example: /kuudra rainbode"},
    {
        text: "&8* &a/ap <attribute> [level] [attribute] [level]\n",
        hover: "&7Checks the auctionhouse for current attribute prices\n&7Example: /ap ll mp"
    },
    {
        text: "&8* &a/ka <attribute> [level] [attribute] [level]\n",
        hover: "&7Opens a custom auction house GUI with current attribute prices\n&7Example: /ka ll mp"
    },
    {text: "&8* &a/doogans\n", hover: "&7Checks your entire party for soulflow and arrows"},
    {text: "&8* &a/kuudraprofit edit/reset\n", hover: "&7Change the position of the profit calc"},
    {text: "&8* &a/kuudrarerollnotifier edit/reset\n", hover: "&7Change the position of the profit calc"},
    {text: "&8* &a/kuudraprofittracker edit/reset\n", hover: "&7Change the position of the profit calc"},
    {text: "&8* &a/kicresetprofittracker\n", hover: "&7Reset the Kuudra Profit Tracker data"},
    {text: "&8* &a/addprofit <value>\n", hover: "&7Adds the value to the profit tracker"},
    {text: "&8* &a/removeprofit <value>\n", hover: "&7Removes the value from the profit tracker"},
    {text: "&8* &a/runoverviewpreview\n", hover: "&7Shows the current kuudra runoverview (if in run)"},
    {text: "&8* &a/cancelrunoverview\n", hover: "&7Cancels the current kuudra runoverview (if in run)"},
    {text: "&8* &a/kic checkapikey\n", hover: "&7Checks the status of your current api-key"},
    {
        text: `&8* &a/lf <player> <item>\n\n`,
        hover: `&7Searches a player for a specific item\n&7Example 1: /lf ${playername} Hyperion\n&7Example 2: /lf ${playername} lore: Ability: Wither Impact`
    },
    {text: "&r&2&lChat commands\n"},
    {
        text: "&8* &a .stats [player]\n",
        hover: `&a&lKuudra Stats\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .stats rainbode\n&r&9Party &8> &b[MVP&c+&b] ${playername}&f: Lifeline: 70 | Mana pool: 70 | Magical power: 1682`
    },
    {
        text: "&8* &a .runs [player]\n",
        hover: `&a&lT5 Runs\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .runs rainbode\n&9Party &8> &b[MVP&c+&b] ${playername}&f: 10673 runs`
    },
    {
        text: "&8* &a .rtca [player]\n",
        hover: `&a&lRoad To Class Average\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .rtca rainbode\n&9Party &8> &b[MVP&c+&b] ${playername} &f: rainbode H: 802 - M: 72 - B: 512 - A: 702 - T: 181 (265h)`
    },
    {
        text: "&8* &a .ap <attribute> [level]\n",
        hover: `&a&lAttribute Price\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .ap mf 5\n&9Party &8> &b[MVP&c+&b] ${playername}&f: Magic Find 5 > Helmet: 5.40M - Cp: 5.22M - Legs: 5.00M - Boots: 4.85M - Neck: 6.00M - Cloak: 20.00M - Belt: 20.00M - Brace: 19.00M`
    },
    {
        text: "&8* &a .kick <player>\n",
        hover: `&a&lKick a player\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .kick SuuerSindre\n&9&m-----------------------------------------------------\n&b[MVP&r&c+&r&b] SuuerSindre &r&ehas been removed from the party.\n&9&m-----------------------------------------------------`
    },
    {
        text: "&8* &a .cata [player]\n\n",
        hover: `&a&lCata Info\n\n&9Party &8> &b[MVP&0+&b] ${playername}&f: .cata Wesleygame\n&9Party &8> &b[MVP&0+&b] ${playername}&f: Wesleygame's Cata: 48.77 - PB: 05:37:20 - MP: 1404 - Secrets: 28.51K&r`
    },
    {text: "&8* &a .kic\n\n", hover: "&a&lSends kuudraiscool discord server link."},
    {text: "&2[] = optional &7| &2<> = required\n"},
];

commands.forEach((cmd) => {
    const textComponent = new TextComponent(cmd.text);
    if (cmd.hover) textComponent.setHoverValue(cmd.hover);
    kicCommandsMsg.addTextComponent(textComponent);
});

const kicCmdList = ["help", "apikey", "checkapikey", "t1", "t2", "t3", "t4", "t5", "settings", "customize"];

register("command", (...args) => {
    if (!args[0]) {
        Settings.openGUI();
        return;
    }
    switch (args[0]) {
        case "apikey":
            if (!args[1]) return ChatLib.chat(`${kicPrefix} &aUse /kic apikey <key>`);
            updateApiKey(args[1]);
            break;
        case "checkapikey":
            checkApiKey(null, true);
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
        case "customize":
            CustomizeSettings.openGUI();
            break;
        default:
            ChatLib.chat(kicCommandsMsg);
            break;
    }
}).setTabCompletions((args) => {
    if (args.length > 1) return [];
    let lastArg = args[args.length - 1].toLowerCase();
    return kicCmdList.filter(cmd => cmd.toLowerCase().startsWith(lastArg));
}).setName("kuudraiscool", true).setAliases("kic");
