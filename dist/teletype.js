"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { hostname, port } = location;
const ws = new WebSocket(`ws://${hostname}:${port}`);
const nodeMap = new Map();
ws.onopen = () => {
    const key = "USER_ID";
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, crypto.randomUUID());
    }
    ws.send(localStorage.getItem(key));
};
ws.onmessage = (e) => {
    try {
        handleMessage(JSON.parse(e.data));
    }
    catch (err) {
        console.log(err, e);
    }
};
function sendMessage(msg) {
    ws.send(JSON.stringify(msg));
}
function handleMessage(msg) {
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
                        el.style[name] = value;
                    });
                }
                if (props.events) {
                    for (let [event, msg] of Object.entries(props.events)) {
                        el["on" + event] = () => sendMessage(msg);
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
            const textNode = nodeMap.get(id);
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
                        el["on" + event] = message && (() => sendMessage(message));
                        break;
                }
            });
        }
    }
}
