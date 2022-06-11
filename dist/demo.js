"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const index_js_1 = require("./index.js");
const App_js_1 = __importDefault(require("./demo/App.js"));
const reducer_js_1 = require("./demo/reducer.js");
(0, index_js_1.startApp)(react_1.default.createElement(App_js_1.default, null), reducer_js_1.reducer);
