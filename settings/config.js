import { @Vigilant, @ButtonProperty, @TextProperty, @SwitchProperty, @SliderProperty, @SelectorProperty, Color } from "Vigilance";
const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;

@Vigilant("kuudraiscool/data", "kuudraiscool", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Kuudra", "Chat Commands", "Overlay", "Credits"];
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

    // Kuudra

    @SwitchProperty({
        name: "Party Finder",
        description: "Toggle Party Finder stats.",
        category: "Kuudra",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Toggle the Run Overview display.",
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
    ignoreTeeth = true;

    @SwitchProperty({
        name: "Use sell order price",
        description: "Calculate profit based on the sell order price (ON) or the instant sell price (OFF).",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    sellOrderPrice = true;

    @SwitchProperty({
        name: "(TEMP) Key type",
        description: "Use barbarian (ON) or mage (OFF) key price in the profit calculation.",
        category: "Kuudra",
        subcategory: "Chest Profit"
    })
    barbKey = true;

    // Kuudra - Autokick

    @SwitchProperty({
        name: "AutoKick",
        description: "Automatically kicks people who do not meet the set requirements. \n&4&lUSE AT YOUR OWN RISK!",
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
    textShadow = false;

    @SwitchProperty({
        name: "Draw with Background",
        description: "Toggle rendering HUDS with a dark background.",
        category: "Overlay"
    })
    drawBackground = false;

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
        name: "&d&lSuuerSindre",
        description: "Special",
        category: "Credits",
        placeholder: " "
    })
    suuersindre() { };

    @ButtonProperty({
        name: "&b&lChatTriggers Discord",
        description: "General code help. Filled with a bunch of really cool people who have helped me tremendously with a lot of CT related stuff.",
        category: "Credits",
        placeholder: " "
    })
    ctdiscord() { };

    constructor() {
        this.initialize(this);

        this.setCategoryDescription("General", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Kuudra", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Chat Commands", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Credits", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);

        this.addDependency("Kuudra Profit Compact", "Kuudra Profit");
        this.addDependency("Move Kuudra Profit GUI", "Kuudra Profit");
        this.addDependency("Minimum God Roll", "Kuudra Profit");
        this.addDependency("Ignore essence value", "Kuudra Profit");
        this.addDependency("Ignore teeth value", "Kuudra Profit");
        this.addDependency("Use sell order price", "Kuudra Profit");
        this.addDependency("(TEMP) Key type", "Kuudra Profit");

        this.addDependency("Minimum Lifeline level", "AutoKick");
        this.addDependency("Minimum Mana pool level", "AutoKick");
        this.addDependency("Minimum T5 Completions", "AutoKick");
        this.addDependency("Minimum Magical Power", "AutoKick");
        this.addDependency("Minimum Chimera level", "AutoKick");
        this.addDependency("Minimum Terror tier", "AutoKick");

        this.addDependency("Party Commands", "Chat Commands");
        this.addDependency("Dm Commands", "Chat Commands");
    }
}

export default new Settings();