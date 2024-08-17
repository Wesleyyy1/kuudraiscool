import { fixNumber, errorHandler } from "./utils/generalUtils.js";
import Settings from "./settings/config.js";

let inOverview = false;
let rawStartTime, rawEndTime, startTime, endTime;
let party = [];
let timerStart = 0;
let dps = 0;
let mainHandler = null;
let checksHandler = null;
let worldHandler = null;
let buildStart, buildEnd, stunEnd, kuudra1End;

function startRunOverview(callback) {
    inOverview = true;
    ChatLib.chat("\n&aRun overview has started!\n");
    rawEndTime = startTime = endTime = timerStart = 0;
    buildStart = buildEnd = stunEnd = kuudra1End = 0;
    rawStartTime = Date.now();
    let supplies = 0;
    let worldCheck = false;
    let yCheck = false;

    try {
        mainHandler = register("chat", (msg) => {
            if (msg.startsWith("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!")) {
                startTime = Date.now();
            } else if (msg.trim().startsWith("KUUDRA DOWN!")) {
                endTime = Date.now();
                dps = fixNumber(300000000 / ((endTime / 1000) - timerStart));
                unregisterHandlers();
                callback();
            } else if (msg.includes("is now ready!")) {
                if (!worldCheck) {
                    worldCheck = true;
                }
                const playername = msg.split(" ")[0];
                if (!party.some(entry => entry.player === playername)) {
                    party.push({ player: playername, deaths: 0, supplies: 0, supplytimes: `&r` });
                }
            } else if (msg.startsWith(" ☠")) {
                let playername = msg.replace(" ☠ ", "").split(" ")[0].trim();
                if (playername === "You") {
                    playername = Player.getName();
                }

                let player = party.find(entry => entry.player === playername);

                if (!player) {
                    player = { player: playername, deaths: 0, supplies: 0, supplytimes: `&r` };
                    party.push(player);
                }

                player.deaths++;
            } else if (msg.includes("recovered one of Elle's supplies!")) {
                let playername = msg.split(" ")[0];
                if (playername.includes("[")) {
                    playername = msg.split(" ")[1];
                }

                supplies++;

                const timeElapsed = Date.now() - startTime;
                const minutes = Math.floor(timeElapsed / 60000);
                const seconds = Math.floor((timeElapsed % 60000) / 1000);
                const milliseconds = Math.floor((timeElapsed % 1000) / 10);
                const formattedTime = `${minutes}:${seconds}.${milliseconds.toString().padStart(2, "0")}`;

                let player = party.find(entry => entry.player === playername);

                if (!player) {
                    player = { player: playername, deaths: 0, supplies: 0, supplytimes: `&r` };
                    party.push(player);
                }

                player.supplies++;
                player.supplytimes += `&8#${supplies} &a${formattedTime}\n`;
            } else if (msg.includes("forcestop") && msg.includes(`${Player.getName()}:`)) {
                unregisterHandlers();
                callback();
            } else if (msg.startsWith("[NPC] Elle: I knew you could do it!")) {
                yCheck = true;
            } else if (msg.startsWith("[NPC] Elle: It's time to build the Ballista again! Cover me!")) {
                buildStart = Date.now();
            } else if (msg.startsWith("[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!")) {
                buildEnd = Date.now();
            } else if (msg.startsWith("[NPC] Elle: That looks like it hurt! Quickly, while Kuudra is distracted, shoot him with the Ballista!")) {
                stunEnd = Date.now();
            } else if (msg.startsWith("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!")) {
                kuudra1End = Date.now();
            }
        }).setCriteria("${msg}");

        checksHandler = register("tick", () => {
            if (yCheck) {
                if (Player.getY() < 69) {
                    timerStart = Date.now() / 1000;
                    yCheck = false;
                    checksHandler?.unregister();
                }
            }
        });

        worldHandler = register("worldLoad", () => {
            if (worldCheck) {
                unregisterHandlers();
                callback();
            }
        });
    } catch (error) {
        unregisterHandlers();
        errorHandler("Error while getting run info", error, "runOverview.js", null);
    }
}

function unregisterHandlers() {
    mainHandler?.unregister();
    checksHandler?.unregister();
    worldHandler?.unregister();
    rawEndTime = Date.now();
    inOverview = false;
}

function formatTime(time) {
    if (!time) return 0;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes}:${seconds}.${milliseconds.toString().padStart(2, "0")}`;
}

register("command", () => {
    if (!inOverview) return;
    ChatLib.chat("&cCanceled the run overview");
    unregisterHandlers();
}).setName("cancelrunoverview", true);

function calculateTime(start, end) {
    if (start === 0 || end === 0) {
        return 0;
    }
    return formatTime(end - start);
}

register("chat", (msg) => {
    const playername = Player.getName();
    if (!Settings.runoverview) return;
    if ((msg.includes("forcestart") && msg.includes(`${playername}`)) || msg.includes("[NPC] Elle: Talk with me to begin!")) {
        if (!inOverview) {
            startRunOverview(() => {
                const [member_one, member_two, member_three, member_four] = party.map(member => (
                    new Message(
                        new TextComponent(`&8> &a${member.player} &4${member.deaths} ☠ &f- &6${member.supplies} Supply`)
                            .setHoverValue(`&a&lSupply times:\n\n${member.supplytimes}`)
                            .setClick("run_command", `/ct copy > ${member.player} - ${member.deaths} Death - ${member.supplies} Supply`)
                    )
                ));

                const rawTimeformattedTime = calculateTime(rawStartTime, rawEndTime);
                const runTimeformattedTime = calculateTime(startTime, endTime);
                const buildTime = calculateTime(buildStart, buildEnd);
                const stunTime = calculateTime(buildEnd, stunEnd);
                const kuudra1KillTime = calculateTime(stunEnd, kuudra1End);
                const kuudra2KillTime = calculateTime(kuudra1End, endTime);

                const runTime = new Message(
                    new TextComponent(`&9Times & DPS:\n&8* &aRun time: &f${runTimeformattedTime}\n&8* &aRaw time: &f${rawTimeformattedTime}`)
                        .setHoverValue(`&a&lExtra info:\n\n&aBuild time: ${buildTime}\n&aStun time: ${stunTime}\n&aDPS time: ${kuudra1KillTime}\n&aLast phase time: ${kuudra2KillTime}`)
                );

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
                    ChatLib.chat(runTime);
                    ChatLib.chat(`&8* &aDPS: &f${dps}`);
                    ChatLib.chat("&b&m--------------------");

                    rawStartTime = rawEndTime = startTime = endTime = 0;
                    buildStart = buildEnd = stunEnd = 0;
                    dps = 0;
                    party = [];
                }, 500);
            });
        } else {
            ChatLib.chat("Run already started!");
        }
    }
}).setCriteria("${msg}");

register("command", () => {
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
}).setName("runoverviewpreview", true);
