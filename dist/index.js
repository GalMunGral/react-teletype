"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = void 0;
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const react_1 = __importDefault(require("react"));
const ws_1 = require("ws");
const Renderer_js_1 = require("./Renderer.js");
const Session_js_1 = require("./Session.js");
function startApp(rootNode, reducer, port = 8080) {
    const bootstrap = `
    <div id="app"></div>
      <script>window.exports = {};</script>
    <script src="/teletype.js"></script>
  `;
    const server = http_1.default
        .createServer((req, res) => {
        if (!req.url)
            res.end();
        if (/\.js$/.test(req.url)) {
            res.setHeader("Content-Type", "application/javascript");
            fs_1.default.createReadStream(path_1.default.join(__dirname, req.url)).pipe(res);
        }
        else {
            res.end(bootstrap);
        }
    })
        .listen(port, () => {
        console.log(`listening on ${port}`);
    });
    const sessions = new Map();
    function getSession(userId) {
        if (!sessions.has(userId)) {
            const s = new Session_js_1.Session(reducer);
            s.dispatch({ type: "INIT" });
            sessions.set(userId, s);
        }
        return sessions.get(userId);
    }
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (client) => {
        client.onmessage = (e) => {
            const userId = String(e.data);
            const session = getSession(userId);
            new Renderer_js_1.SplitRenderer({
                send(message) {
                    client.send(JSON.stringify(message));
                },
            }).render(react_1.default.createElement(Session_js_1.SessionContext.Provider, { value: session }, rootNode));
            client.onmessage = (e) => {
                session.dispatch(JSON.parse(String(e.data)));
            };
        };
    });
}
exports.startApp = startApp;
