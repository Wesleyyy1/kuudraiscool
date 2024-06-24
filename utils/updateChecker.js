import request from '../../requestV2';

const checkTrigger = register("worldLoad", () => {
    checkTrigger.unregister();

    const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;

    request({
        url: `https://api.sm0kez.com/kuudraiscool/version`,
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
        },
        json: true
    }).then(data => {
        if (!data || !data.version || !data.downloadUrl) return;
        
        if (currentVers == data.version) return;

        let updateMessage = `&9&m${ChatLib.getChatBreak(" ")}\n`;
        updateMessage += `&akuudraiscool Update Available! (${data.version})\n`;

        const msg = new Message(updateMessage);
        msg.addTextComponent(
            new TextComponent(`\n&aClick to go to the Github release page!`)
                .setClick("open_url", data.downloadUrl)
        );

        msg.addTextComponent(new TextComponent(`\n&9&m${ChatLib.getChatBreak(" ")}\n`));

        msg.chat();

    }).catch(e => {
        console.log(`Error checking for kuudraiscool update: ${JSON.stringify(e)}`);
    });
});