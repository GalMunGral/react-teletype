declare const self: SharedWorkerGlobalScope;
import React from "react";
import SplitRenderer from "./renderer";
import Store, { Reducer } from "./Store";
import { Message } from "./types";
import StoreProvider from "./StoreProvider";
import App from "./demo-app/App";
import update from "./demo-app/update";

self.addEventListener("connect", async (e) => {
  const port = e.ports[0];

  // Model - Update
  const store = new Store(update);
  store.dispatch({ type: "INIT" });
  port.onmessage = (e) => {
    const msg: Message = e.data;
    store.dispatch(msg);
  };

  // View
  const renderer = new SplitRenderer(port);
  renderer.render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  );
});
