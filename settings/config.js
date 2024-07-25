import { @Vigilant, @ButtonProperty, @TextProperty, @SwitchProperty, Color } from "Vigilance";

@Vigilant("kuudraiscool/data", "kuudraiscool", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Credits"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {

    // General

    @ButtonProperty({
        name: "&3&lDiscord Server",
        description: "Join if you want to talk to us directly, report a bug or want to make a suggestion.",
        category: "General",
        placeholder: "Join"
    })
    Discord() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/gsz58gazAK"))
    }
    
    @TextProperty({
        name: "API Key",
        description: "Enter your kuudraiscool API key here",
        category: "General",
        placeholder: "No key set",
        protected: true,
    })
    apikey = "";

    @SwitchProperty({
        name: "Party Finder",
        description: "Toggle party finder stats",
        category: "General",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Toggle run overview",
        category: "General",
    })
    runoverview = true;

    @SwitchProperty({
        name: "Party Commands",
        description: "Toggle party commands",
        category: "General",
    })
    partycommands = true;


    // Credits

    @ButtonProperty({
        name: "&a&lWesley",
        description: "Developer",
        category: "Credits",
        placeholder: " "
    })
    wesley() {};

    @ButtonProperty({
        name: "&a&lAnthony",
        description: "Developer",
        category: "Credits",
        placeholder: " "
    })
    anthony() {};

    @ButtonProperty({
        name: "&d&lChatTriggers Discord",
        description: "General code help. Filled with a bunch of really cool people who have helped me tremendously with a lot of CT related stuff.",
        category: "Credits",
        placeholder: " "
    })
    ctdiscord() {};

    constructor() {
        this.initialize(this);
    }
}

export default new Settings();