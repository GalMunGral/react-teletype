"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitRenderer = void 0;
const react_reconciler_1 = __importDefault(require("react-reconciler"));
const TNode_1 = require("./TNode");
function resolveProps(jsxProps) {
    const resolved = { style: {}, events: {} };
    if (typeof jsxProps["children"] == "string") {
        resolved["textContent"] = jsxProps["children"];
    }
    resolved["style"] = jsxProps["style"];
    for (let event of TNode_1.TEvents) {
        if (jsxProps.hasOwnProperty("data-" + event)) {
            resolved.events[event] = jsxProps[("data-" + event)];
        }
    }
    return resolved;
}
function diffProps(oldJsxProps, newJsxProps) {
    const oldProps = resolveProps(oldJsxProps);
    const newProps = resolveProps(newJsxProps);
    const mutations = new Array();
    const oldStyle = oldProps["style"] ?? {};
    const newStyle = newProps["style"] ?? {};
    Object.entries(newStyle).forEach(([property, value]) => {
        if (newStyle[property] !== oldStyle[property]) {
            mutations.push({
                type: "SET_STYLE",
                property,
                value,
            });
        }
    });
    Object.keys(oldStyle).forEach((property) => {
        if (!(property in newStyle)) {
            mutations.push({
                type: "SET_STYLE",
                property,
                value: undefined,
            });
        }
    });
    for (let e of TNode_1.TEvents) {
        if (newProps.events[e] !== oldProps.events[e]) {
            mutations.push({
                type: "SET_EVENT",
                event: e,
                message: newProps.events[e],
            });
        }
    }
    return mutations;
}
const SplitReconcilier = (0, react_reconciler_1.default)({
    isPrimaryRenderer: true,
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    noTimeout: new Error("Not implemented"),
    getRootHostContext({ client }) {
        return { client };
    },
    getChildHostContext(parentHostContext) {
        return parentHostContext;
    },
    shouldSetTextContent(_, { children }) {
        return typeof children == "string";
    },
    resetTextContent() {
        throw new Error("Function not implemented.");
    },
    createInstance(type, props, _, { client }) {
        return new TNode_1.TElement(type, resolveProps(props), client);
    },
    createTextInstance(text, _, { client }) {
        return new TNode_1.TText(text, client);
    },
    finalizeInitialChildren() {
        return false;
    },
    appendInitialChild(parent, child) {
        parent.append(child);
    },
    prepareForCommit() {
        return null;
    },
    clearContainer(container) {
        container.clear();
    },
    appendChildToContainer(container, child) {
        container.append(child);
    },
    prepareUpdate(instance, type, oldProps, newProps) {
        const updatePayload = diffProps(oldProps, newProps);
        return updatePayload.length ? updatePayload : null;
    },
    commitUpdate(instance, updatePayload) {
        instance.update(updatePayload);
    },
    commitTextUpdate(textInstance, oldText, newText) {
        textInstance.update(newText);
    },
    resetAfterCommit() {
        // throw new Error("Function not implemented.");
    },
    getPublicInstance: function () {
        throw new Error("Function not implemented.");
    },
    preparePortalMount: function () {
        throw new Error("Function not implemented.");
    },
    now: function () {
        throw new Error("Function not implemented.");
    },
    scheduleTimeout() {
        throw new Error("Function not implemented.");
    },
    cancelTimeout: function (id) {
        throw new Error("Function not implemented.");
    },
});
class SplitRenderer {
    container;
    constructor(client) {
        this.container = SplitReconcilier.createContainer(new TNode_1.TElement("app", null, client, true), 0, false, null);
    }
    render(node) {
        SplitReconcilier.updateContainer(node, this.container, null, () => { });
    }
}
exports.SplitRenderer = SplitRenderer;
