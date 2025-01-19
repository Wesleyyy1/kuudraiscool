import {@Vigilant, @SwitchProperty, @SelectorProperty} from "../../Vigilance/index.js";
import {COLORS} from "../utils/constants.js";

const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;
const colorKeys = Object.keys(COLORS);

@Vigilant("kuudraiscool/data/customize", "Customize Settings")
class CustomizeSettings {
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
        category: "Failsafes",
        subcategory: "Attributes"
    })
    arachno = false;

    @SwitchProperty({
        name: "Attack Speed",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    attackSpeed = false;

    @SwitchProperty({
        name: "Blazing",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    blazing = false;

    @SwitchProperty({
        name: "Combo",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    combo = false;

    @SwitchProperty({
        name: "Elite",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    elite = false;

    @SwitchProperty({
        name: "Ender",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    ender = false;

    @SwitchProperty({
        name: "Ignition",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    ignition = false;

    @SwitchProperty({
        name: "Life Recovery",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    lifeRecovery = false;

    @SwitchProperty({
        name: "Mana Steal",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    manaSteal = false;

    @SwitchProperty({
        name: "Midas Touch",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    midasTouch = false;

    @SwitchProperty({
        name: "Undead",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    undead = false;

    @SwitchProperty({
        name: "Warrior",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    warrior = false;

    @SwitchProperty({
        name: "Deadeye",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    deadeye = false;

    @SwitchProperty({
        name: "Arachno Resistance",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    arachnoResistance = false;

    @SwitchProperty({
        name: "Blazing Resistance",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    blazingResistance = false;

    @SwitchProperty({
        name: "Breeze",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    breeze = false;

    @SwitchProperty({
        name: "Dominance",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    dominance = true;

    @SwitchProperty({
        name: "Ender Resistance",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    enderResistance = false;

    @SwitchProperty({
        name: "Experience",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    experience = false;

    @SwitchProperty({
        name: "Fortitude",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    fortitude = false;

    @SwitchProperty({
        name: "Life Regeneration",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    lifeRegeneration = false;

    @SwitchProperty({
        name: "Lifeline",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    lifeline = true;

    @SwitchProperty({
        name: "Magic Find",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    magicFind = true;

    @SwitchProperty({
        name: "Mana Pool",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    manaPool = true;

    @SwitchProperty({
        name: "Mana Regeneration",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    manaRegeneration = true;

    @SwitchProperty({
        name: "Vitality",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    vitality = true;

    @SwitchProperty({
        name: "Speed",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    speed = false;

    @SwitchProperty({
        name: "Undead Resistance",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    undeadResistance = false;

    @SwitchProperty({
        name: "Veteran",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    veteran = true;

    @SwitchProperty({
        name: "Blazing Fortune",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    blazingFortune = true;

    @SwitchProperty({
        name: "Fishing Experience",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    fishingExperience = true;

    @SwitchProperty({
        name: "Infection",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    infection = false;

    @SwitchProperty({
        name: "Double Hook",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    doubleHook = true;

    @SwitchProperty({
        name: "Fisherman",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    fisherman = false;

    @SwitchProperty({
        name: "Fishing Speed",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    fishingSpeed = true;

    @SwitchProperty({
        name: "Hunter",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    hunter = false;

    @SwitchProperty({
        name: "Trophy Hunter",
        category: "Failsafes",
        subcategory: "Attributes"
    })
    trophyHunter = true;

    constructor() {
        this.initialize(this);

        this.setCategoryDescription("Colors", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Failsafes", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony\n\n&r&a&lWheel Of Fate, Burning Kuudra Core, Enrager, Tentacle Dye, Fatal Tempo and Inferno are never rerolled!`);

        this.setSubcategoryDescription("Failsafes", "Attributes", "&aAttributes that should never be rerolled");
    }
}

export default new CustomizeSettings();