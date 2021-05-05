declare const self: ServiceWorkerGlobalScope;
import React from "react";
import SplitRenderer from "./renderer";
import Store, { Reducer } from "./Store";
import { Message } from "./types";
import renderClients from "./clients";
import StoreProvider from "./StoreProvider";

const once = (fn: (...args: any[]) => any) => {
  let called = false;
  return function (...args: any[]) {
    if (called) return;
    called = true;
    return fn(...args);
  };
};

const someCostlyInitFn = once(
  () =>
    new Promise((resolve) => {
      setTimeout(resolve, 10000);
    })
);

function setup(App: React.ComponentType, update: Reducer) {
  self.addEventListener("message", async (e) => {
    if (e.data.type === "CONNECT") {
      const clientId = (e.source as WindowClient)?.id;
      const port = e.ports[0];

      // Model - Update
      const store = new Store(update);
      store.dispatch({ type: "INIT" });
      port.onmessage = (e) => {
        const msg: Message = e.data;
        store.dispatch(msg);
      };

      // View
      const renderer = new SplitRenderer(clientId);

      // bugfix: need to register before render
      renderClients.set(clientId, {
        port,
        renderer,
        store,
      });

      // simulating a costly initialization
      const start = performance.now();
      console.log(`%cWAITING FOR INIT`, "background: red");
      await someCostlyInitFn();
      const t = performance.now() - start;
      console.log(`%cINIT TOOK ${t}ms`, "background: red");

      renderer.render(
        <StoreProvider store={store}>
          <App />
        </StoreProvider>
      );
    }
  });
}

export default setup;
