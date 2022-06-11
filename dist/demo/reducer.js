"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reducer = void 0;
const reducer = (state, msg) => {
    switch (msg.type) {
        case "INIT":
            return {
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255),
                count: 0,
            };
        case "INCREMENT":
            return {
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255),
                count: state.count + 1,
            };
        default:
            return state;
    }
};
exports.reducer = reducer;
