import {@Vigilant, @ButtonProperty, @TextProperty, @SwitchProperty, @SliderProperty, @SelectorProperty} from "../../Vigilance/index.js";

const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;
const playername = Player.getName();

@Vigilant("kuudraiscool/data", "Settings", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Kuudra", "Chat Commands", "Overlay", "Super Secret", "Credits"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {

    // General

    @ButtonProperty({
        name: "&3Discord Server",
        description: "Join our Discord server to talk to us directly, report bugs, or make suggestions.",
        category: "General",
        placeholder: "Join"
    })
    Discord() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/gsz58gazAK"));
    };

    @TextProperty({
        name: "API Key",
        description: "Enter your KuudraIsCool API key here.",
        category: "General",
        placeholder: "No key set",
        protected: true,
    })
    apikey = "";

    @SwitchProperty({
        name: "MVP++ Emojis",
        description: "Allows sending MVP++ emojis without having MVP++.",
        category: "General",
    })
    emojis = false;

    @SwitchProperty({
        name: "Doogans",
        description: "Show missing arrows + soulflow for all users in party after dungeon run ends.",
        category: "General",
    })
    doogans = false;

    @SwitchProperty({
        name: "Disable Pre-Release message",
        description: "Disable the pre-release message sent on login.",
        category: "General",
    })
    disablePreReleaseMSG = false;

    // Kuudra - 1. Kuudra

    @SwitchProperty({
        name: "Party Finder",
        description: "Toggle Party Finder stats.",
        subcategory: "1. Kuudra",
        category: "Kuudra",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Toggle the Run Overview display.",
        subcategory: "1. Kuudra",
        category: "Kuudra",
    })
    runoverview = false;

    // Kuudra - 2. Autokick

    @SwitchProperty({
        name: "AutoKick",
        description: "Automatically kicks people who do not meet the set requirements.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "2. AutoKick"
    })
    kuudraAutoKick = false;

    @SliderProperty({
        name: "Minimum Lifeline level",
        description: "Set the minimum level of lineline.",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        min: 0,
        max: 70
    })
    minLifelineLevel = 50;

    @SliderProperty({
        name: "Minimum Mana pool level",
        description: "Set the minimum level of mana pool.",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        min: 0,
        max: 70
    })
    minManapoolLevel = 40;

    @TextProperty({
        name: "Minimum T5 Completions",
        description: "Set the minimum for T5 Completions.",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        placeholder: "0",
    })
    minT5Completions = "900";

    @TextProperty({
        name: "Minimum Magical Power",
        description: "Set the minimum for magical power.",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        placeholder: "0",
    })
    minMagicalPower = "1250";

    @SliderProperty({
        name: "Minimum Chimera level",
        description: "Set the minimum chimera level for ragnarok axe.",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        min: 0,
        max: 5
    })
    minChimeraLevel = 2;

    @SelectorProperty({
        name: "Minimum Terror tier",
        description: "Sets the minimum terror armor tier",
        category: "Kuudra",
        subcategory: "2. AutoKick",
        options: ["Infernal", "Fiery", "Burning", "Hot", "Basic"]
    })
    minTerrorTier = 1;

    @SwitchProperty({
        name: "AutoKick Trimonu users",
        description: "Automatically kicks people who use Trimonu.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "2. AutoKick"
    })
    kuudraAutoKickTrimonu = false;

    // Kuudra - 3. AP&KA

    @SliderProperty({
        name: "Auctions per item in /ap and /ka",
        description: "The max amount of auctions to show per item. Default: 10",
        category: "Kuudra",
        subcategory: "3. AP&KA",
        min: 1,
        max: 28
    })
    apAuctionLimit = 10;

    @SwitchProperty({
        name: "Auto re-open GUI after buying an item",
        description: "Automatically opens up the KIC-Auction GUI whenever you buy an item from it.",
        category: "Kuudra",
        subcategory: "3. AP&KA"
    })
    openKAGUIAgain = true;

    @SwitchProperty({
        name: "Use a default attribute level",
        description: "Use a default attribute level when opening kic auction without a level parameter.",
        category: "Kuudra",
        subcategory: "3. AP&KA"
    })
    kaUseDefaultAttributeLvl = false;

    @SliderProperty({
        name: "Default Attribute Level",
        description: "The attribute level to be used when opening kic auction without a level parameter.",
        category: "Kuudra",
        subcategory: "3. AP&KA",
        min: 1,
        max: 10
    })
    kaDefaultAttributeLvl = 5;

    // Kuudra - 4. Chest Profit

    @SwitchProperty({
        name: "Kuudra Profit",
        description: "Toggle Kuudra Profit display.",
        category: "Kuudra",
        subcategory: "4. Chest Profit"
    })
    kuudraProfit = false;

    @ButtonProperty({
        name: "Move Kuudra Profit GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "4. Chest Profit",
        placeholder: "Click!"
    })
    kuudraProfitGui() {
        ChatLib.command("kuudraprofit", true)
    }

    @SwitchProperty({
        name: "Kuudra Profit Compact",
        description: "Display the profit in a compact layout.",
        category: "Kuudra",
        subcategory: "4. Chest Profit"
    })
    kuudraProfitCompact = true;

    @SwitchProperty({
        name: "Ignore essence value",
        description: "Exclude the value of essence from profit calculations.",
        category: "Kuudra",
        subcategory: "4. Chest Profit"
    })
    ignoreEssence = false;

    @SwitchProperty({
        name: "Ignore teeth value",
        description: "Exclude the value of teeth from profit calculations.",
        category: "Kuudra",
        subcategory: "4. Chest Profit"
    })
    ignoreTeeth = false;

    @SwitchProperty({
        name: "Use sell order price",
        description: "Calculate profit based on the sell order price (ON) or the instant sell price (OFF).",
        category: "Kuudra",
        subcategory: "4. Chest Profit"
    })
    sellOrderPrice = true;

    // Kuudra - 5. Reroll Display

    @SwitchProperty({
        name: "Reroll Notifier",
        description: "Shows a message when you should reroll a chest. (Price of a kismet > total profit of the first 2 slots).",
        category: "Kuudra",
        subcategory: "5. Reroll Display"
    })
    kuudraRerollNotifier = false;

    @ButtonProperty({
        name: "Move Reroll Notifier GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "5. Reroll Display",
        placeholder: "Click!"
    })
    kuudraRerollNotifierGui() {
        ChatLib.command("kuudrarerollnotifier", true)
    }

    // Kuudra - 6. Profit Tracker

    @SwitchProperty({
        name: "Kuudra Profit Tracker",
        description: "Toggle Kuudra Profit Tracker display.",
        category: "Kuudra",
        subcategory: "6. Profit Tracker"
    })
    kuudraProfitTracker = false;

    @ButtonProperty({
        name: "Move Kuudra Profit Tracker GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "6. Profit Tracker",
        placeholder: "Click!"
    })
    kuudraProfitTrackerGui() {
        ChatLib.command("kuudraprofittracker", true)
    }

    @ButtonProperty({
        name: "Reset Profit Tracker Data",
        description: "Click to reset the data.",
        category: "Kuudra",
        subcategory: "6. Profit Tracker",
        placeholder: "Click!"
    })
    kuudraResetProfitTracker() {
        ChatLib.command("kicresetprofittracker", true)
    }

    @ButtonProperty({
        name: "Customize Colors",
        description: "Click to open the main customization settings.",
        category: "Kuudra",
        subcategory: "6. Profit Tracker",
        placeholder: "Click!"
    })
    kuudraProfitTrackerColor() {
        ChatLib.command("kic customize", true)
    }

    // Kuudra - 7. Auto Paid Chest

    @SwitchProperty({
        name: "Auto reroll Paid Chest",
        description: "Automatically reroll the Paid Chest if the price of a kismet > total profit of the first 2 slots.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest"
    })
    kuudraAutoReroll = false;

    @SwitchProperty({
        name: "Only auto reroll in T5",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest"
    })
    kuudraAutoRerollT5Only = true;

    @ButtonProperty({
        name: "Customize Failsafes",
        description: "Click to open the main customization settings.",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest",
        placeholder: "Click!"
    })
    kuudraAutoRerollFailsafes() {
        ChatLib.command("kic customize", true)
    }

    @SwitchProperty({
        name: "Auto buy Paid Chest",
        description: "Automatically buy the paid chest if it is profit.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest"
    })
    kuudraAutoBuy = false;

    @TextProperty({
        name: "Minimum Total Profit for auto buy",
        description: "Set the minimum total profit required to auto buy the chest. (Set to 0 to turn off)",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest",
        placeholder: "1",
    })
    kuudraAutoBuyMinProfit = "0";

    @SwitchProperty({
        name: "Always auto buy",
        description: "Ignore profit and always buy the chest.",
        category: "Kuudra",
        subcategory: "7. Auto Paid Chest"
    })
    kuudraAlwaysAutoBuy = false;

    // Chat commands

    @SwitchProperty({
        name: "Party Commands",
        description: "Toggle party commands.",
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommands = false;

    @SwitchProperty({
        name: "Party > .runs",
        description: `&a&lT5 Runs\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .runs rainbode\n&9Party &8> &b[MVP&c+&b] ${playername}&f: 10673 runs`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandRuns = true;

    @SwitchProperty({
        name: "Party > .stats",
        description: `&a&lKuudra Stats\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .stats rainbode\n&r&9Party &8> &b[MVP&c+&b] ${playername}&f: Lifeline: 70 | Mana pool: 70 | Magical power: 1682`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandStats = true;

    @SwitchProperty({
        name: "Party > .rtca",
        description: `&a&lRoad To Class Average\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .rtca rainbode\n&9Party &8> &b[MVP&c+&b] ${playername} &f: rainbode H: 802 - M: 72 - B: 512 - A: 702 - T: 181 (265h)`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandRtca = true;

    @SwitchProperty({
        name: "Party > .ap",
        description: `&a&lAttribute Price\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .ap mf 5\n&9Party &8> &b[MVP&c+&b] ${playername}&f: Magic Find 5 > Helmet: 5.40M - Cp: 5.22M - Legs: 5.00M - Boots: 4.85M - Neck: 6.00M - Cloak: 20.00M - Belt: 20.00M - Brace: 19.00M`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandAp = true;

    @SwitchProperty({
        name: "Party > .kick",
        description: `&a&lKick a player\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .kick SuuerSindre\n&9&m-----------------------------------------------------\n&b[MVP&r&c+&r&b] SuuerSindre &r&ehas been removed from the party.\n&9&m-----------------------------------------------------`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandKick = false;

    @SwitchProperty({
        name: "Party > .cata",
        description: `&a&lCata Info\n\n&9Party &8> &b[MVP&c+&b] ${playername}&f: .cata Wesleygame\n&9Party &8> &b[MVP&c+&b] ${playername}&f: Wesleygame's Cata: 48.77 - PB: 05:37:20 - MP: 1404 - Secrets: 28.51K&r`,
        category: "Chat Commands",
        subcategory: "1. Party Commands",
    })
    partyCommandCata = true;

    @SwitchProperty({
        name: "Dm Commands",
        description: "Toggle DM commands.",
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommands = false;

    @SwitchProperty({
        name: "Dm > .runs",
        description: `&a&lKuudra Stats\n\n&dFrom &b[MVP&0+&b] Wesleygame&f: .runs rainbode\n&dTo &b[MVP&0+&b] Wesleygame&f: Lifeline: 70 | Mana pool: 70 | Magical power: 1682`,
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommandRuns = true;

    @SwitchProperty({
        name: "Dm > .stats",
        description: `&a&lT5 Runs\n\n&dFrom &b[MVP&0+&b] Wesleygame&f: .stats rainbode\n&dTo &b[MVP&0+&b] Wesleygame&f: 10673 runs`,
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommandStats = true;

    @SwitchProperty({
        name: "Dm > .rtca",
        description: `&a&lRoad To Class Average\n\n&dFrom &b[MVP&0+&b] Wesleygame&f: .rtca rainbode\n&dTo &b[MVP&0+&b] Wesleygame&f: rainbode H: 802 - M: 72 - B: 512 - A: 702 - T: 181 (265h)`,
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommandRtca = true;

    @SwitchProperty({
        name: "Dm > .ap",
        description: `&a&lAttribute Price\n\n&dFrom &b[MVP&0+&b] Wesleygame&f: .ap mf 5\n&dTo &b[MVP&0+&b] Wesleygame&f: Magic Find 5 > Helmet: 5.40M - Cp: 5.22M - Legs: 5.00M - Boots: 4.85M - Neck: 6.00M - Cloak: 20.00M - Belt: 20.00M - Brace: 19.00M`,
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommandAp = true;

    @SwitchProperty({
        name: "Dm > .cata",
        description: `&a&lCata Info\n\n&dFrom &b[MVP&0+&b] Wesleygame&f: .cata Wesleygame\n&dTo &b[MVP&0+&b] Wesleygame&f: Wesleygame's Cata: 48.77 - PB: 05:37:20 - MP: 1404 - Secrets: 28.51K&r`,
        category: "Chat Commands",
        subcategory: "2. Dm Commands",
    })
    dmCommandCata = true;

    // Overlay

    @SwitchProperty({
        name: "Draw with Shadow",
        description: "Toggle rendering HUDS with text shadow",
        category: "Overlay"
    })
    textShadow = true;

    @SwitchProperty({
        name: "Draw with Background",
        description: "Toggle rendering HUDS with a dark background.",
        category: "Overlay"
    })
    drawBackground = true;

    // Super Secret

    @SwitchProperty({
        name: "Enable Super Secret Settings",
        description: "Enable &4&lUSE AT YOUR OWN RISK!&r settings.",
        category: "Super Secret"
    })
    superSecretSettings = false;

    // Credits

    @ButtonProperty({
        name: "&a&lWesley",
        description: "Developer",
        category: "Credits",
        placeholder: " "
    })
    wesley() { };

    @ButtonProperty({
        name: "&a&lAnthony",
        description: "Developer",
        category: "Credits",
        placeholder: " "
    })
    anthony() { };

    @ButtonProperty({
        name: "&d&lRain",
        description: "Special",
        category: "Credits",
        placeholder: " "
    })
    rain() { };

    @ButtonProperty({
        name: "&b&lChatTriggers Discord",
        description: "General code help. Filled with a bunch of really cool people who have helped us tremendously with a lot of CT related stuff.",
        category: "Credits",
        placeholder: " "
    })
    ctdiscord() { };

    constructor() {
        this.initialize(this);

        this.setCategoryDescription("General", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Kuudra", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Chat Commands", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Super Secret", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony &7- &4&lUSE AT YOUR OWN RISK!`);
        this.setCategoryDescription("Credits", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);

        this.addDependency("Kuudra Profit Compact", "Kuudra Profit");
        this.addDependency("Move Kuudra Profit GUI", "Kuudra Profit");
        this.addDependency("Ignore essence value", "Kuudra Profit");
        this.addDependency("Ignore teeth value", "Kuudra Profit");
        this.addDependency("Use sell order price", "Kuudra Profit");

        this.addDependency("Kuudra Profit Tracker", "Kuudra Profit");
        this.addDependency("Reroll Notifier", "Kuudra Profit");
        this.addDependency("Auto reroll Paid Chest", "Kuudra Profit");
        this.addDependency("Auto buy Paid Chest", "Kuudra Profit");

        this.addDependency("Move Kuudra Profit Tracker GUI", "Kuudra Profit Tracker");
        this.addDependency("Reset Profit Tracker Data", "Kuudra Profit Tracker");
        this.addDependency("Customize Colors", "Kuudra Profit Tracker");

        this.addDependency("Move Reroll Notifier GUI", "Reroll Notifier");

        this.addDependency("Customize Failsafes", "Auto reroll Paid Chest");

        this.addDependency("AutoKick", "Enable Super Secret Settings");
        this.addDependency("AutoKick Trimonu users", "Enable Super Secret Settings");
        this.addDependency("Minimum Lifeline level", "AutoKick");
        this.addDependency("Minimum Mana pool level", "AutoKick");
        this.addDependency("Minimum T5 Completions", "AutoKick");
        this.addDependency("Minimum Magical Power", "AutoKick");
        this.addDependency("Minimum Chimera level", "AutoKick");
        this.addDependency("Minimum Terror tier", "AutoKick");

        this.addDependency("Auto reroll Paid Chest", "Enable Super Secret Settings");
        this.addDependency("Only auto reroll in T5", "Auto reroll Paid Chest");
        this.addDependency("Auto buy Paid Chest", "Enable Super Secret Settings");
        this.addDependency("Minimum Total Profit for auto buy", "Auto buy Paid Chest");
        this.addDependency("Always auto buy", "Auto buy Paid Chest");

        this.addDependency("Party > .runs", "Party Commands");
        this.addDependency("Party > .stats", "Party Commands");
        this.addDependency("Party > .rtca", "Party Commands");
        this.addDependency("Party > .ap", "Party Commands");
        this.addDependency("Party > .kick", "Party Commands");
        this.addDependency("Party > .cata", "Party Commands");

        this.addDependency("Dm > .runs", "Dm Commands");
        this.addDependency("Dm > .stats", "Dm Commands");
        this.addDependency("Dm > .rtca", "Dm Commands");
        this.addDependency("Dm > .ap", "Dm Commands");
        this.addDependency("Dm > .cata", "Dm Commands");

        this.addDependency("Default Attribute Level", "Use a default attribute level");
    }
}

export default new Settings();