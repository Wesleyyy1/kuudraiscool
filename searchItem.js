import axios from "axios";
import Settings from "./settings/config.js";
import { decompress, errorHandler, isKeyValid, getRoles, showInvalidReasonMsg, showMissingRolesMsg, getColorData, capitalizeEachWord } from "./utils/generalUtils.js";
import { getLevel } from "./utils/petLevelUtils.js";

function searchItem(playername, search) {
    if (!isKeyValid()) return showInvalidReasonMsg();
    if (!getRoles().includes("DEFAULT")) return showMissingRolesMsg();

    axios.get(`https://api.sm0kez.com/hypixel/profile/${playername}/selected`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "API-Key": Settings.apikey
        }
    })
        .then(response => {
            const data = response.data;

            if (data.success) {
                const list = generateItemList(data.members[data.uuid]);
                displaySearchResults(list, search, data.name);
            } else {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &cPlayer not found!`);
            }
        })
        .catch(error => {
            if (error.isAxiosError && error.code != 500) {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &c${error.response.data}`);
            } else {
                ChatLib.chat(`&7[&a&lKIC&r&7]&r &cSomething went wrong while gathering ${playername}'s data!\n&cPlease report this in the discord server!`);
                errorHandler("Error while getting profile data", error.message, "searchItem.js");
            }
        });
}

function generateItemList(memberData) {
    const itemList = [];

    const processItems = (items, source) => {
        if (!items) return;

        for (let i = 0; i < items.func_74745_c(); i++) {
            let item = items.func_150305_b(i);
            if (!item) continue;

            let compound = new NBTTagCompound(item);

            let count = compound.getByte("Count") || 1;
            let tag = compound.getCompoundTag("tag");
            if (tag.hasNoTags()) continue;

            let display = tag.getCompoundTag("display");
            let name = display.getString("Name");
            let lore = display.toObject()["Lore"] || [];

            const existingIndex = itemList.findIndex(item => item.name.includes(name));
            if (existingIndex !== -1) {
                itemList[existingIndex].count += count;
            } else {
                itemList.push({ count, name, source, lore });
            }
        }
    };

    const inventorySources = [
        { data: memberData.inventory?.equipment_contents?.data, source: "Equipment" },
        { data: memberData.inventory?.bag_contents?.talisman_bag?.data, source: "Accessory Bag" },
        { data: memberData.inventory?.wardrobe_contents?.data, source: "Wardrobe" },
        { data: memberData.inventory?.inv_armor?.data, source: "Armor" },
        { data: memberData.inventory?.inv_contents?.data, source: "Inventory" },
        { data: memberData.inventory?.ender_chest_contents?.data, source: "Enderchest" },
        { data: memberData.inventory?.personal_vault_contents?.data, source: "Personal Vault" },
    ];

    inventorySources.forEach(({ data, source }) => {
        const decompressedData = decompress(data);
        processItems(decompressedData, source);
    });

    for (let i = 0; i < 19; i++) {
        try {
            const backpackData = decompress(memberData.inventory?.backpack_contents?.[i]?.data);
            processItems(backpackData, `Backpack #${i + 1}`);
        } catch (error) {
            // Ignore errors for missing backpacks
        }
    }

    const pets = memberData.pets_data?.pets;

    if (pets) {
        pets.forEach((pet) => {
            const { type, heldItem, skin, tier, candyUsed, exp } = pet;

            const lvl = type === "GOLDEN_DRAGON" ? getLevel(exp, tier, true) : getLevel(exp, tier, false);

            const petColorCode = getColorData("rarity", tier);
            const name = `&7[Lvl ${lvl}] ${petColorCode}${capitalizeEachWord(type.replaceAll("_", " "))}`;
            const lore = [];

            lore.push(heldItem ?
                `&6Pet item: &3${capitalizeEachWord(heldItem.replaceAll("PET_ITEM_", "").replaceAll("_", " "))}` :
                "&6Pet item: &cnone"
            );

            lore.push(skin ?
                `&6Skin: &3${capitalizeEachWord(skin.replaceAll("_", " "))}` :
                "&6Skin: &cnone"
            );

            if (candyUsed && candyUsed > 0) {
                lore.push(`&6Candy used: &3${candyUsed}/10`);
            }

            lore.push(`\n${petColorCode}&l${tier} PET`);

            itemList.push({
                count: 1,
                name,
                source: "Pets",
                lore
            });
        });
    }

    return itemList;
}

function displaySearchResults(list, search, name) {
    let count = 0;
    const isLoreSearch = search.includes("lore:");
    if (isLoreSearch) search = search.split("lore:")[1].trim();

    ChatLib.chat(
        new Message(
            new TextComponent(`&2&m-----&f[- &2${name} &f-]&2&m-----`)
                .setClick("run_command", `/pv ${name}`)
        )
    );

    ChatLib.chat(`&aResults for: &7&o${search} ${isLoreSearch ? "(lore)" : ""}`);
    ChatLib.chat(`&r`);

    list.forEach((item) => {
        const searchLower = search.toLowerCase();
        const target = isLoreSearch ? `${item.lore}`.toLowerCase() : item.name.toLowerCase();
        if (target.includes(searchLower)) {
            count++;
            ChatLib.chat(new Message(new TextComponent(`&7#${count} ${item.count}x ${item.name} &7(${item.source})`).setHoverValue(`&7${item.count}x ${item.name} &7(${item.source})\n${item.lore.join("\n")}`)));
        }
    });

    ChatLib.chat("&2&m-------------------------&r");
}

export default searchItem;
