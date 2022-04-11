import { ReactNode } from "react";
import Reconciler from "react-reconciler";
import { CustomHostConfig } from "./HostConfig.js";
import hostConfig from "./HostConfig.js";
import { SWElement } from "./Teletype.js";
import { Socket } from "./types.js";

const SplitReconcilier = Reconciler(hostConfig as unknown as CustomHostConfig);

class SplitRenderer {
  private container: SWElement;

  constructor(client: Socket) {
    const containerEl = new SWElement("app", {}, client, true);
    this.container = SplitReconcilier.createContainer(
      containerEl,
      0,
      false,
      null
    );
  }

  render(reactElement: ReactNode) {
    SplitReconcilier.updateContainer(
      reactElement,
      this.container,
      null,
      () => null
    );
  }
}

export default SplitRenderer;
