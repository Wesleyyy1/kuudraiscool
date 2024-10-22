import Settings from "../settings/config.js";
import { kicPrefix } from "./generalUtils.js";

export default function autoKick(lifeline, manapool, runs, magicalpower, ragnarock, chestplate, leggings, boots, player) {

    const minT5Completions = parseInt(Settings.minT5Completions, 10);
    const minMagicalPower = parseInt(Settings.minMagicalPower, 10);

    if (Settings.minLifelineLevel > lifeline) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${lifeline}/${Settings.minLifelineLevel} lifeline`);
        ChatLib.command(`p kick ${player}`);
    } else if (Settings.minManapoolLevel > manapool) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${manapool}/${Settings.minManapoolLevel} mana pool`);
        ChatLib.command(`p kick ${player}`);
    } else if (minT5Completions > runs) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${runs}/${minT5Completions} runs`);
        ChatLib.command(`p kick ${player}`);
    } else if (minMagicalPower > magicalpower) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${magicalpower}/${minMagicalPower} magical power`);
        ChatLib.command(`p kick ${player}`);
    } else if (Settings.minChimeraLevel > ragnarock) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${ragnarock}/${Settings.minChimeraLevel} chimera`);
        ChatLib.command(`p kick ${player}`);
    } else if (Settings.minTerrorTier + 1 < chestplate || Settings.minTerrorTier + 1 < leggings || Settings.minTerrorTier + 1 < boots) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &clow tier terror`);
        ChatLib.command(`p kick ${player}`);
    }
}
