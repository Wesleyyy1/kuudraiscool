import Settings from "../settings/config.js";
import { delay, kicPrefix } from "../utils/generalUtils.js";
import Party from "../utils/Party.js";

export default function autoKick(lifeline, manapool, runs, magicalpower, ragnarock, chestplate, leggings, boots, player) {
    const criteria = [
        { condition: lifeline < Settings.minLifelineLevel, reason: `${lifeline}/${Settings.minLifelineLevel} lifeline` },
        { condition: manapool < Settings.minManapoolLevel, reason: `${manapool}/${Settings.minManapoolLevel} mana pool` },
        { condition: runs < parseInt(Settings.minT5Completions, 10), reason: `${runs}/${Settings.minT5Completions} runs` },
        { condition: magicalpower < parseInt(Settings.minMagicalPower, 10), reason: `${magicalpower}/${Settings.minMagicalPower} magical power` },
        { condition: ragnarock < Settings.minChimeraLevel, reason: `${ragnarock}/${Settings.minChimeraLevel} chimera` },
        {
            condition: chestplate <= Settings.minTerrorTier || leggings <= Settings.minTerrorTier || boots <= Settings.minTerrorTier,
            reason: `low tier terror`
        }
    ];

    const failedCriteria = criteria.find(({ condition }) => condition);

    if (failedCriteria) {
        ChatLib.chat(`${kicPrefix} &c${player} &2has been autokicked for: &c${failedCriteria.reason}`);
        ChatLib.command(`pc ${player} kicked for: ${failedCriteria.reason}`);
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