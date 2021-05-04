declare const self: ServiceWorkerGlobalScope;
import React from "react";
import SplitRenderer from "./renderer";
import Store, { Reducer } from "./Store";
import { Message } from "./types";
import renderClients from "./clients";
import StoreProvider from "./StoreProvider";

function setup(App: React.ComponentType, update: Reducer) {
  self.addEventListener("message", (e) => {
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

      renderer.render(
        <StoreProvider store={store}>
          <App />
        </StoreProvider>
      );
    }
  });
}

export default setup;
