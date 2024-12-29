import { @Vigilant, @SwitchProperty, @SelectorProperty } from "Vigilance";
const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;
import { COLORS } from "../utils/constants";
const colorKeys = Object.keys(COLORS);

@Vigilant("kuudraiscool/data", "Customize Settings")
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
        category: "Failsafe",
        subcategory: "Attributes"
    })
    arachno = false;

    @SwitchProperty({
        name: "Attack Speed",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    attackSpeed = false;

    @SwitchProperty({
        name: "Blazing",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    blazing = false;

    @SwitchProperty({
        name: "Combo",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    combo = false;

    @SwitchProperty({
        name: "Elite",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    elite = false;

    @SwitchProperty({
        name: "Ender",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    ender = false;

    @SwitchProperty({
        name: "Ignition",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    ignition = false;

    @SwitchProperty({
        name: "Life Recovery",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    lifeRecovery = false;

    @SwitchProperty({
        name: "Mana Steal",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    manaSteal = false;

    @SwitchProperty({
        name: "Midas Touch",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    midasTouch = false;

    @SwitchProperty({
        name: "Undead",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    undead = false;

    @SwitchProperty({
        name: "Warrior",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    warrior = false;

    @SwitchProperty({
        name: "Deadeye",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    deadeye = false;

    @SwitchProperty({
        name: "Arachno Resistance",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    arachnoResistance = false;

    @SwitchProperty({
        name: "Blazing Resistance",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    blazingResistance = false;

    @SwitchProperty({
        name: "Breeze",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    breeze = false;

    @SwitchProperty({
        name: "Dominance",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    dominance = false;

    @SwitchProperty({
        name: "Ender Resistance",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    enderResistance = false;

    @SwitchProperty({
        name: "Experience",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    experience = false;

    @SwitchProperty({
        name: "Fortitude",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    fortitude = false;

    @SwitchProperty({
        name: "Life Regeneration",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    lifeRegeneration = false;

    @SwitchProperty({
        name: "Lifeline",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    lifeline = false;

    @SwitchProperty({
        name: "Magic Find",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    magicFind = false;

    @SwitchProperty({
        name: "Mana Pool",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    manaPool = false;

    @SwitchProperty({
        name: "Mana Regeneration",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    manaRegeneration = false;

    @SwitchProperty({
        name: "Vitality",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    vitality = false;

    @SwitchProperty({
        name: "Speed",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    speed = false;

    @SwitchProperty({
        name: "Undead Resistance",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    undeadResistance = false;

    @SwitchProperty({
        name: "Veteran",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    veteran = false;

    @SwitchProperty({
        name: "Blazing Fortune",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    blazingFortune = false;

    @SwitchProperty({
        name: "Fishing Experience",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    fishingExperience = false;

    @SwitchProperty({
        name: "Infection",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    infection = false;

    @SwitchProperty({
        name: "Double Hook",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    doubleHook = false;

    @SwitchProperty({
        name: "Fisherman",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    fisherman = false;

    @SwitchProperty({
        name: "Fishing Speed",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    fishingSpeed = false;

    @SwitchProperty({
        name: "Hunter",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    hunter = false;

    @SwitchProperty({
        name: "Trophy Hunter",
        category: "Failsafe",
        subcategory: "Attributes"
    })
    trophyHunter = false;

    constructor() {
        this.initialize(this);

        this.setCategoryDescription("Colors", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony`);
        this.setCategoryDescription("Failsafe", `&akuudraiscool v${currentVers}&r &7- by &dWesley &7& &dAnthony\n\n&r&aWheel Of Fate, Burning Kuudra Core, Enrager, Tentacle Dye, Fatal Tempo and Inferno are never rerolled!`);

        this.setSubcategoryDescription("Failsafe", "Attributes", "&aAttributes that should never be rerolled");
    }
}

export default new CustomizeSettings();