import {delay, getMatchFromLines, onWorldJoin, onWorldLeave, removeUnicode, setRegisters} from "./generalUtils.js";
import {kicData} from "./data.js";

class WorldUtil {
    constructor() {
        onWorldJoin(() => {
            this.findWorld()
        })

        onWorldLeave(() => {
            this.reset()
        })

        register("tick", (ticks) => {
            if (ticks % 10 || !this.inSkyblock()) return;
            let scoreboard = Scoreboard?.getLines()?.map(a => a.getName()).map(a => ChatLib.removeFormatting(a));

            this.subArea = removeUnicode(getMatchFromLines(/ ⏣ (.+)/, scoreboard)).replace(/ \(.+\)/, "");
        })
    }

    reset() {
        this.world = undefined
        this.server = undefined
        this.spawn = undefined
        this.subArea = undefined
    }

    findWorld(tries = 10) {
        if (!tries) return;
        tries--;

        const TABLIST = TabList.getNames()
        const areaIdx = TABLIST.findIndex(e => e.match(/(Area|Dungeon):/g));
        const factionIdx = TABLIST.findIndex(e => e.match(/(Mage|Barbarian) Reputation/g));

        if (~areaIdx) {
            this.world = TABLIST[areaIdx].removeFormatting().split(": ").slice(-1).toString()
            this.server = TABLIST[areaIdx + 1].removeFormatting().split(": ").slice(-1).toString()

            const spawn = World.spawn
            this.spawn = [spawn.getX(), spawn.getY(), spawn.getZ()]

            if (~factionIdx && this.world === "Crimson Isle") {
                kicData.faction = TABLIST[factionIdx].removeFormatting().split(" ")[0].toString().toUpperCase()
                kicData.save()
            }

            delay(() => setRegisters(), 500);
        } else {
            delay(() => this.findWorld(tries), 1000);
        }
    }

    resetWorld() {
        this.reset()
        this.findWorld()
    }

    inSkyblock() {
        return Boolean(this.world)
    }

    worldIs(world) {
        return (world === this.world)
    }

    subAreaIs(subArea) {
        return (subArea === this.subArea)
    }

    toString() {
        return `${this.world} | ${this.server}`
    }
}

export default new WorldUtil;
