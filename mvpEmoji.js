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
    let msg = message.toString();
    let p = Player.getPlayer()
    if (msg.includes(`[MVP++] ${p}`)) return;

    for (let key in emojiList) {
        if (msg.includes(key)) {
            chat = msg.replaceAll(key, emojiList[key]);
        }
    }

    if (msg !== message) {
        cancel(event);
        ChatLib.say(msg);
    }
});