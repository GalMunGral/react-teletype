import { ReactNode } from "react";
import Reconciler from "react-reconciler";
import { CustomHostConfig } from "./hostConfig";
import hostConfig from "./hostConfig";
import { SWElement } from "./WorkerDOM";

const SplitReconcilier = Reconciler(hostConfig as unknown as CustomHostConfig);

class SplitRenderer {
  private container: SWElement;

  constructor(clientPort: MessagePort) {
    const containerEl = new SWElement("app", {}, clientPort, true);
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
