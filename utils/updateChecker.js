import request from '../../requestV2';
import { errorHandler } from './generalUtils.js';

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

        const Msg1 = ChatLib.getCenteredText('&a&lkuudraiscool\n');
        const Msg2 = ChatLib.getCenteredText(`&aUpdate Available! (${data.version})`);

        setTimeout(() => {
            ChatLib.chat('\n&r&9&m-----------------------------------------------------&r');
            ChatLib.chat(`${Msg1}\n${Msg2}`);
            ChatLib.chat('&r&9&m-----------------------------------------------------&r');
            ChatLib.chat(
                new Message(
                    new TextComponent('&a[Download]')
                    .setClick('open_url',data.downloadUrl)
                )
            );
        }, 500);
    }).catch(error => {
        errorHandler('Error while checking for update', error, 'updateChecker.js');
    });
});
