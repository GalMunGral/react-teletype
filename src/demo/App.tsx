import React from "react";
import { useSession } from "../Session.js";
import { Message, State } from "./types.js";

const App = () => {
  const { r, g, b, count } = useSession<State>();
  return (
    <div
      style={{
        margin: "auto",
        width: 300,
        background: `rgb(${r},${g},${b}, 0.2)`,
        padding: 20,
      }}
    >
      <div
        style={{
          height: 300,
          background: `rgb(${r},${g},${b},0.8)`,
          lineHeight: "300px",
          fontSize: 20,
          textAlign: "center",
          fontFamily: "monospace",
          fontWeight: 800,
          color: "white",
        }}
      >
        Hello World + {count}
      </div>
      <button
        style={{
          width: "100%",
          background: "white",
          fontFamily: "monospace",
          fontSize: 20,
        }}
        data-click={{ type: "INCREMENT" } as Message}
      >
        click
      </button>
    </div>
  );
};
export default App;
