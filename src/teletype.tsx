import {
  ClientCommand,
  SynthesizedServerCommand,
  TEventDeclaration,
  TNodeProperties,
  TStyleDeclaration,
} from "./TNode";

type ServerCommand = any;

const { protocol, hostname, port } = location;
const ws = new WebSocket(
  `${protocol == "https:" ? "wss" : "ws"}://${hostname}:${port}`
);

ws.onopen = () => {
  const key = "USER_ID";
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, crypto.randomUUID());
  }
  ws.send(localStorage.getItem(key)!);
  setInterval(() => ws.send(""), 2000); // hack: keep-alive
};

ws.onmessage = (e) => {
  try {
    handleMessage(JSON.parse(e.data));
  } catch (err) {
    console.log(err, e);
  }
};

function eventWrapper(
  eventName: string,
  cmd: ServerCommand
): (e: Event) => void {
  return (e: Event) => {
    if (eventName == "dragstart") {
      (e as DragEvent).dataTransfer?.setDragImage(dragImage, 0, 0);
    }
    ws.send(
      JSON.stringify({
        ...cmd,
        clientX: e instanceof MouseEvent ? e.clientX : 0,
        clientY: e instanceof MouseEvent ? e.clientY : 0,
        key: e instanceof KeyboardEvent ? e.key : "",
        value: e instanceof HTMLInputElement ? e.value : "",
        checked: e instanceof HTMLInputElement ? e.checked : false,
      })
    );
  };
}

const nodeMap = new Map<number, Node>();
const dragImage = document.createElement("div");
dragImage.style.height = "100px";
dragImage.style.width = "100px";
dragImage.style.position = "fixed";
dragImage.style.background = "red";
dragImage.style.top = "0";
dragImage.style.left = "-100px";
document.body.append(dragImage);

function handleMessage(msg: ClientCommand) {
  switch (msg.type) {
    case "CREATE_TEXT_INSTANCE": {
      const { id, text } = msg.args;
      const textNode = new Text(text);
      nodeMap.set(id, textNode);
      break;
    }

    case "UPDATE_TEXT": {
      const { id, text } = msg.args;
      const textNode = nodeMap.get(id) as Text;
      textNode.textContent = text;
      break;
    }

    case "CREATE_INSTANCE": {
      const { id, type, props } = msg.args;
      const el = document.createElement(type);
      if (props) {
        for (const [name, value] of Object.entries(
          props.properties
        ) as EntriesOf<TNodeProperties>) {
          (el as any)[name] = value;
        }

        for (const [name, value] of Object.entries(
          props.style
        ) as EntriesOf<TStyleDeclaration>) {
          (el.style[name] as any) = value;
        }

        for (const [event, cmd] of Object.entries(
          props.events
        ) as EntriesOf<TEventDeclaration>) {
          (el as any)["on" + event] = cmd
            ? eventWrapper(event, cmd)
            : undefined;
        }
      }
      nodeMap.set(id, el);
      break;
    }

    case "UPDATE": {
      const { id, mutations } = msg.payload;
      const el = nodeMap.get(id)!;
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case "SET_PROP": {
            const { name, value } = mutation;
            (el as any)[name] = value;
            break;
          }
          case "SET_STYLE": {
            const { name, value } = mutation;
            ((el as HTMLElement).style[name] as any) = value;
            break;
          }
          case "SET_EVENT": {
            const { name, value } = mutation;
            (el as any)["on" + name] = value
              ? eventWrapper(name, value)
              : undefined;
            break;
          }
        }
      });
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
      if (!containerEl) throw "Could not find container #app";
      const { childId } = msg.args;
      const childEl = nodeMap.get(childId)!;
      containerEl.appendChild(childEl);
      break;
    }

    case "REMOVE_CHILD_FROM_CONTAINER": {
      const containerEl = document.querySelector("#app");
      if (!containerEl) throw "Could not find container #app";
      const { childId } = msg.args;
      const childEl = nodeMap.get(childId)!;
      containerEl.removeChild(childEl);
      break;
    }

    case "APPEND_CHILD": {
      const { parentId, childId } = msg.args;
      const parentEl = nodeMap.get(parentId) as Element;
      const childEl = nodeMap.get(childId)!;
      parentEl.appendChild(childEl);
      break;
    }

    case "REMOVE_CHILD": {
      const { parentId, childId } = msg.args;
      const parentEl = nodeMap.get(parentId) as Element;
      const childEl = nodeMap.get(childId)!;
      parentEl.removeChild(childEl);
      break;
    }

    default:
      throw msg;
  }
}
