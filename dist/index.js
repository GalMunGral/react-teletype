"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = void 0;
const react_1 = __importDefault(require("react"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ws_1 = require("ws");
const Renderer_js_1 = require("./Renderer.js");
const Store_js_1 = require("./Store.js");
function startApp(App, update, port = 8080) {
    const server = http_1.default
        .createServer((req, res) => {
        if (!req.url)
            res.end();
        if (/\.js$/.test(req.url)) {
            res.setHeader("Content-Type", "application/javascript");
            res.end(fs_1.default.readFileSync(path_1.default.join(__dirname, req.url)));
            return;
        }
        res.end(`
        <div id="app"></div>
        <script>window.exports = {};</script>
        <script src="/teletype.js"></script>
    `);
    })
        .listen(port, () => {
        console.log(`listening on ${port}`);
    });
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (client) => {
        // Model - Update
        const store = new Store_js_1.Store(update);
        store.dispatch({ type: "INIT" });
        client.on("message", (data) => {
            store.dispatch(JSON.parse(data.toString("utf-8")));
        });
        // View
        const renderer = new Renderer_js_1.SplitRenderer({
            send(message) {
                client.send(JSON.stringify(message));
            },
        });
        renderer.render(react_1.default.createElement(Store_js_1.StoreProvider, { store: store },
            react_1.default.createElement(App, null)));
        client.send(JSON.stringify("connect"));
    });
}
exports.startApp = startApp;
