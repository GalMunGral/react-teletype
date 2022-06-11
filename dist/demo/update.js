"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_js_1 = __importDefault(require("./types.js"));
const update = (state, msg) => {
    console.log("%cStore received message", "background: blue", msg);
    switch (msg.type) {
        case "INIT":
            return {
                count: 0,
            };
        case types_js_1.default.CLICK_TEST:
            return {
                ...state,
                count: state.count + 1,
            };
        default:
            return state;
    }
};
exports.default = update;
