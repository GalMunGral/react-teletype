import Reconciler from "react-reconciler";
import { ReactNode } from "react";
import type { Socket } from "./types";
import { Mutation, TElement, TEvents, TProps, TText } from "./TNode";

type JSXProps<ModelCommand = any> = {
  style: CSSStyleDeclaration;
  children: ReactNode;
  [event: `data-${any}`]: ModelCommand;
};

function resolveProps(jsxProps: JSXProps): TProps {
  const resolved: TProps = { style: {}, events: {} };
  if (typeof jsxProps["children"] == "string") {
    resolved["textContent"] = jsxProps["children"];
  }
  resolved["style"] = jsxProps["style"];
  for (let event of TEvents) {
    if (jsxProps.hasOwnProperty("data-" + event)) {
      resolved.events[event] = jsxProps[("data-" + event) as `data-${any}`];
    }
  }
  return resolved;
}

function diffProps(oldJsxProps: JSXProps, newJsxProps: JSXProps) {
  const oldProps = resolveProps(oldJsxProps);
  const newProps = resolveProps(newJsxProps);
  const mutations = new Array<Mutation>();
  const oldStyle = oldProps["style"] ?? {};
  const newStyle = newProps["style"] ?? {};
  Object.entries(newStyle).forEach(([property, value]) => {
    if (newStyle[property as any] !== oldStyle[property as any]) {
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
  for (let e of TEvents) {
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

const SplitReconcilier = Reconciler<
  string,
  JSXProps,
  TElement,
  TElement,
  TText,
  unknown,
  unknown,
  unknown,
  { client: Socket },
  Array<Mutation>,
  unknown,
  unknown,
  unknown
>({
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
    return new TElement(type, resolveProps(props), client);
  },
  createTextInstance(text, _, { client }) {
    return new TText(text, client);
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
  cancelTimeout: function (id: unknown): void {
    throw new Error("Function not implemented.");
  },
});

export class SplitRenderer {
  private container: TElement;
  constructor(client: Socket) {
    this.container = SplitReconcilier.createContainer(
      new TElement("app", null, client, true),
      0,
      false,
      null
    );
  }
  render(node: ReactNode) {
    SplitReconcilier.updateContainer(node, this.container, null, () => {});
  }
}
