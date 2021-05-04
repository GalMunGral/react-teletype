import { Reducer } from "../Store";
import Msg from "./types";

const update: Reducer = (state, msg) => {
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
