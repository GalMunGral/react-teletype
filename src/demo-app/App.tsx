import React from "react";
import { useUpdate } from "../Store";
import Msg from "./types";

const App = () => {
  const state = useUpdate();

  const R = Math.floor(Math.random() * 255);
  const G = Math.floor(Math.random() * 255);
  const B = Math.floor(Math.random() * 255);

  return (
    <div style={{ background: `rgb(${R},${G},${B})`, color: "white" }}>
      <div style={{ background: `gray`, color: `rgb(${G},${B},${R})` }}>
        Hello World + {state.count}
      </div>
      <button data-onClick={{ type: Msg.CLICK_TEST }}>click</button>
    </div>
  );
};
export default App;
