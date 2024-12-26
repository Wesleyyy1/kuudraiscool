import { @Vigilant, @ButtonProperty, @TextProperty, @SwitchProperty, @SliderProperty, @SelectorProperty, Color } from "Vigilance";
const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;
import { COLORS } from "../utils/constants";
const colorKeys = Object.keys(COLORS);

@Vigilant("kuudraiscool/data", "kuudraiscool", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Kuudra", "Chat Commands", "Overlay", "Colors", "Attributes", "Super Secret", "Dev", "Credits"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    },
    getSubcategoryComparator: () => (a, b) => {
        const subcategories = ["Kuudra", "Chest Profit", "Profit Tracker", "Reroll Display", "AP&KA", "AutoKick", "Auto Paid Chest", "Profit Tracker Colors"];

        return subcategories.indexOf(a.getValue()[0].attributesExt.subcategory) -
            subcategories.indexOf(b.getValue()[0].attributesExt.subcategory);
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

    // Kuudra

    @SwitchProperty({
        name: "Party Finder",
        description: "Toggle Party Finder stats.",
        subcategory: "Kuudra",
        category: "Kuudra",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Toggle the Run Overview display.",
        subcategory: "Kuudra",
        category: "Kuudra",
    })
    runoverview = true;

    // Kuudra - Chest Profit

    @SwitchProperty({
        name: "Kuudra Profit",
        description: "Toggle Kuudra Profit display.",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    kuudraProfit = false;

    @ButtonProperty({
        name: "Move Kuudra Profit GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "Chest Profit",
        placeholder: "Click!"
    })
    kuudraProfitGui() {
        ChatLib.command("kuudraprofit", true)
    }

    @SwitchProperty({
        name: "Kuudra Profit Compact",
        description: "Display the profit in a compact layout.",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    kuudraProfitCompact = true;

    @SliderProperty({
        name: "Minimum God Roll",
        description: "Set the minimum value for an attribute combination to be tracked as a godroll (in millions).",
        category: "Kuudra",
        subcategory: "Chest Profit",
        min: 0,
        max: 350
    })
    minGodroll = 50;

    @SwitchProperty({
        name: "Ignore essence value",
        description: "Exclude the value of essence from profit calculations.",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    ignoreEssence = false;

    @SwitchProperty({
        name: "Ignore teeth value",
        description: "Exclude the value of teeth from profit calculations (based on Tabasco 3 books).",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    ignoreTeeth = false;

    @SwitchProperty({
        name: "Use sell order price",
        description: "Calculate profit based on the sell order price (ON) or the instant sell price (OFF).",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    sellOrderPrice = true;

    // Kuudra - Profit Tracker

    @SwitchProperty({
        name: "Kuudra Profit Tracker",
        description: "Toggle Kuudra Profit Tracker display.",
        category: "Kuudra",
        subcategory: "Profit Tracker"
    })
    kuudraProfitTracker = false;

    @ButtonProperty({
        name: "Move Kuudra Profit Tracker GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "Profit Tracker",
        placeholder: "Click!"
    })
    kuudraProfitTrackerGui() {
        ChatLib.command("kuudraprofittracker", true)
    }

    @ButtonProperty({
        name: "Reset Profit Tracker Data",
        description: "Click to reset the data.",
        category: "Kuudra",
        subcategory: "Profit Tracker",
        placeholder: "Click!"
    })
    kuudraResetProfitTracker() {
        ChatLib.command("kicresetprofittracker", true)
    }

    // Kuudra - Reroll Display

    @SwitchProperty({
        name: "Reroll Notifier",
        description: "Shows a message when you should reroll a chest. (Price of a kismet > total profit of the first 2 slots).",
        category: "Kuudra",
        subcategory: "Reroll Display"
    })
    kuudraRerollNotifier = true;

    @ButtonProperty({
        name: "Move Reroll Notifier GUI",
        description: "Click to edit the GUI location.",
        category: "Kuudra",
        subcategory: "Reroll Display",
        placeholder: "Click!"
    })
    kuudraRerollNotifierGui() {
        ChatLib.command("kuudrarerollnotifier", true)
    }

    // Kuudra - AP and KA

    @SliderProperty({
        name: "Auctions per item in /ap and /ka",
        description: "The max amount of auctions to show per item.",
        category: "Kuudra",
        subcategory: "AP&KA",
        min: 1,
        max: 28
    })
    apAuctionLimit = 5;

    @SwitchProperty({
        name: "Auto re-open GUI after buying an item",
        description: "Automatically opens up the KIC-Auction GUI whenever you buy an item from it.",
        category: "Kuudra",
        subcategory: "AP&KA"
    })
    openKAGUIAgain = false;

    @SwitchProperty({
        name: "Use a default attribute level",
        description: "Use a default attribute level when opening kic auction without a level parameter.",
        category: "Kuudra",
        subcategory: "AP&KA"
    })
    kaUseDefaultAttributeLvl = false;

    @SliderProperty({
        name: "Default Attribute Level",
        description: "The attribute level to be used when opening kic auction without a level parameter.",
        category: "Kuudra",
        subcategory: "AP&KA",
        min: 1,
        max: 10
    })
    kaDefaultAttributeLvl = 5;

    // Kuudra - Autokick

    @SwitchProperty({
        name: "AutoKick",
        description: "Automatically kicks people who do not meet the set requirements.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "AutoKick"
    })
    kuudraAutoKick = false;

    @SliderProperty({
        name: "Minimum Lifeline level",
        description: "Set the minimum level of lineline.",
        category: "Kuudra",
        subcategory: "AutoKick",
        min: 0,
        max: 70
    })
    minLifelineLevel = 0;

    @SliderProperty({
        name: "Minimum Mana pool level",
        description: "Set the minimum level of mana pool.",
        category: "Kuudra",
        subcategory: "AutoKick",
        min: 0,
        max: 70
    })
    minManapoolLevel = 0;

    @TextProperty({
        name: "Minimum T5 Completions",
        description: "Set the minimum for T5 Completions.",
        category: "Kuudra",
        subcategory: "AutoKick",
        placeholder: "0",
    })
    minT5Completions = "0";

    @TextProperty({
        name: "Minimum Magical Power",
        description: "Set the minimum for magical power.",
        category: "Kuudra",
        subcategory: "AutoKick",
        placeholder: "0",
    })
    minMagicalPower = "0";

    @SliderProperty({
        name: "Minimum Chimera level",
        description: "Set the minimum chimera level for ragnarok axe.",
        category: "Kuudra",
        subcategory: "AutoKick",
        min: 0,
        max: 5
    })
    minChimeraLevel = 0;

    @SelectorProperty({
        name: "Minimum Terror tier",
        description: "Sets the minimum terror armor tier",
        category: "Kuudra",
        subcategory: "AutoKick",
        options: ["Infernal", "Fiery", "Burning", "Hot", "Basic"]
    })
    minTerrorTier = 4;

    @SwitchProperty({
        name: "AutoKick Trimonu users",
        description: "Automatically kicks people who use Trimonu.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "AutoKick"
    })
    kuudraAutoKickTrimonu = false;

    // Kuudra - Auto Paid Chest

    @SwitchProperty({
        name: "Auto reroll Paid Chest",
        description: "Automatically reroll the Paid Chest if the profit is less than a kismet feather.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "Auto Paid Chest"
    })
    kuudraAutoReroll = false;

    @SwitchProperty({
        name: "Auto buy Paid Chest",
        description: "Automatically buy the paid chest if it is profit.\n&4&lUSE AT YOUR OWN RISK!",
        category: "Kuudra",
        subcategory: "Auto Paid Chest"
    })
    kuudraAutoBuy = false;

    // Chat commands

    @SwitchProperty({
        name: "Chat Commands",
        description: "Toggle chat commands.",
        category: "Chat Commands",
    })
    chatcommands = false;

    @SwitchProperty({
        name: "Party Commands",
        description: "Toggle party commands.",
        category: "Chat Commands",
    })
    partycommands = false;

    @SwitchProperty({
        name: "Dm Commands",
        description: "Toggle DM commands.",
        category: "Chat Commands",
    })
    dmcommands = false;

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

    // Colors

    @SelectorProperty({
        name: "Profit Color",
        category: "Colors",
        subcategory: "Profit Tracker Colors",
        options: colorKeys
    })
    ProfitTrackerColorProfit = colorKeys.indexOf("LIGHT_PURPLE");

    @SelectorProperty({
        name: "Chests Color",
        category: "Colors",
        subcategory: "Profit Tracker Colors",
        options: colorKeys
    })
    ProfitTrackerColorChests = colorKeys.indexOf("LIGHT_PURPLE");

    @SelectorProperty({
        name: "Average Color",
        category: "Colors",
        subcategory: "Profit Tracker Colors",
        options: colorKeys
    })
    ProfitTrackerColorAverage = colorKeys.indexOf("LIGHT_PURPLE");

    @SelectorProperty({
        name: "Time Color",
        category: "Colors",
        subcategory: "Profit Tracker Colors",
        options: colorKeys
    })
    ProfitTrackerColorTime = colorKeys.indexOf("LIGHT_PURPLE");

    @SelectorProperty({
        name: "Rate Color",
        category: "Colors",
        subcategory: "Profit Tracker Colors",
        options: colorKeys
    })
    ProfitTrackerColorRate = colorKeys.indexOf("LIGHT_PURPLE");

    // Attributes

    @SwitchProperty({
        name: "Arachno",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    arachno = false;

    @SwitchProperty({
        name: "Attack Speed",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    attackSpeed = false;

    @SwitchProperty({
        name: "Blazing",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    blazing = false;

    @SwitchProperty({
        name: "Combo",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    combo = false;

    @SwitchProperty({
        name: "Elite",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    elite = false;

    @SwitchProperty({
        name: "Ender",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    ender = false;

    @SwitchProperty({
        name: "Ignition",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    ignition = false;

    @SwitchProperty({
        name: "Life Recovery",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    lifeRecovery = false;

    @SwitchProperty({
        name: "Mana Steal",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    manaSteal = false;

    @SwitchProperty({
        name: "Midas Touch",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    midasTouch = false;

    @SwitchProperty({
        name: "Undead",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    undead = false;

    @SwitchProperty({
        name: "Warrior",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    warrior = false;

    @SwitchProperty({
        name: "Deadeye",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    deadeye = false;

    @SwitchProperty({
        name: "Arachno Resistance",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    arachnoResistance = false;

    @SwitchProperty({
        name: "Blazing Resistance",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    blazingResistance = false;

    @SwitchProperty({
        name: "Breeze",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    breeze = false;

    @SwitchProperty({
        name: "Dominance",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    dominance = false;

    @SwitchProperty({
        name: "Ender Resistance",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    enderResistance = false;

    @SwitchProperty({
        name: "Experience",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    experience = false;

    @SwitchProperty({
        name: "Fortitude",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    fortitude = false;

    @SwitchProperty({
        name: "Life Regeneration",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    lifeRegeneration = false;

    @SwitchProperty({
        name: "Lifeline",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    lifeline = false;

    @SwitchProperty({
        name: "Magic Find",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    magicFind = false;

    @SwitchProperty({
        name: "Mana Pool",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    manaPool = false;

    @SwitchProperty({
        name: "Mana Regeneration",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    manaRegeneration = false;

    @SwitchProperty({
        name: "Vitality",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    vitality = false;

    @SwitchProperty({
        name: "Speed",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    speed = false;

    @SwitchProperty({
        name: "Undead Resistance",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    undeadResistance = false;

    @SwitchProperty({
        name: "Veteran",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    veteran = false;

    @SwitchProperty({
        name: "Blazing Fortune",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    blazingFortune = false;

    @SwitchProperty({
        name: "Fishing Experience",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    fishingExperience = false;

    @SwitchProperty({
        name: "Infection",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    infection = false;

    @SwitchProperty({
        name: "Double Hook",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    doubleHook = false;

    @SwitchProperty({
        name: "Fisherman",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    fisherman = false;

    @SwitchProperty({
        name: "Fishing Speed",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    fishingSpeed = false;

    @SwitchProperty({
        name: "Hunter",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    hunter = false;

    @SwitchProperty({
        name: "Trophy Hunter",
        category: "Attributes",
        subcategory: "Failsafe"
    })
    trophyHunter = false;

    // Super Secret

    @SwitchProperty({
        name: "Enable Super Secret Settings",
        description: "Enable &4&lUSE AT YOUR OWN RISK!&r settings.",
        category: "Super Secret"
    })
    superSecretSettings = false;

    // Dev

    @SwitchProperty({
        name: "Enable KIC debug messages",
        category: "Dev"
    })
    kicDebug = false;

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
        name: "&d&lrain",
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

        this.setCategoryDescription("Colors", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Attributes", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);

        this.setSubcategoryDescription("Attributes", "Failsafe", "&aAttributes that should never be rerolled");

        this.addDependency("Kuudra Profit Compact", "Kuudra Profit");
        this.addDependency("Move Kuudra Profit GUI", "Kuudra Profit");
        this.addDependency("Minimum God Roll", "Kuudra Profit");
        this.addDependency("Ignore essence value", "Kuudra Profit");
        this.addDependency("Ignore teeth value", "Kuudra Profit");
        this.addDependency("Use sell order price", "Kuudra Profit");

        this.addDependency("Kuudra Profit Tracker", "Kuudra Profit");
        this.addDependency("Reroll Notifier", "Kuudra Profit");
        this.addDependency("Auto reroll Paid Chest", "Kuudra Profit");
        this.addDependency("Auto buy Paid Chest", "Kuudra Profit");

        this.addDependency("Move Kuudra Profit Tracker GUI", "Kuudra Profit Tracker");
        this.addDependency("Reset Profit Tracker Data", "Kuudra Profit Tracker");
        this.addDependency("Move Reroll Notifier GUI", "Reroll Notifier");

        this.addDependency("AutoKick", "Enable Super Secret Settings");
        this.addDependency("AutoKick Trimonu users", "Enable Super Secret Settings");
        this.addDependency("Minimum Lifeline level", "AutoKick");
        this.addDependency("Minimum Mana pool level", "AutoKick");
        this.addDependency("Minimum T5 Completions", "AutoKick");
        this.addDependency("Minimum Magical Power", "AutoKick");
        this.addDependency("Minimum Chimera level", "AutoKick");
        this.addDependency("Minimum Terror tier", "AutoKick");

        this.addDependency("Profit Color", "Kuudra Profit Tracker");
        this.addDependency("Chests Color", "Kuudra Profit Tracker");
        this.addDependency("Average Color", "Kuudra Profit Tracker");
        this.addDependency("Time Color", "Kuudra Profit Tracker");
        this.addDependency("Rate Color", "Kuudra Profit Tracker");

        this.addDependency("Auto reroll Paid Chest", "Enable Super Secret Settings");
        this.addDependency("Auto buy Paid Chest", "Enable Super Secret Settings");

        this.addDependency("Party Commands", "Chat Commands");
        this.addDependency("Dm Commands", "Chat Commands");

        this.addDependency("Default Attribute Level", "Use a default attribute level");

        this.addDependency("Arachno", "Auto reroll Paid Chest");
        this.addDependency("Attack Speed", "Auto reroll Paid Chest");
        this.addDependency("Blazing", "Auto reroll Paid Chest");
        this.addDependency("Combo", "Auto reroll Paid Chest");
        this.addDependency("Elite", "Auto reroll Paid Chest");
        this.addDependency("Ender", "Auto reroll Paid Chest");
        this.addDependency("Ignition", "Auto reroll Paid Chest");
        this.addDependency("Life Recovery", "Auto reroll Paid Chest");
        this.addDependency("Mana Steal", "Auto reroll Paid Chest");
        this.addDependency("Midas Touch", "Auto reroll Paid Chest");
        this.addDependency("Undead", "Auto reroll Paid Chest");
        this.addDependency("Warrior", "Auto reroll Paid Chest");
        this.addDependency("Deadeye", "Auto reroll Paid Chest");
        this.addDependency("Arachno Resistance", "Auto reroll Paid Chest");
        this.addDependency("Blazing Resistance", "Auto reroll Paid Chest");
        this.addDependency("Breeze", "Auto reroll Paid Chest");
        this.addDependency("Dominance", "Auto reroll Paid Chest");
        this.addDependency("Ender Resistance", "Auto reroll Paid Chest");
        this.addDependency("Experience", "Auto reroll Paid Chest");
        this.addDependency("Fortitude", "Auto reroll Paid Chest");
        this.addDependency("Life Regeneration", "Auto reroll Paid Chest");
        this.addDependency("Lifeline", "Auto reroll Paid Chest");
        this.addDependency("Magic Find", "Auto reroll Paid Chest");
        this.addDependency("Mana Pool", "Auto reroll Paid Chest");
        this.addDependency("Mana Regeneration", "Auto reroll Paid Chest");
        this.addDependency("Vitality", "Auto reroll Paid Chest");
        this.addDependency("Speed", "Auto reroll Paid Chest");
        this.addDependency("Undead Resistance", "Auto reroll Paid Chest");
        this.addDependency("Veteran", "Auto reroll Paid Chest");
        this.addDependency("Blazing Fortune", "Auto reroll Paid Chest");
        this.addDependency("Fishing Experience", "Auto reroll Paid Chest");
        this.addDependency("Infection", "Auto reroll Paid Chest");
        this.addDependency("Double Hook", "Auto reroll Paid Chest");
        this.addDependency("Fisherman", "Auto reroll Paid Chest");
        this.addDependency("Fishing Speed", "Auto reroll Paid Chest");
        this.addDependency("Hunter", "Auto reroll Paid Chest");
        this.addDependency("Trophy Hunter", "Auto reroll Paid Chest");
    }
}

export default new Settings();