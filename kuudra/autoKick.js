import Settings from "../settings/config.js";
import {delay, kicPrefix, parseShorthandNumber} from "../utils/generalUtils.js";
import Party from "../utils/Party.js";

const kuudraArmorTier = ["Infernal", "Fiery", "Burning", "Hot", "Basic", "None"];

export default function autoKick(lifeline, manapool, runs, magicalpower, ragnarock, chestplate, leggings, boots, player) {
    const adjustedArmor = [
        chestplate !== undefined && chestplate < kuudraArmorTier.length ? chestplate : kuudraArmorTier.length,
        leggings !== undefined && leggings < kuudraArmorTier.length ? leggings : kuudraArmorTier.length,
        boots !== undefined && boots < kuudraArmorTier.length ? boots : kuudraArmorTier.length
    ];

    const tierIndex = Math.max(...adjustedArmor) - 1;

    const minT5Completions = parseShorthandNumber(Settings.minT5Completions);
    const minMagicalPower = parseShorthandNumber(Settings.minMagicalPower);

    const criteria = [
        {condition: lifeline < Settings.minLifelineLevel, reason: `${lifeline}/${Settings.minLifelineLevel} lifeline`},
        {condition: manapool < Settings.minManapoolLevel, reason: `${manapool}/${Settings.minManapoolLevel} mana pool`},
        {condition: runs < minT5Completions, reason: `${runs}/${minT5Completions} runs`},
        {condition: magicalpower < minMagicalPower, reason: `${magicalpower}/${minMagicalPower} magical power`},
        {condition: ragnarock < Settings.minChimeraLevel, reason: `${ragnarock}/${Settings.minChimeraLevel} chimera`},
        {
            condition: tierIndex > Settings.minTerrorTier,
            reason: `Low tier terror [Has: ${kuudraArmorTier[tierIndex] || "None"}, Req: ${kuudraArmorTier[Settings.minTerrorTier] || "None"}]`
        }
    ];

    const failedCriteria = criteria
        .filter(({ condition }) => condition)
        .map(({ reason }) => reason);

    if (failedCriteria.length > 0) {
        const reasons = failedCriteria.join(", ");
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${reasons}`);
        ChatLib.command(`pc [KIC] ${player} kicked for: ${reasons}`);
        delay(() => ChatLib.command(`p kick ${player}`), 500);
    }
}

register("chat", function (username, event) {
    if (Settings.superSecretSettings && Settings.kuudraAutoKickTrimonu && username !== Player.getName() && Party.amILeader()) {
        ChatLib.chat(`${kicPrefix} &c${username} &2has been autokicked for using Trimonu!`);
        ChatLib.command(`pc ${username} kicked for using Trimonu`);
        delay(() => ChatLib.command(`p kick ${username}`), 500);
    }
}).setCriteria(/Party > (?:\[[^\]]+]\s*)?(\w+).*?: .*?✯ Opened.*/);