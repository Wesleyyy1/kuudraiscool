import axios from "axios";
import Settings from "./settings/config.js";
import {
    decompress,
    errorHandler,
    fixNumber,
    getRoles,
    isKeyValid,
    kicDebugMsg,
    kicPrefix,
    showInvalidReasonMsg,
    showMissingRolesMsg
} from "./utils/generalUtils.js";
import Party from "./utils/Party.js";

let messages = [];

function checkParty() {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    if (!Party.inParty()) {
        ChatLib.chat(`${kicPrefix} &cYou are currently not in a party!`);
        return;
    }

    messages = [];

    let checked = 0;

    kicDebugMsg(`Checking players (${Party.members.length || 0}): ${Party.members.join(", ") || ""}`);

    Party.members.forEach((player) => {
        fetchPlayerData(player, (message) => {
            if (message) messages.push(message);
            checked++;

            if (checked === Party.members.length) {
                displayResults();
            }
        });
    });
}

function fetchPlayerData(player, callback) {
    axios.get(`https://api.sm0kez.com/hypixel/profile/${player}/selected`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey,
        },
    })
        .then((response) => {
            const data = response.data;

            if (data.success) {
                callback(processPlayerData(data));
            } else {
                callback(`&a${data.name} &f-> &7INVALID`);
            }
        })
        .catch((error) => {
            callback(`&a${player} &f-> &7ERROR`);
            if (!error.isAxiosError || error.code === 500) {
                errorHandler(`Error while getting profile data for ${player}`, error.message, "doogans.js", `UUID: ${player}`);
            }
        });
}

function processPlayerData(data) {
    const {name, uuid, members} = data;
    const memberData = members[uuid];

    const quiverData = memberData.inventory?.bag_contents?.quiver?.data;
    const soulflow = memberData.item_data?.soulflow || 0;

    let arrows = 0;
    if (quiverData) {
        const quiver = decompress(quiverData);
        for (let i = 0; i < quiver.func_74745_c(); i++) {
            const item = quiver.func_150305_b(i);
            if (item) {
                arrows += new NBTTagCompound(item).getByte("Count") || 1;
            }
        }
    }

    if (!soulflow || !quiverData) {
        return `&a${name} &f-> &7API OFF`;
    }

    const issues = [];
    if (arrows < 433) {
        issues.push(`GET ARROWS (&c${(arrows / 2880 * 100).toFixed(2)}%&7)`);
    }
    if (soulflow < 501) {
        issues.push(`GET SOULFLOW (&c${fixNumber(soulflow)}&7)`);
    }

    if (issues.length > 0) {
        return `&a${name} &f-> &7${issues.join(" + ")}`;
    }

    return null;
}

function displayResults() {
    const msg = new Message();
    msg.addTextComponent("&2&m------&f[- &2doogans &f-]&2&m------\n");

    if (messages.length === 0) {
        msg.addTextComponent("&aAll party members have sufficient soulflow and arrows!");
    } else {
        msg.addTextComponent("&cThe following members have issues:\n\n");
        messages.forEach((message) => {
            msg.addTextComponent(
                new TextComponent(`${message}\n`).setClick("run_command", `/ct copy ${ChatLib.removeFormatting(message)}`)
            );
        });
    }

    msg.addTextComponent("&2&m-----------------------");
    ChatLib.chat(msg);
}

register("chat", (msg) => {
    const unformatted = ChatLib.removeFormatting(msg).trim();
    if (unformatted.startsWith("Team Score:")) {
        checkParty();
    }
}).setCriteria("${msg}");

register("command", () => {
    checkParty();
}).setName("doogans", true);
