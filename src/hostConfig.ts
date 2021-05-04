import { HostConfig } from "react-reconciler";
import { Mutation, SWElement, SWText } from "./WorkerDOM";

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
  getRootHostContext(container) {
    return {
      clientId: container.clientId,
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
    const { clientId } = hostContext;
    props = resolveProps(props);
    return new SWElement(type, props, clientId);
  },
  createTextInstance(text, _, hostContext) {
    const { clientId } = hostContext;
    return new SWText(text, clientId);
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

const proxiedHostConfig = new Proxy(hostConfig, {
  get(target, prop, receiver) {
    if (Reflect.has(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    const funcName = String(prop);
    const fn = () => {};
    const fnProxy = new Proxy(fn, {
      apply(target, thisArg, args) {
        const retVal = Reflect.apply(target, thisArg, args);
        console.debug(
          `(${thisArg})::${funcName}(`,
          ...args.flatMap((arg, i) => (i > 0 ? [",", arg] : arg)),
          `) -> `,
          retVal
        );
        return retVal;
      },
    });
    return fnProxy;
  },
});

export default proxiedHostConfig;
