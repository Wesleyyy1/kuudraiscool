import Settings from "../settings/config.js";
import { kicPrefix, registerWhen } from "./generalUtils.js";
import { kicData } from "./data.js";
import World from "./World.js";

const instruct = "Use scroll to scale, click the button to reset, and drag to move the overlay.";

export default class ScalableGui {
    constructor(pogSubObj, setting, requires, condition, example, overGui = false) {
        this.subObj = kicData[pogSubObj];
        this.setting = setting;
        this.example = example;
        this.overGui = overGui;
        this.requires = new Set(requires);

        this.gui = new Gui();
        this.message = "";

        this.renderTrigger = register("renderOverlay", () => {
            this.renderOverlay(this.example, this.getX(), this.getY(), this.getScale(), true);
        }).unregister();

        this.gui.registerOpened(() => {
            this.renderTrigger.register();
        });

        this.gui.registerClosed(() => {
            this.renderTrigger.unregister();
        });

        registerWhen(register(this.overGui ? "guiRender" : "renderOverlay", () => {
            if (!this.gui.isOpen() && condition()) {
                this.renderOverlay(this.message, this.getX(), this.getY(), this.getScale(), false);
            }
        }), () => World.isSkyblock() && Settings[this.setting] && (this.requires.has(World.world) || this.requires.has("all")));

        this.gui.registerScrolled((mx, my, dir) => {
            if (dir === 1) this.subObj.scale += 0.02;
            else this.subObj.scale -= 0.02;
            kicData.save();
        });

        this.gui.registerMouseDragged((mx, my, btn, lastClick) => {
            this.subObj.x = mx;
            this.subObj.y = my;
            kicData.save();
        });
    }

    renderOverlay(text, x, y, scale, isExample = false) {
        if (Settings.drawBackground) {
            const textDimensions = this.calculateTextDimensions(text, scale);
            Renderer.drawRect(
                Renderer.color(0, 0, 0, 75),
                x - 3 * scale,
                y - 3 * scale,
                textDimensions.width + 6 * scale,
                textDimensions.height + 6 * scale
            );
        }

        Renderer.translate(x, y);
        Renderer.scale(scale);
        Renderer.drawString(text, 0, 0, Settings.textShadow);

        if (isExample) {
            Renderer.scale(1);
            Renderer.drawString(instruct, (Renderer.screen.getWidth() / 2) - (Renderer.getStringWidth(instruct) / 2), 10);
        }

        Renderer.finishDraw();
    }

    setMessage(message) {
        this.message = message;
    }

    setExample(example) {
        this.example = example;
    }

    calculateTextDimensions(text, scale) {
        const lines = text.split("\n");
        let maxWidth = 0;
        const height = lines.length * 9 * scale;

        lines.forEach(line => {
            let stringWidth = 0;
            if (line.includes('§l')) {
                const splitLine = line.split('§l');
                for (let i = 0; i < splitLine.length; i++) {
                    if (i % 2 === 0) stringWidth += Renderer.getStringWidth(splitLine[i]);
                    else {
                        let clearIndex = splitLine[i].indexOf("§");
                        let boldedString = clearIndex !== -1 ? splitLine[i].substring(0, clearIndex) : splitLine[i];
                        let unboldedString = clearIndex !== -1 ? splitLine[i].substring(clearIndex, splitLine[i].length) : "";
                        stringWidth += Renderer.getStringWidth(boldedString) * 1.2 + Renderer.getStringWidth(unboldedString);
                    }
                }
            } else {
                stringWidth = Renderer.getStringWidth(line);
            }
            maxWidth = Math.max(maxWidth, stringWidth * scale);
        });

        return { width: maxWidth, height: height };
    }

    setCommand(commandName) {
        register("command", (...args) => {
            if (args && args[0] === "reset") {
                this.subObj.x = 50;
                this.subObj.y = 50;
                this.subObj.scale = 1;
                ChatLib.chat(`${kicPrefix} &aHUD location reset!`);
            } else {
                this.open();
            }
        }).setName(commandName).setTabCompletions("edit", "reset");

        return this;
    }

    getX() {
        return this.subObj.x ?? 0;
    }

    getY() {
        return this.subObj.y ?? 0;
    }

    getScale() {
        return this.subObj.scale ?? 1;
    }

    open() {
        this.gui.open();
    }

    close() {
        this.gui.close();
    }

    onOpen(func) {
        this.gui.registerOpened(func);
    }

    onClose(func) {
        this.gui.registerClosed(func);
    }

    isOpen() {
        return this.gui.isOpen();
    }
}
