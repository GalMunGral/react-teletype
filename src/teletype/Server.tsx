import React, { FC, ReactNode } from "react";
import http from "http";
import { WebSocketServer } from "ws";
import SplitRenderer from "./Renderer.js";
import Store, { Reducer } from "./Store.js";
import StoreProvider from "./StoreProvider.js";
import { Message } from "./types.js";

export function attach(server: http.Server, update: Reducer, App: FC) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (client) => {
    // Model - Update
    const store = new Store(update);
    store.dispatch({ type: "INIT" });

    client.on("message", (data) => {
      store.dispatch(JSON.parse(data.toString("utf-8")));
    });

    // View
    const renderer = new SplitRenderer({
      send(message: Message) {
        client.send(JSON.stringify(message));
      },
    });
    renderer.render(
      <StoreProvider store={store}>
        <App />
      </StoreProvider>
    );

    client.send(JSON.stringify("connect"));
  });
}
