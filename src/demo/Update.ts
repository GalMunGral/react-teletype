import { Update } from "../Session.js";
import { State } from "./State.js";

export type Message =
  | {
      type: "INCREMENT";
    }
  | {
      type: "DRAGSTART";
      clientX: number;
      clientY: number;
    }
  | {
      type: "DRAG";
      clientX: number;
      clientY: number;
    }
  | {
      type: "INIT";
    };

export const update: Update<State, Message> = (state, msg) => {
  switch (msg.type) {
    case "INIT":
      return {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        prevX: 0,
        prevY: 0,
        deltaX: 0,
        deltaY: 0,
        count: 0,
      };
    case "INCREMENT":
      return {
        ...state,
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        count: state.count + 1,
      };
    case "DRAGSTART": {
      const { clientX, clientY } = msg;
      return {
        ...state,
        prevX: clientX,
        prevY: clientY,
      };
    }
    case "DRAG": {
      const { clientX, clientY } = msg;
      return {
        ...state,
        prevX: clientX,
        prevY: clientY,
        deltaX: state.deltaX + clientX - state.prevX,
        deltaY: state.deltaY + clientY - state.prevY,
      };
    }
    default:
      return state;
  }
};
