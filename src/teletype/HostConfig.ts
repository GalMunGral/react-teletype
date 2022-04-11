import { HostConfig } from "react-reconciler";
import { Mutation, SWElement, SWText } from "./Teletype.js";

export type CustomHostConfig = HostConfig<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> & {
  [key: string]: any;
};

function resolveProps(jsxProps: Record<string, any>) {
  const resolved = {} as Record<string, any>;
  if (typeof jsxProps["children"] == "string") {
    resolved["textContent"] = jsxProps["children"];
  }
  resolved["style"] = jsxProps["style"];
  resolved["onClick"] = jsxProps["data-onClick"];
  return resolved;
}

function compareProps(
  oldProps: Record<string, any>,
  newProps: Record<string, any>
) {
  oldProps = resolveProps(oldProps);
  newProps = resolveProps(newProps);
  const mutations = [] as Mutation[];
  const oldStyle = oldProps["style"] || {};
  const newStyle = newProps["style"] || {};
  Object.entries(newStyle).forEach(([property, value]) => {
    if (newStyle[property] !== oldStyle[property]) {
      mutations.push({
        type: "STYLE",
        property,
        value,
      });
    }
  });
  Object.keys(oldStyle).forEach((property) => {
    if (!(property in newStyle)) {
      mutations.push({
        type: "STYLE",
        property,
        value: undefined,
      });
    }
  });
  if (newProps["onClick"] !== oldProps["onClick"]) {
    mutations.push({
      type: "EVENT",
      event: "onClick",
      message: newProps["onClick"],
    });
  }
  return mutations;
}

const hostConfig = {
  supportsMutation: true,
  getRootHostContext(container) {
    return {
      client: container.client,
    };
  },
  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },
  shouldSetTextContent(_, props) {
    return typeof props.children == "string";
  },
  resetTextContent(node) {
    console.log("TODO: reset text content", node);
  },
  createInstance(type, props, _, hostContext) {
    const { client } = hostContext;
    props = resolveProps(props);
    return new SWElement(type, props, client);
  },
  createTextInstance(text, _, hostContext) {
    const { client } = hostContext;
    return new SWText(text, client);
  },
  finalizeInitialChildren() {
    return false;
  },
  appendInitialChild(parent: SWElement, child: SWElement) {
    parent.append(child);
  },
  prepareForCommit() {
    return null;
  },
  clearContainer(container: SWElement) {
    container.clear();
  },
  appendChildToContainer(container: SWElement, child: SWElement) {
    container.append(child);
  },
  prepareUpdate(_, __, oldProps, newProps) {
    const updatePayload = compareProps(oldProps, newProps);
    if (!updatePayload.length) return null;
    return updatePayload;
  },
  commitUpdate(instance: SWElement, updatePayload: Mutation[]) {
    instance.update(updatePayload);
  },
  commitTextUpdate(textInstance: SWText, _, newText: string) {
    textInstance.update(newText);
  },
  resetAfterCommit() {},
} as Partial<CustomHostConfig>;

export default hostConfig;
