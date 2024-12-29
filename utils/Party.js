import { HypixelModAPI } from "../../HypixelModAPI/index";
import { delay } from "./generalUtils";

export default new class Party {
    constructor() {
        this.members = [];
        this.leader = null;
        this.updated = false;

        this.partyDisbanded = [
            /^.+ has disbanded the party!$/,
            /^The party was disbanded because (.+)$/,
            /^You left the party.$/,
            /^You are not currently in a party.$/,
            /^You have been kicked from the party by .+$/
        ];

        this.updateMsgs = [
            /^You have joined (.+)'s* party!$/,
            /^The party was transferred to (.+) by .+$/,
            /^(.+) has promoted (.+) to Party Leader$/,
            /^(.+) joined the party.$/,
            /^You have joined (.+)'s? party!$/,
            /^(.+) has been removed from the party.$/,
            /^(.+) has left the party.$/,
            /^(.+) was removed from your party because they disconnected.$/,
            /^Kicked (.+) because they were offline.$/,
            /^Party Finder > (.+) joined the .+$/
        ];

        HypixelModAPI.on("partyInfo", (partyInfo) => {
            this.updated = true;
            this.clearPartyData();
            Object.keys(partyInfo).forEach(key => {
                this.members.push(key);
                if (partyInfo[key] === "LEADER") {
                    this.leader = key;
                }
            });
        });

        register("chat", (event) => {
            let msg = ChatLib.getChatMessage(event, true).removeFormatting();

            this.updateMsgs.forEach(regex => {
                if (msg.match(regex)) this.updatePartyData();
            });

            this.partyDisbanded.forEach(regex => {
                if (msg.match(regex)) this.clearPartyData();
            });
        })
    }

    updatePartyData() {
        this.updated = false;

        delay(() => { // Check for skytils sending requests to mod api after every party member join/leave
            if (!this.updated) {
                HypixelModAPI.requestPartyInfo();
            }
        }, 1000);
    }

    clearPartyData() {
        this.leader = null;
        this.members = [];
    }

    inParty() {
        return this.members.length !== 0;
    }

    amILeader() {
        return this.leader === Player.getUUID();
    }
}