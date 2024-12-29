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

const emojiRegex = new RegExp(Object.keys(emojiList).map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

register("MessageSent", (message, event) => {
    if (!Settings.emojis) return;

    const replacedMessage = message.replace(emojiRegex, match => emojiList[match]);

    if (replacedMessage !== message) {
        cancel(event);
        ChatLib.say(replacedMessage);
    }
});
