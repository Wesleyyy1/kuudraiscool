// New party stuff

import { HypixelModAPI } from "./../../HypixelModAPI";
import { delay } from "../utils/generalUtils";

export default new class Party {
    constructor() {
		this.members = [];
		this.leader = null;
        this.updated = false;

        this.partyDisbanded = [
            /^.+ &r&ehas disbanded the party!&r$/,
            /^&cThe party was disbanded because (.+)$/,
            /^&eYou left the party.&r$/,
            /^&cYou are not currently in a party.&r$/,
            /^&eYou have been kicked from the party by .+$/
        ];

        this.updateMsgs = [
            /^&eYou have joined &r(.+)'s* &r&eparty!&r$/,
            /^&eThe party was transferred to &r(.+) &r&eby &r.+&r$/,
            /^(.+) &r&e has promoted &r(.+) &r&eto Party Leader&r$/,
            /^(.+) &r&ejoined the party.&r$/,
            /^&eYou have joined &r(.+)'[s]? &r&eparty!&r$/,
            /^(.+) &r&ehas been removed from the party.&r$/,
            /^(.+) &r&ehas left the party.&r$/,
            /^(.+) &r&ewas removed from your party because they disconnected.&r$/,
            /^&eKicked (.+) because they were offline.&r$/
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
            let formatted = ChatLib.getChatMessage(event, true);

            this.updateMsgs.forEach(regex => {
                if (formatted.match(regex)) this.updatePartyData();
            });

            this.partyDisbanded.forEach(regex => {
                if (formatted.match(regex)) this.clearPartyData();
            });
        })

        this.updatePartyData();
	}

    updatePartyData() {
        this.updated = false;

        delay(() => { // Check for skytils sending requests to mod api after every party member join/leave
            if (!this.updated) {
                //HypixelModAPI.requestPartyInfo();
            }
        }, 1000);
    }

    clearPartyData() {
        this.leader = null;
        this.members = [];
    }
}
