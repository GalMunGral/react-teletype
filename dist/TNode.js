"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TElement = exports.TText = exports.TNode = exports.TEvents = void 0;
exports.TEvents = ["click"];
class TNode {
    client;
    static nextId = 0;
    id = TNode.nextId++;
    constructor(client) {
        this.client = client;
    }
    sendMessage(msg) {
        this.client.send(msg);
    }
}
exports.TNode = TNode;
class TText extends TNode {
    text;
    constructor(text, client) {
        super(client);
        this.text = text;
        this.sendMessage({
            type: "CREATE_TEXT_INSTANCE",
            payload: {
                id: this.id,
                text,
            },
        });
    }
    update(newText) {
        this.sendMessage({
            type: "UPDATE_TEXT",
            payload: {
                id: this.id,
                text: newText,
            },
        });
    }
}
exports.TText = TText;
class TElement extends TNode {
    type;
    isRoot;
    props = { style: {}, events: {} };
    children = new Array();
    constructor(type, props, client, isRoot = false) {
        super(client);
        this.type = type;
        this.isRoot = isRoot;
        if (props)
            this.props = props;
        this.sendMessage({
            type: "CREATE_INSTANCE",
            payload: {
                id: this.id,
                type,
                props,
            },
        });
    }
    clear() {
        if (!this.isRoot) {
            console.warn("This is not a container");
        }
        this.children = [];
        this.props = { style: {}, events: {} };
        this.sendMessage({
            type: "CLEAR_CONTAINER",
        });
    }
    append(child) {
        this.children.push(child);
        if (this.isRoot) {
            this.sendMessage({
                type: "APPEND_CHILD_TO_CONTAINER",
                payload: { childId: child.id },
            });
        }
        else {
            this.sendMessage({
                type: "APPEND_CHILD",
                payload: { parentId: this.id, childId: child.id },
            });
        }
    }
    update(mutations) {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case "SET_STYLE":
                    const { property, value } = mutation;
                    this.props.style[property] = value;
                    break;
                case "SET_EVENT":
                    const { event, message } = mutation;
                    this.props.events[event] = message;
                    break;
            }
        });
        this.sendMessage({
            type: "UPDATE",
            payload: {
                id: this.id,
                mutations,
            },
        });
    }
}
exports.TElement = TElement;
