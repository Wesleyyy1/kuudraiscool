import PogObject from "PogData";

export const kicData = new PogObject("kuudraiscool", {
    kuudraProfit: {
        x: 50,
        y: 50,
        scale: 1
    },
    kuudraReroll: {
        x: 50,
        y: 50,
        scale: 2.5
    },
    kuudraProfitTracker: {
        x: 50,
        y: 50,
        scale: 1
    },
    kuudraProfitTrackerData: {
        profit: 0,
        chests: 0,
        time: 0
    },
    containerValue: {
        x: 50,
        y: 50,
        scale: 1
    },
    testGui: {
        x: 50,
        y: 50,
        scale: 1
    },
    faction: "MAGE",
    firstChecks: true
}, "data/data.json");
kicData.autosave(5);
