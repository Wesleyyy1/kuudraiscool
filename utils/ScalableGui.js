import Settings from "../settings/config.js";
import { registerWhen } from "./generalUtils.js";
import { data } from "./data.js";
const GuiButton = Java.type("net.minecraft.client.gui.GuiButton");
const instruct = "Use scroll to scale, click the button to reset, and drag to move the overlay.";

export default class ScalableGui {
    constructor(subObject, settings, condition, example, overGui = false) {
        this.obj = data;
        this.subObj = this.obj[subObject];
        this.settings = settings;
        this.example = example;
        this.overGui = overGui;
        this.drawBackground = Settings.drawBackground;

        if (!("x" in this.subObj)) this.subObj.x = 50;
        if (!("y" in this.subObj)) this.subObj.y = 50;
        if (!("scale" in this.subObj)) this.subObj.scale = 1;

        this.gui = new Gui();
        this.message = "";

        this.renderTrigger = register("renderOverlay", () => {
            this.renderOverlay(this.example, this.getX(), this.getY(), this.getScale(), this.drawBackground, true);
        }).unregister();

        this.gui.registerOpened(() => {
            this.renderTrigger.register();
        });

        this.gui.registerClosed(() => {
            this.renderTrigger.unregister();
        });

        registerWhen(register(this.overGui ? "guiRender" : "renderOverlay", () => {
            if (!this.gui.isOpen() && condition()) {
                this.renderOverlay(this.message, this.getX(), this.getY(), this.getScale(), this.drawBackground, false, this.overGui);
            }
        }), () => Settings[this.settings]);

        this.gui.addButton(new GuiButton(1, Renderer.screen.getWidth() - 110, Renderer.screen.getHeight() - 50, 80, 20, "Reset scale"));

        this.gui.registerActionPerformed(button => {
            if (button == 1) {
                this.subObj.scale = 1;

                this.obj.save();
            }
        });

        this.gui.registerScrolled((mx, my, dir) => {
            if (dir == 1) this.subObj.scale += 0.02;
            else this.subObj.scale -= 0.02;
            this.obj.save();
        });

        this.gui.registerMouseDragged((mx, my, btn, lastClick) => {
            this.subObj.x = mx;
            this.subObj.y = my;
            this.obj.save();
        });
    }

    renderOverlay(text, x, y, scale, drawBackground, isExample = false) {
        if (drawBackground) {
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
        register("command", () => {
            this.open();
        }).setName(commandName);

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
