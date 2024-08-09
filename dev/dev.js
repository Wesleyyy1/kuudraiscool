import axios from "axios";
import Settings from "../settings/config.js";
import { fixNumber, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, capitalizeEachWord } from "../utils/generalUtils.js";

const items = {};

let hovering = "";

register("itemTooltip", (lore, item) => {
    if (lore.join("").toLocaleLowerCase().includes("soulbound")) return;
    const itemName = item.getNBT().getCompoundTag("tag").getCompoundTag("display").getString("Name");
    const extraAttr = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");

    const uuid = extraAttr.getString("uuid");
    const itemId = extraAttr.getString("id");
    const attributes = extraAttr.getTag("attributes");

    if (!itemName || !uuid || !itemId || attributes === null) {
        return;
    }

    const parsedAttributes = parseAttributes(attributes.toString());

    if (!items[uuid]) {
        items[uuid] = {
            name: itemName,
            itemId: itemId,
            attributes: parsedAttributes,
            price: "Loading...",
            time: Date.now()
        };
        getItemPrices(uuid);
    } else {
        if (items[uuid].name !== itemName || JSON.stringify(items[uuid].attributes) !== JSON.stringify(parsedAttributes)) {
            items[uuid].attributes = parsedAttributes;
            getItemPrices(uuid);
        }
        if ((Date.now() - items[uuid].time) > 300000) {
            getItemPrices(uuid);
        }

        hovering = uuid;
    }
});

function parseAttributes(attributeString) {
    const attributes = attributeString.replace(/[{}]/g, '').split(',');

    const parsedAttributes = {};

    attributes.forEach(attr => {
        const [name, level] = attr.split(':');
        parsedAttributes[name.trim()] = parseInt(level.trim());
    });

    return parsedAttributes;
}

function getItemPrices(uuid) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("KUUDRA")) return showMissingRolesMsg();

    let requestBody = {};
    requestBody.uuid = uuid;
    requestBody.itemId = items[uuid].itemId;

    let attributes = items[uuid].attributes;
    let attributeKeys = Object.keys(attributes);

    attributeKeys.forEach((key, index) => {
        requestBody[`attribute${index + 1}`] = key;
        requestBody[`attributeLvl${index + 1}`] = attributes[key];
    });

    items[uuid].price = "Checking...";

    axios.post("https://api.sm0kez.com/crimson/prices", {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        },
        body: requestBody,
        parseBody: true
    })
        .then(response => {
            const data = response.data;

            items[uuid].price = fixNumber(data.price) || 0;
            const attributePrices = [];
            
            if (data.attribute1) {
                const price = data.priceAttribute1 !== null ? data.priceAttribute1 : 0;
                attributePrices.push(`${capitalizeEachWord(data.attribute1.replaceAll("_", " "))} ${data.attributeLvl1}: ${fixNumber(price)}`);
            }

            if (data.attribute2) {
                const price = data.priceAttribute2 !== null ? data.priceAttribute2 : 0;
                attributePrices.push(`${capitalizeEachWord(data.attribute2.replaceAll("_", " "))} ${data.attributeLvl2}: ${fixNumber(price)}`);
            }

            items[uuid].attributePrices = attributePrices;
        })
        .catch(error => {
            items[uuid].price = "ERROR";

            if (!error.isAxiosError || error.code == 500) {
                errorHandler("Error while getting price for item", error.message, "test.js", null);
            }
        });
}

register("guiRender", myRenderOverlay);

function myRenderOverlay() {
    if (hovering !== "") {
        const item = items[hovering];
        let text = `${item.name}\n&aPrice: ${item.price}`;
        if (item.attributePrices && item.attributePrices.length != 0) {
            text += `\n&a${item.attributePrices.join("\n&a")}`;
        }

        const rectangle = new Rectangle(Renderer.color(0, 0, 0, 80), 45, 45, 100, 45)
        rectangle.draw()
    
        Renderer.translate(50, 50, 999)
        Renderer.scale(1)
        Renderer.drawStringWithShadow(text, 0, 0)
    }
}
