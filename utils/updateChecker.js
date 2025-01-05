import axios from "axios";
import { errorHandler, setVersion, kicPrefix, setDiscord, getDiscord } from "./generalUtils.js";

export function checkUpdate() {
    const currentVers = JSON.parse(FileLib.read("kuudraiscool", "metadata.json")).version;
    setVersion(currentVers);

    if (currentVers.includes("pre")) {
        ChatLib.chat(`${kicPrefix} &6You are currently using a pre-release version of kuudraiscool. Please be aware that this version may contain bugs or unfinished features.\n&6If you encounter any issues, report them in our Discord server: ${getDiscord()}\n&6Your feedback helps us improve!`);
    } else if (currentVers.includes("dev")) {
        ChatLib.chat(`${kicPrefix} &6You are currently using a development build of kuudraiscool. This build is intended for testing and may have experimental features or critical bugs.\n&6We strongly recommend reporting any issues you encounter in our Discord server: ${getDiscord()}\n&6Your testing and feedback are crucial to making the final release better!`);
    }

    axios.get("https://api.sm0kez.com/kuudraiscool/version", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)"
        }
    })
        .then(response => {
            const data = response.data;

            if (!data || !data.version || !data.downloadUrl) return;
            if (currentVers === data.version) return;

            setDiscord(data.discord);

            if (currentVers.includes("dev")) return;

            const Msg1 = ChatLib.getCenteredText("&a&lkuudraiscool\n");
            const Msg2 = ChatLib.getCenteredText(`&aUpdate Available! (${data.version})`);

            setTimeout(() => {
                ChatLib.chat("&r&9&m-----------------------------------------------------&r");
                ChatLib.chat(`${Msg1}\n${Msg2}`);
                ChatLib.chat("&r&9&m-----------------------------------------------------&r");
                ChatLib.chat(
                    new Message(
                        new TextComponent("&a[Download]")
                            .setClick("open_url", data.downloadUrl)
                    )
                );
            }, 500);
        })
        .catch(error => {
            if (!error.isAxiosError || error.code === 500) {
                errorHandler("Error while checking for update", error, "updateChecker.js", null);
            }
        });
}
