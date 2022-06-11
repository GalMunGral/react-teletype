import { Reducer } from "../types";
import Msg from "./types.js";

const update: Reducer<any> = (state: any, msg: any) => {
  console.log("%cStore received message", "background: blue", msg);
  switch (msg.type) {
    case "INIT":
      return {
        count: 0,
      };
    case Msg.CLICK_TEST:
      return {
        ...state,
        count: state.count + 1,
      };
    default:
      return state;
  }
};

export default update;
