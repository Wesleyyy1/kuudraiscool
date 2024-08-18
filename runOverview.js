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
    dps = rawEndTime = startTime = endTime = timerStart = 0;
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
                if (endTime && timerStart) {
                    dps = fixNumber(300000000 / ((endTime / 1000) - timerStart));
                }
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
                    new TextComponent(`&8> &a${member.player} &4${member.deaths} ☠ &f- &6${member.supplies} Supply\n`)
                        .setHoverValue(`&a&lSupply times:\n\n${member.supplytimes}`)
                        .setClick("run_command", `/ct copy > ${member.player} - ${member.deaths} Death - ${member.supplies} Supply`)
                ));

                const rawTimeformattedTime = calculateTime(rawStartTime, rawEndTime);
                const runTimeformattedTime = calculateTime(startTime, endTime);
                const buildTime = calculateTime(buildStart, buildEnd);
                const stunTime = calculateTime(buildEnd, stunEnd);
                const kuudra1KillTime = calculateTime(stunEnd, kuudra1End);
                const kuudra2KillTime = calculateTime(kuudra1End, endTime);

                const runTime = new TextComponent(`&8* &aRun time: &f${runTimeformattedTime}\n&8* &aRaw time: &f${rawTimeformattedTime}\n`)
                    .setHoverValue(`&a&lExtra info:\n\n&aBuild time: &f${buildTime}\n&aStun time: &f${stunTime}\n&aDPS time: &f${kuudra1KillTime}\n&aLast phase time: &f${kuudra2KillTime}`);

                setTimeout(() => {
                    const message = new Message();
                    message.addTextComponent("&b&m--------------------\n");
                    message.addTextComponent("&9&lRUN OVERVIEW\n\n");
                    message.addTextComponent("&9Party:\n");
                    message.addTextComponent(member_one || "&cNo player found\n");
                    message.addTextComponent(member_two || "&cNo player found\n");
                    message.addTextComponent(member_three || "&cNo player found\n");
                    message.addTextComponent(member_four || "&cNo player found\n");
                    message.addTextComponent("\n&9Times & DPS:\n");
                    message.addTextComponent(runTime);
                    message.addTextComponent(`&8* &aDPS: &f${dps}\n`);
                    message.addTextComponent("&b&m--------------------");

                    ChatLib.chat(message);

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
    const party = [
        { player: "SuuerSindre", deaths: 4, supplies: 0, supplytimes: "" },
        { player: "Xaned", deaths: 0, supplies: 2, supplytimes: "&8#1 &a1:30.22\n&8#4 &a1:50.43\n" },
        { player: "Wesleygame", deaths: 1, supplies: 2, supplytimes: "&8#2 &a1:35.54\n&8#5 &a2:05.12\n" },
        { player: "catgirlrain", deaths: 0, supplies: 2, supplytimes: "&8#3 &a1:40.31\n&8#6 &a2:10.49\n"}
    ];

    const rawTimeformattedTime = "3:52.13";
    const runTimeformattedTime = "3:46.02";
    const buildTime = "0:32.22";
    const stunTime = "0:14.06";
    const kuudra1KillTime = "0:09.59";
    const kuudra2KillTime = "0:36.13";
    const dps = "13.69M";

    const [member_one, member_two, member_three, member_four] = party.map(member => (
        new TextComponent(`&8> &a${member.player} &4${member.deaths} ☠ &f- &6${member.supplies} Supply\n`)
            .setHoverValue(`&a&lSupply times:\n\n${member.supplytimes}`)
            .setClick("run_command", `/ct copy > ${member.player} - ${member.deaths} Death - ${member.supplies} Supply`)
    ));

    const runTime = new TextComponent(`&8* &aRun time: &f${runTimeformattedTime}\n&8* &aRaw time: &f${rawTimeformattedTime}\n`)
        .setHoverValue(`&a&lExtra info:\n\n&aBuild time: &f${buildTime}\n&aStun time: &f${stunTime}\n&aDPS time: &f${kuudra1KillTime}\n&aLast phase time: &f${kuudra2KillTime}`);

    const message = new Message();
    message.addTextComponent("&b&m--------------------\n");
    message.addTextComponent("&9&lRUN OVERVIEW\n");
    message.addTextComponent("\n&9Party:\n");
    message.addTextComponent(member_one || "&cNo player found\n");
    message.addTextComponent(member_two || "&cNo player found\n");
    message.addTextComponent(member_three || "&cNo player found\n");
    message.addTextComponent(member_four || "&cNo player found\n");
    message.addTextComponent("\n&9Times & DPS:\n");
    message.addTextComponent(runTime);
    message.addTextComponent(`&8* &aDPS: &f${dps}\n`);
    message.addTextComponent("&b&m--------------------");

    ChatLib.chat(message);
}).setName("runoverviewpreview", true);
