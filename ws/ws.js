import WebSocket from "../../WebSocket/index.js";
import Settings from "../settings/config.js";
import { socketFactory } from "./SSL.js";
import { errorHandler } from "../utils/generalUtils";

const msgTemplate = {
    "type": "CHAT",
    "data": {
        "message": ""
    }
};

const WSPrefix = "&7[&a&lKIC-CHAT&r&7]&r &7|";

class WebSocketWithHeaders extends WebSocket {
    constructor(address, headers = {}) {
        super(address);

        const _this = this;

        const headersMap = new java.util.HashMap();
        for (const key in headers) {
            headersMap.put(key, headers[key]);
        }

        this.socket = new JavaAdapter(org.java_websocket.client.WebSocketClient, {    
            onMessage(message) {
                _this.onMessage(message);
            },
            onError(exception) {
                _this.onError(exception);
            },
            onOpen(handshake) {
                _this.onOpen(handshake);
            },
            onClose(code, reason, remote) {
                _this.onClose(code, reason, remote);
            }
        }, new java.net.URI(this.address), headersMap);

        this.socket.setSocketFactory(socketFactory);
    }
}

const ws = new WebSocketWithHeaders("wss://api.sm0kez.com/ws", { "API-Key": Settings.apikey });

ws.onMessage = (msg) => {
    if (Settings.kicChat) {
        const wsMSG = JSON.parse(msg);
        if (wsMSG.type === "ERROR") {
            ChatLib.chat(`${WSPrefix} ERROR!`);
        } else if (wsMSG.type === "CHAT" || wsMSG.type === "DISCORD") {
            ChatLib.chat(`${WSPrefix} &3${wsMSG.user}${wsMSG.type === "DISCORD" ? " &r&7(&bD&7)" : ""}&r&7: ${wsMSG.data.message}`);
        }  else if (wsMSG.type === "WAYPOINT") {
            ChatLib.chat(`${WSPrefix} &3${wsMSG.user}&r&7: ${wsMSG.data.title} in ${wsMSG.data.lobby} at x:${wsMSG.data.loc.x}, y:${wsMSG.data.loc.y}, z:${wsMSG.data.loc.z}`);
        } else {
            console.log("KIC-WSS | Unknown type!");
        }
    }
};

ws.onError = (exception) => {
    console.error("KIC-WSS | Error: ", exception);
    errorHandler("Error with KIC-WSS", exception, "ws.js");
    ChatLib.chat(`${WSPrefix} &cError with the KIC-Chat! Please report this in the discord server.`);
};

ws.onOpen = () => {
    console.log("KIC-WSS | CONNECTED!");
    ChatLib.chat(`${WSPrefix} &aConnected!`);
};

ws.onClose = () => {
    console.log("KIC-WSS | DISCONNECTED!");
    ChatLib.chat(`${WSPrefix} &cDisconnected!`);
};

register("command", (...args) => {
    if (Settings.kicChat) {
        if (ws.socket.isClosed()) {
            ws.reconnect();
        }
        const message = args.join(" ").trim();
        if (args && message !== "") {
            let msg = msgTemplate;
            msg.data.message = args.join(" ");
            if (ws.socket.isOpen()) {
                ws.send(JSON.stringify(msg));
            } else {
                ChatLib.chat(`${WSPrefix} NOT CONNECTED (/kc-connect)!`);
            }
        }
    }
}).setName("kicchat", true).setAliases("kc");

register("command", () => {
    if (ws.socket.isClosed()) {
        ws.reconnect();
    }
}).setName("kc-reconnect", true);

register("gameUnload", () => {
    ws.close();
});

register("serverConnect", () => {
    if (ws.socket.isClosed()) {
        ws.reconnect();
    }
});

register("serverDisconnect", () => {
    ws.close();
});

ws.connect();