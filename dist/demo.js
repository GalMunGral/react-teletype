"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_js_1 = __importDefault(require("./demo/App.js"));
const update_js_1 = __importDefault(require("./demo/update.js"));
const index_js_1 = require("./index.js");
(0, index_js_1.startApp)(App_js_1.default, update_js_1.default);
