import { fixNumber, errorHandler } from './utils/generalUtils.js';
import Settings from "./settings/config.js";

let inOverview = false;
let rawStartTime, rawEndTime, startTime, endTime;
let party = [];
let timerStart = 0;
let dps = 0;
let mainHandler = null;
let checksHandler = null;
let worldHandler = null;

function startRunOverview(callback) {
    inOverview = true;
    ChatLib.chat("\n&aRun overview has started!\n");
    rawStartTime = Date.now();
    let supplies = 0;
    let worldCheck = false;
    let yCheck = false;

    try {
        mainHandler = register('chat', (msg) => {
            if (msg.startsWith("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!")) {
                console.log("TRIGGER: start");
                startTime = Date.now();
            } else if (msg.trim().startsWith("KUUDRA DOWN!")) {
                console.log("TRIGGER: end");
                endTime = Date.now();
                unregisterHandlers();
                callback();
            } else if (msg.includes("is now ready!")) {
                if (!worldCheck) {
                    worldCheck = true;
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
            } else if (msg.includes("forcestop") && msg.includes(`${Player.getName()}:`)) {
                unregisterHandlers();
                callback();
            } else if (msg.startsWith("[NPC] Elle: I knew you could do it!")) {
                yCheck = true;
            } else if (msg.includes("Percentage Complete: ")) {
                let timerStop = Date.now() / 1000;
                dps = fixNumber(300000000 / (timerStop - timerStart));
            }
        }).setCriteria("${msg}");

        checksHandler = register("tick", () => {
            if (yCheck) {
                if (Math.round(Player.getY()) < 69) {
                    timerStart = Date.now() / 1000;
                    yCheck = false;
                }
            }
        });

        worldHandler = register("worldLoad", () => {
            if (worldCheck) {
                console.log("TRIGGER: END VIA WL");
                unregisterHandlers();
                callback();
            }
        });
    } catch (error) {
        unregisterHandlers();
        errorHandler('Error while getting run info', error, 'runOverview.js');
    }
}

function unregisterHandlers() {
    mainHandler?.unregister();
    checksHandler?.unregister();
    worldHandler?.unregister();
    rawEndTime = Date.now();
    endTime = Date.now();
    inOverview = false;
}

function formatTime(time) {
    if (!time) return;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes}:${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}

register('command', () => {
    if (!inOverview) return;
    ChatLib.chat("&cCanceled the run overview");
    unregisterHandlers();
}).setName('cancelrunoverview', true);

register('chat', (msg) => {
    const playername = Player.getName();
    if (!Settings.runoverview) return;
    if ((msg.includes("forcestart") && msg.includes(`${playername}`)) || msg.includes("[NPC] Elle: Talk with me to begin!")) {
        if (!inOverview) {
            startRunOverview(() => {
                const rawTime = rawEndTime - rawStartTime;
                const runTime = endTime - startTime;

                const rawTimeformattedTime = formatTime(rawTime);
                const runTimeformattedTime = formatTime(runTime);

                const [member_one, member_two, member_three, member_four] = party.map(member => (
                    new Message(
                        new TextComponent(`&8> &a${member.player} &4${member.deaths} ☠ &f- &6${member.supplies} Supply`)
                            .setHoverValue(`&a&lSupply times:\n\n${member.supplytimes}`)
                            .setClick("run_command", `/ct copy > ${member.player} - ${member.deaths} Death - ${member.supplies} Supply`)
                    )
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
                    ChatLib.chat(`&8* &aRun time: &f${runTimeformattedTime || 0}`);
                    ChatLib.chat(`&8* &aRaw time: &f${rawTimeformattedTime || 0}`);
                    ChatLib.chat(`&8* &aDPS: &f${dps}`);
                    ChatLib.chat("&b&m--------------------");

                    dps = 0;
                    party = [];
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
