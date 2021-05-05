import { Message } from "./types";
import { Mutation } from "./ServiceWorkerDOM";

const messageChannel = new MessageChannel();
const nodeMap = new Map();

function sendMessage(msg: Message) {
  messageChannel.port1.postMessage(msg);
}

function handleMessage(msg: Message) {
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
      if (props.textContent) {
        el.textContent = props.textContent;
      }
      if (props.style) {
        Object.entries(props.style).forEach(([name, value]) => {
          el.style[name] = value;
        });
      }
      if (props.onClick) {
        el.onclick = () => sendMessage(props.onClick);
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
      (mutations as Mutation[]).forEach((mutation) => {
        switch (mutation.type) {
          case "STYLE":
            const { property, value } = mutation;
            el.style[property] = value;
            break;
          case "EVENT":
            const { event, message } = mutation;
            if (event != "onClick") {
              console.warn("TODO: IMPLEMENT THIS");
              return;
            }
            el.onclick = () => sendMessage(message);
            break;
        }
      });
    }
  }
}

async function registerWorker() {
  const manifest = await (await fetch("/worker-manifest.json")).json();
  const reg = await navigator.serviceWorker.register(manifest.path);
  const serviceWorker = reg.active || reg.waiting || reg.installing;
  if (!serviceWorker) return;
  if (serviceWorker.state !== "activated") {
    serviceWorker.onstatechange = handleServiceWorkerStateChange;
  } else {
    establishMessageChannel(serviceWorker);
  }
}

function handleServiceWorkerStateChange(this: ServiceWorker) {
  if (this.state === "activated") {
    establishMessageChannel(this);
  }
}

function establishMessageChannel(serviceWorker: ServiceWorker) {
  messageChannel.port1.onmessage = (e) => handleMessage(e.data);
  serviceWorker.postMessage({ type: "CONNECT" }, [messageChannel.port2]);
}

registerWorker();
