import { @Vigilant, @TextProperty, @SwitchProperty, Color } from 'Vigilance';

@Vigilant("kuudraiscool")
class Settings {
    @TextProperty({
        name: "API Key",
        description: "Enter your API key here",
        category: "General",
        placeholder: "No key set",
        protected: true,
    })
    apikey = "";

    @SwitchProperty({
        name: "Party Finder",
        description: "Enable party finder stats",
        category: "General",
    })
    partyfinder = true;

    @SwitchProperty({
        name: "Run Overview",
        description: "Enable run overview",
        category: "General",
    })
    runoverview = true;

    @SwitchProperty({
        name: "Party Commands",
        description: "Enable party commands",
        category: "General",
    })
    partycommands = true;

    constructor() {
        this.initialize(this);
    }
}

export default new Settings();