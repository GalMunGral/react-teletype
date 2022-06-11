"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Session_js_1 = require("../Session.js");
const App = () => {
    const { r, g, b, count } = (0, Session_js_1.useSession)();
    return (react_1.default.createElement("div", { style: {
            margin: "auto",
            width: 300,
            background: `rgb(${r},${g},${b}, 0.2)`,
            padding: 20,
        } },
        react_1.default.createElement("div", { style: {
                height: 300,
                background: `rgb(${r},${g},${b},0.8)`,
                lineHeight: "300px",
                fontSize: 20,
                textAlign: "center",
                fontFamily: "monospace",
                fontWeight: 800,
                color: "white",
            } },
            "Hello World + ",
            count),
        react_1.default.createElement("button", { style: {
                width: "100%",
                background: "white",
                fontFamily: "monospace",
                fontSize: 20,
            }, "data-click": { type: "INCREMENT" } }, "click")));
};
exports.default = App;
