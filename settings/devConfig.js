import {@Vigilant, @SwitchProperty} from "Vigilance";

const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;

@Vigilant("kuudraiscool/data", "Developer Settings")
class DeveloperSettings {
    @SwitchProperty({
        name: "Enable KIC debug messages",
        category: "General"
    })
    kicDebug = false;

    @SwitchProperty({
        name: "Disable Dev message",
        description: "Disable the dev message sent on login.",
        category: "General",
    })
    disableDevMSG = false;

    constructor() {
        this.initialize(this);

        this.setCategoryDescription("General", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
    }
}

export default new DeveloperSettings();