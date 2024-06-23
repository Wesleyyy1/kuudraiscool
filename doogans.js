import { request } from '../requestV2';
import { fixNumber, decompress } from './utils/generalUtils.js';

function getPartyData(apiKey, party) {
    const longMessage = [];
    let completedRequests = 0;

    const checkCompletion = () => {
        completedRequests += 1;
        if (completedRequests === party.length) {
            ChatLib.chat(`${longMessage.join(' | ')}`);
        }
    };

    party.forEach(player => {
        request({
            url: `https://api.sm0kez.com/profile/${player}/selected`,
            headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)",
                "API-Key": apiKey
            },
            json: true
        }).then(response => {
            if (response.success) {
                const currentProfile = response;
                const uuid = response.uuid;
                const memberData = currentProfile?.members?.[uuid];

                let arrows = 0;
                const data = memberData.inventory?.bag_contents?.quiver?.data;
                if (data) {
                    const quiver = decompress(data);

                    if (quiver) {
                        for (let i = 0; i < quiver.func_74745_c(); i++) {
                            let item = quiver.func_150305_b(i);
                            if (!item) continue;

                            let count = new NBTTagCompound(item).getByte('Count') || 1;
                            arrows += count;
                        }
                    }
                }

                const soulflow = memberData.item_data?.soulflow || 0;

                let enoughArrows = arrows >= 433 || !arrows ? true : `GET ARROWS (${(arrows / 2880 * 100).toFixed(2)}%)`;
                let enoughSoulflow = soulflow >= 501 ? true : `GET SOULFLOW (${fixNumber(soulflow)})`;

                if (enoughArrows !== true || enoughSoulflow !== true) {
                    longMessage.push(`${response.name} -> ${[enoughArrows, enoughSoulflow].filter(msg => msg !== true).join(' + ')}`);
                }
            } else {
                longMessage.push(`${player} -> INVALID`);
            }
            checkCompletion();
        }).catch(error => {
            longMessage.push(`${player} -> ERROR`);
            console.error(`Error fetching data for ${player}:`, error);
            checkCompletion();
        });
    });
}

export default getPartyData;
