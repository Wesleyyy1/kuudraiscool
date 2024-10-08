import Settings from "./settings/config.js";

const emojiList = {
    "<3": "❤",
    ":star:": "✮",
    ":yes:": "✔",
    ":no:": "✖",
    ":java:": "☕",
    ":arrow:": "➜",
    ":shrug:": "¯\\_(ツ)_/¯",
    ":tableflip:": "(╯°□°）╯︵ ┻━┻",
    "o/": "( ﾟ◡ﾟ)/",
    ":totem:": "☉_☉",
    ":typing:": "✎...",
    ":maths:": "√(π+x)=L",
    ":snail:": "@'-'",
    ":thinking:": "(0.o?)",
    ":gimme:": "༼つ◕_◕༽つ",
    ":wizard:": "('-')⊃━☆ﾟ.*･｡ﾟ",
    ":pvp:": "⚔",
    ":peace:": "✌",
    ":puffer:": "<('O')>",
    ":dog:": "(ᵔᴥᵔ)",
    "h/": "ヽ(^◇^*)/",
    ":cat:": "= ＾● ⋏ ●＾ =",
    ":cute:": "(✿◠‿◠)",
    ":snow:": "☃",
    ":dj:": "ヽ(⌐■_■)ノ♬",
    ":sloth:": "(・⊝・)",
    ":yey:": "ヽ (◕◡◕) ﾉ",
};

register("MessageSent", (message, event) => {
    if (!Settings.emojis) return;
    let msg = message;

    for (let key in emojiList) {
        if (msg.includes(key)) {
            msg = msg.replaceAll(key, emojiList[key]);
        }
    }

    if (msg !== message) {
        cancel(event);
        ChatLib.say(msg);
    }
});
