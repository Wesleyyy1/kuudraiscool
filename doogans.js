import axios from "axios";
import Settings from "./settings/config.js";
import { fixNumber, decompress, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, kicPrefix } from "./utils/generalUtils.js";
import Party from "./utils/Party.js";

let msgData = {};

function checkParty() {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    const party = Object.keys(Party.members);
    if (party.length == 0) {
        ChatLib.chat(`${kicPrefix} &cYou are currently not in a party!`);
        return;
    }

    msgData = {
        messages: [],
        checked: 0
    };

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
                    msgData.messages.push(`&a${player} &f-> &7INVALID`);
                    msgData.checked++;
                }

                checkCompleted();
            })
            .catch(error => {
                msgData.messages.push(`&a${player} &f-> &7ERROR`);
                msgData.checked++;
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

    const quiverData = memberData.inventory?.bag_contents?.quiver?.data;
    const soulflow = memberData.item_data?.soulflow || 0;
    let arrows = 0;
    let quiver = null;

    if (data) {
        quiver = decompress(quiverData);
        if (quiver) {
            for (let i = 0; i < quiver.func_74745_c(); i++) {
                const item = quiver.func_150305_b(i);
                if (item) {
                    arrows += new NBTTagCompound(item).getByte("Count") || 1;
                }
            }
        }
    }

    if (!soulflow || !quiverData || !quiver) {
        msgData.messages.push(`&a${name} &f-> &7API OFF`);
        msgData.checked++;
        return;
    }

    let enoughArrows = arrows >= 433 || !arrows ? true : `GET ARROWS (&c${(arrows / 2880 * 100).toFixed(2)}%&7)`;
    let enoughSoulflow = soulflow >= 501 ? true : `GET SOULFLOW (&c${fixNumber(soulflow)}&7)`;

    if (enoughArrows !== true || enoughSoulflow !== true) {
        msgData.messages.push(`&a${name} &f-> &7${[enoughArrows, enoughSoulflow].filter(msg => msg !== true).join(" + ")}`);
        msgData.checked++;
    } else {
        msgData.checked++;
    }
}

function checkCompleted() {
    if (msgData.checked == Object.keys(Party.members).length) {
        const msg = new Message();

        msg.addTextComponent("&2&m-----&f[- &2doogans &f-]&2&m-----\n");

        if (msgData.messages.length == 0) {
            msg.addTextComponent("&aAll party members have sufficient soulflow and arrows!");
        } else {
            msg.addTextComponent("&cThe following members have issues:\n\n");
            msgData.messages.forEach(message => {
                msg.addTextComponent(new TextComponent(`${message}\n`).setClick("run_command", `/ct copy ${ChatLib.removeFormatting(message)}`));
            });
        }

        msg.addTextComponent("&2&m-----------------------");

        ChatLib.chat(msg);
    }
}

export default checkParty;
