import PogObject from "PogData";

export const kicData = new PogObject("kuudraiscool", {
    kuudraProfit: {
        x: 50,
        y: 50,
        scale: 1
    }
}, "data/data.json");
kicData.autosave(5);
