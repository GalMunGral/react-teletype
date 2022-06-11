"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Store_js_1 = require("../Store.js");
const types_js_1 = __importDefault(require("./types.js"));
const App = () => {
    const state = (0, Store_js_1.useUpdate)();
    const R = Math.floor(Math.random() * 255);
    const G = Math.floor(Math.random() * 255);
    const B = Math.floor(Math.random() * 255);
    return (react_1.default.createElement("div", { style: { background: `rgb(${R},${G},${B})`, color: "white" } },
        react_1.default.createElement("div", { style: { background: `gray`, color: `rgb(${G},${B},${R})` } },
            "Hello World + ",
            state.count,
            "!"),
        react_1.default.createElement("button", { "data-click": { type: types_js_1.default.CLICK_TEST } }, "click")));
};
exports.default = App;
