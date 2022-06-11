import { Reducer } from "react";
import { State, Message } from "./types.js";

export const reducer: Reducer<State, Message> = (state, msg) => {
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
