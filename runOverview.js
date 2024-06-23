import { fixNumber } from './utils/generalUtils.js';
import Settings from "./settings/config.js";

let runoverview = Settings.runoverview;
let stopExecution = false;
let inOverview = false;
let rawStartTime, rawEndTime, startTime, endTime;
let member_one = `&cNo player found`;
let member_two = `&cNo player found`;
let member_three = `&cNo player found`;
let member_four = `&cNo player found`;
let party = [];
let yCheck = false;
let timerStart = 0;
let dps = 0;

const handlers = {
    mainHandler: null,
    yCheckHandler1: null,
    yCheckHandler2: null,
    completionHandler: null,
    cancelHandler: null,
    tabListHandler: null,
};

function startRunOverview(callback) {
    const playername = Player.getName();
    stopExecution = false;
    inOverview = true;
    ChatLib.chat("&r");
    ChatLib.chat("&aRun overview has started!");
    ChatLib.chat("&r&r");
    rawStartTime = Date.now();
    let turnonTablistCheck = false;
    let supplies = 0;

    try {
        handlers.mainHandler = register('chat', (msg) => {
            if (msg.includes("sayhello")) {
                console.log("TRIGGER: sayhello");
                ChatLib.chat("Hello there!");
            } else if (msg.startsWith("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!")) {
                console.log("TRIGGER: start");
                startTime = Date.now();
            } else if (msg.trim().startsWith("KUUDRA DOWN!")) {
                console.log("TRIGGER: end");
                endTime = Date.now();
                unregisterHandlers();
                callback();
            } else if (msg.includes("is now ready!")) {
                if (!turnonTablistCheck) {
                    turnonTablistCheck = true;
                }
                console.log("TRIGGER: GET PLAYER");
                const playername = msg.split(" ")[0];
                if (!party.some(entry => entry.player === playername)) {
                    party.push({ player: playername, deaths: 0, supplies: 0, supplytimes: `&r` });
                }
            } else if (msg.startsWith(" ☠")) {
                console.log("TRIGGER: CHECK DEATHS");
                let playername = msg.replace(" ☠ ", "").split(" ")[0].trim();
                if (playername === "You") {
                    playername = Player.getName();
                }
                const player = party.find(entry => entry.player === playername);
                if (player) player.deaths++;
            } else if (msg.includes("recovered one of Elle's supplies!")) {
                console.log("TRIGGER: CHECK SUPPLIES");
                let playername = msg.split(" ")[0];
                if (playername.includes("[")) {
                    playername = msg.split(" ")[1];
                }
                supplies++;
                const Time = Date.now() - startTime;
                const Timeminutes = Math.floor(Time / 60000);
                const Timeseconds = Math.floor((Time % 60000) / 1000);
                const Timemilliseconds = Math.floor((Time % 1000) / 10);
                const TimeformattedTime = `${Timeminutes}:${Timeseconds}.${Timemilliseconds.toString().padStart(2, '0')}`;
                const player = party.find(entry => entry.player === playername);
                if (player) {
                    player.supplies++;
                    player.supplytimes += `&8#${supplies} &a${TimeformattedTime}\n`;
                }
            } else if (msg.includes("forcestop") && msg.includes(`${playername}:`)) {
                unregisterHandlers();
                callback();
            }
        }).setCriteria("${msg}");
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    try {
        handlers.yCheckHandler1 = register("chat", () => {
            yCheck = true;
        }).setCriteria("[NPC] Elle: I knew you could do it!");
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    try {
        handlers.yCheckHandler2 = register("step", () => {
            if (!yCheck) return;
            if (Math.round(Player.getY()) < 69) {
                timerStart = Date.now() / 1000;
                yCheck = false;
            }
        });
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    try {
        handlers.completionHandler = register("chat", () => {
            let timerStop = Date.now() / 1000;
            dps = fixNumber(300000000 / (timerStop - timerStart));
        }).setCriteria("Percentage Complete: ").setContains();
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    try {
        handlers.cancelHandler = register('command', () => {
            if (!inOverview) return;
            ChatLib.chat("&cCanceled the run overview");
            unregisterHandlers();
            callback();
        }).setName('cancelrunoverview', true);
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    try {
        handlers.tabListHandler = register("tick", () => {
            if (!World.isLoaded() || !turnonTablistCheck) return;
            if (!TabList.getNames().join(' ').includes("Kuudra")) {
                console.log("TRIGGER: END VIA TL");
                unregisterHandlers();
                callback();
            }
        });
    } catch (e) {
        console.error(`Error: ${e}`);
    }

    if (stopExecution) {
        unregisterHandlers();
        callback();
    }
}

function unregisterHandlers() {
    rawEndTime = Date.now();
    endTime = Date.now();
    Object.values(handlers).forEach(handler => handler?.unregister());
    stopExecution = false;
    inOverview = false;
    dps = 0;
    yCheck = false;
}

register('chat', (msg) => {
    const playername = Player.getName();
    if (!runoverview) return;
    if ((msg.includes("forcestart") && msg.includes(`${playername}`)) || msg.includes("[NPC] Elle: Talk with me to begin!")) {
        if (!stopExecution && !inOverview) {
            startRunOverview(() => {
                const rawTime = rawEndTime - rawStartTime;
                const runTime = endTime - startTime;
                const formatTime = time => {
                    const minutes = Math.floor(time / 60000);
                    const seconds = Math.floor((time % 60000) / 1000);
                    const milliseconds = Math.floor((time % 1000) / 10);
                    return `${minutes}:${seconds}.${milliseconds.toString().padStart(2, '0')}`;
                };

                const rawTimeformattedTime = formatTime(rawTime);
                const runTimeformattedTime = formatTime(runTime);

                [member_one, member_two, member_three, member_four] = party.map((member, i) => (
                    new Message(new TextComponent(`&8> &a${member.player} &4${member.deaths} ☠ &f- &6${member.supplies} Supply`)
                        .setHoverValue(`&a&lSupply times:\n\n${member.supplytimes}`))
                ));

                setTimeout(() => {
                    ChatLib.chat("&b&m--------------------");
                    ChatLib.chat("&9&lRUN OVERVIEW");
                    ChatLib.chat(`&r`);
                    ChatLib.chat(`&9Party:`);
                    ChatLib.chat(member_one || `&cNo player found`);
                    ChatLib.chat(member_two || `&cNo player found`);
                    ChatLib.chat(member_three || `&cNo player found`);
                    ChatLib.chat(member_four || `&cNo player found`);
                    ChatLib.chat(`&r&r`);
                    ChatLib.chat(`&9Times & DPS:`);
                    ChatLib.chat(`&8* &aRun time: &f${runTimeformattedTime}`);
                    ChatLib.chat(`&8* &aRaw time: &f${rawTimeformattedTime}`);
                    ChatLib.chat(`&8* &aDPS: &f${dps}`);
                    ChatLib.chat("&b&m--------------------");
                    party = [];
                    dps = 0;
                    member_one = `&cNo player found`;
                    member_two = `&cNo player found`;
                    member_three = `&cNo player found`;
                    member_four = `&cNo player found`;
                }, 500);
            });
        } else {
            ChatLib.chat("Run already started!");
        }
    }
}).setCriteria("${msg}");

register('command', () => {
    ChatLib.chat("&b&m--------------------");
    ChatLib.chat("&9&lRUN OVERVIEW");
    ChatLib.chat(`&r`);
    ChatLib.chat(`&9Party:`);
    ChatLib.chat(`&8> &aSuuerSindre: &44 ☠ &f- &60 Supplies`);
    ChatLib.chat(`&8> &aHelletGT: &40 ☠ &f- &63 Supplies`);
    ChatLib.chat(`&8> &aWesleygame: &41 ☠ &f- &62 Supplies`);
    ChatLib.chat(`&8> &acatgirlrain: &40 ☠ &f- &61 Supplies`);
    ChatLib.chat(`&r&r`);
    ChatLib.chat(`&9Times:`);
    ChatLib.chat(`&8* &aRun time: &f1:46.02`);
    ChatLib.chat(`&8* &aRaw time: &f1:52.13`);
    ChatLib.chat("&b&m--------------------");
}).setName('runoverviewpreview', true);

function updateRunoverview() {
    runoverview = Settings.runoverview;
}

export default updateRunoverview;
