import React from "react";
import { useSession } from "../session.js";
import { ServerCommand } from "../TNode.js";
import { Message, State } from "./types.js";

const App = () => {
  const { r, g, b, deltaX, deltaY, count } = useSession<State>();
  return (
    <div
      draggable
      style={{
        margin: "auto",
        width: 300,
        background: `rgb(${r},${g},${b}, 0.2)`,
        padding: 20,
        transform: `translate(${deltaX}px, ${deltaY}px)`,
      }}
      data-ondragstart={{ type: "DRAGSTART" } as ServerCommand}
      data-ondrag={{ type: "DRAG" } as ServerCommand}
      data-ondragend={{ type: "DRAGEND" } as ServerCommand}
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
          height: 40,
          background: "white",
          fontFamily: "monospace",
          fontSize: 20,
        }}
        data-onclick={{ type: "INCREMENT" } as ServerCommand}
      >
        click
      </button>
    </div>
  );
};
export default App;
