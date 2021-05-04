// declare const self: ServiceWorkerGlobalScope;
import SplitRenderer from "./renderer";
import Store from "./Store";

type RenderClient = {
  port: MessagePort;
  renderer: SplitRenderer;
  store: Store;
};

const renderClients = new Map<string, RenderClient>();

export default renderClients;
