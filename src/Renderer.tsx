import Reconciler from "react-reconciler";
import { ReactNode } from "react";
import {
  Socket,
  TContainer,
  TElement,
  TText,
  TNode,
  TProps,
  TEventDeclaration,
  TStyleDeclaration,
  Mutation,
  ServerCommand,
} from "./TNode";

type JSXProps = {
  style?: TStyleDeclaration;
  draggable?: boolean;
  value: string;
  "data-onclick": ServerCommand;
  "data-ondragstart": ServerCommand;
  "data-ondrag": ServerCommand;
  "data-ondragend": ServerCommand;
  "data-ondrop": ServerCommand;
};

function normalizeProps(jsxProps: JSXProps): TProps {
  const resolved = new TProps();
  (Object.keys(jsxProps) as KeysOf<JSXProps>).forEach((key) => {
    switch (key) {
      case "draggable": {
        resolved.properties[key] = jsxProps.draggable;
        break;
      }
      case "value": {
        resolved.properties[key] = jsxProps.value;
        break;
      }
      case "style": {
        resolved.style = jsxProps.style!;
        break;
      }
      case "data-onclick":
      case "data-ondrag":
      case "data-ondragstart":
      case "data-ondragend":
      case "data-ondrop": {
        const event = key.slice(7) as keyof TEventDeclaration;
        resolved.events[event] = jsxProps[key];
        break;
      }
    }
  });
  return resolved;
}

function diffProps(oldJsxProps: JSXProps, newJsxProps: JSXProps) {
  const mutations = new Array<Mutation>();

  (Object.keys(newJsxProps) as KeysOf<JSXProps>).forEach((key) => {
    switch (key) {
      case "draggable":
      case "value": {
        if (newJsxProps[key] !== oldJsxProps[key])
          mutations.push({
            type: "SET_PROP",
            name: key,
            value: newJsxProps[key],
          });
        break;
      }
      case "style": {
        const newStyle = newJsxProps.style!;
        const oldStyle = oldJsxProps.style!;
        (Object.keys(newStyle) as KeysOf<TStyleDeclaration>).forEach((name) => {
          if (newStyle[name] !== oldStyle[name]) {
            mutations.push({
              type: "SET_STYLE",
              name,
              value: newStyle[name],
            });
          }
        });
        (Object.keys(oldStyle) as KeysOf<TStyleDeclaration>).forEach((name) => {
          if (!(name in newStyle)) {
            mutations.push({
              type: "SET_STYLE",
              name,
              value: undefined,
            });
          }
        });
        break;
      }
      case "data-ondrag":
      case "data-ondragstart":
      case "data-ondragend":
      case "data-ondrop": {
        if (
          JSON.stringify(newJsxProps[key]) != JSON.stringify(oldJsxProps[key])
        ) {
          mutations.push({
            type: "SET_EVENT",
            name: key.slice(7) as keyof TEventDeclaration,
            value: newJsxProps[key],
          });
        }
        break;
      }
    }
  });

  return mutations;
}

interface HostContext {
  client: Socket;
}

const SplitReconcilier = Reconciler<
  string,
  JSXProps,
  TContainer,
  TElement,
  TText,
  TNode, // not sure
  unknown,
  unknown,
  HostContext,
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
  shouldSetTextContent() {
    return false;
  },
  resetTextContent() {
    throw new Error("Function not implemented.");
  },
  createInstance(type, props, _, { client }) {
    return new TElement(type, normalizeProps(props), client);
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
  appendChild(parent, child) {
    parent.append(child);
  },
  appendChildToContainer(container, child) {
    container.append(child);
  },
  removeChild(parent, child) {
    parent.remove(child);
  },
  removeChildFromContainer(container, child) {
    container.remove(child);
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
      new TContainer(client),
      0,
      false,
      null
    );
  }
  render(node: ReactNode) {
    SplitReconcilier.updateContainer(node, this.container, null, () => {});
  }
}
