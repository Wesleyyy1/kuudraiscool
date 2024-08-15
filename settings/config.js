import { @Vigilant, @ButtonProperty, @TextProperty, @SwitchProperty, @SliderProperty, Color } from "Vigilance";

@Vigilant("kuudraiscool/data", "kuudraiscool", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Kuudra", "Chat Commands", "Dev", "Credits"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {

    // General

    @ButtonProperty({
        name: "&3Discord Server",
        description: "Join if you want to talk to us directly, report a bug or want to make a suggestion.",
        category: "General",
        placeholder: "Join"
    })
    Discord() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/gsz58gazAK"));
    };

    @TextProperty({
        name: "API Key",
        description: "Enter your kuudraiscool API key here",
        category: "General",
        placeholder: "No key set",
        protected: true,
    })
    apikey = "";

    @SwitchProperty({
        name: "MVP++ Emoji's",
        description: "Ability to send ++ emoji's without being ++.",
        category: "General",
    })
    emojis = false;

    // Kuudra

    @SwitchProperty({
        name: "Party Finder",
        description: "Toggle party finder stats",
        category: "Kuudra",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Toggle run overview",
        category: "Kuudra",
    })
    runoverview = true;

    // Chat commands

    @SwitchProperty({
        name: "Chat Commands",
        description: "Toggle chat commands",
        category: "Chat Commands",
    })
    chatcommands = false;

    @SwitchProperty({
        name: "Party Commands",
        description: "Toggle party commands",
        category: "Chat Commands",
    })
    partycommands = false;

    @SwitchProperty({
        name: "Dm Commands",
        description: "Toggle dm commands",
        category: "Chat Commands",
    })
    dmcommands = false;

    // Dev

    @SwitchProperty({
        name: "Draw with Shadow",
        description: "Option for rendering HUDS with text shadow",
        category: "Dev"
    })
    textShadow = false;

    @SwitchProperty({
        name: "Draw with Background",
        description: "Option for rendering HUDS with dark background",
        category: "Dev"
    })
    drawBackground = false;

    @SwitchProperty({
        name: "Kuudra Profit",
        description: "Kuudra Profit",
        category: "Dev"
    })
    kuudraProfit = false;

    @SwitchProperty({
        name: "Kuudra Profit Compact",
        description: "Kuudra Profit Compact",
        category: "Dev"
    })
    kuudraProfitCompact = false;

    @SliderProperty({
        name: "Minimum God Roll",
        description: `Set the minimum amount a attribute combo may be to be tracked as a godroll (in millions).`,
        category: "Dev",
        min: 0,
        max: 350
    })
    minGodroll = 50;

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

        this.setCategoryDescription("General", "&akuudraiscool&r &7- by &dWesley &7& &dAnthony");
        this.setCategoryDescription("Kuudra", "&akuudraiscool&r &7- by &dWesley &7& &dAnthony");
        this.setCategoryDescription("Chat Commands", "&akuudraiscool&r &7- by &dWesley &7& &dAnthony");
        this.setCategoryDescription("Credits", "&akuudraiscool&r &7- by &dWesley &7& &dAnthony");

        this.addDependency("Party Commands", "Chat Commands");
        this.addDependency("Dm Commands", "Chat Commands");
    }
}

export default new Settings();