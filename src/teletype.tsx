import type { ServerCommand } from "./types";
import { ClientCommand } from "./TNode";

const nodeMap = new Map();

const { hostname, port } = location;
const ws = new WebSocket(`ws://${hostname}:${port}`);

ws.addEventListener("message", (e) => {
  try {
    handleMessage(JSON.parse(e.data));
  } catch (err) {
    console.log(err, e);
  }
});

function sendMessage(msg: ServerCommand) {
  ws.send(JSON.stringify(msg));
}

function handleMessage(msg: ClientCommand) {
  console.log("%cWindowClient received message", "background: green", msg);

  switch (msg.type) {
    case "CREATE_TEXT_INSTANCE": {
      const { id, text } = msg.payload;
      const textNode = new Text(text);
      nodeMap.set(id, textNode);
      break;
    }
    case "CREATE_INSTANCE": {
      const { id, type, props } = msg.payload;
      const el = document.createElement(type);
      if (props) {
        if (props.textContent) {
          el.textContent = props.textContent;
        }
        if (props.style) {
          Object.entries(props.style).forEach(([name, value]) => {
            el.style[name as any] = value;
          });
        }
        if (props.events) {
          for (let [event, msg] of Object.entries(props.events)) {
            (el as any)["on" + event] = () => sendMessage(msg);
          }
        }
      }
      nodeMap.set(id, el);
      break;
    }
    case "APPEND_CHILD": {
      const { parentId, childId } = msg.payload;
      const parentEl = nodeMap.get(parentId);
      const childEl = nodeMap.get(childId);
      parentEl.append(childEl);
      break;
    }
    case "CLEAR_CONTAINER": {
      const containerEl = document.querySelector("#app");
      if (!containerEl) {
        console.warn("Could not find container #app");
        return;
      }
      containerEl.innerHTML = "";
      break;
    }
    case "APPEND_CHILD_TO_CONTAINER": {
      const containerEl = document.querySelector("#app");
      if (!containerEl) {
        console.warn("Could not find container #app");
        return;
      }
      const { childId } = msg.payload;
      const childEl = nodeMap.get(childId);
      containerEl.append(childEl);
      break;
    }
    case "UPDATE_TEXT": {
      const { id, text } = msg.payload;
      const textNode = nodeMap.get(id) as Text;
      textNode.textContent = text;
      break;
    }
    case "UPDATE": {
      const { id, mutations } = msg.payload;
      const el = nodeMap.get(id);
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case "SET_STYLE":
            const { property, value } = mutation;
            el.style[property] = value;
            break;
          case "SET_EVENT":
            const { event, message } = mutation;
            (el as any)["on" + event] = message && (() => sendMessage(message));
            break;
        }
      });
    }
  }
}
