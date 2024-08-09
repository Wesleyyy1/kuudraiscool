import axios from "axios";
import Settings from "./settings/config.js";
import { fixNumber, decompress, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg } from "./utils/generalUtils.js";
import Party from "./utils/Party.js";

let message = [];

function checkParty() {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    const party = Object.keys(Party.members);
    if (party.length == 0) {
        ChatLib.chat("&7[&a&lKIC&r&7]&r &cYou are currently not in a party!");
        return;
    }

    party.forEach(player => {
        axios.get(`https://api.sm0kez.com/hypixel/profile/${player}/selected`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)",
                "API-Key": Settings.apikey
            }
        })
            .then(response => {
                const data = response.data;

                if (data.success) {
                    processPlayerData(data);
                } else {
                    message.push(`${player} -> INVALID`);
                }

                checkCompleted();
            })
            .catch(error => {
                message.push(`${player} -> ERROR`);
                checkCompleted();
                if (!error.isAxiosError || error.code == 500) {
                    errorHandler(`Error while getting profile data for ${player}`, error.message, "doogans.js", `User: ${player}`);
                }
            });
    });
}

function processPlayerData(data) {
    const { name, uuid, members } = data;
    const memberData = members[uuid];

    let arrows = 0;
    const data = memberData.inventory?.bag_contents?.quiver?.data;
    if (data) {
        const quiver = decompress(data);

        if (quiver) {
            for (let i = 0; i < quiver.func_74745_c(); i++) {
                let item = quiver.func_150305_b(i);
                if (!item) continue;

                let count = new NBTTagCompound(item).getByte("Count") || 1;
                arrows += count;
            }
        }
    }

    const soulflow = memberData.item_data?.soulflow || 0;

    let enoughArrows = arrows >= 433 || !arrows ? true : `GET ARROWS (${(arrows / 2880 * 100).toFixed(2)}%)`;
    let enoughSoulflow = soulflow >= 501 ? true : `GET SOULFLOW (${fixNumber(soulflow)})`;

    if (enoughArrows !== true || enoughSoulflow !== true) {
        message.push(`${name} -> ${[enoughArrows, enoughSoulflow].filter(msg => msg !== true).join(" + ")}`);
    } else {
        message.push(`${name} -> OK`)
    }
}

function checkCompleted() {
    if (message.length == Object.keys(Party.members).length) {
        ChatLib.chat(message.join(" | "));
        message = [];
    }
}

export default checkParty;
