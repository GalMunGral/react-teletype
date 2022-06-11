import React, { FC } from "react";
import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import { SplitRenderer } from "./Renderer.js";
import { Store, StoreProvider } from "./Store.js";
import { ServerCommand, Reducer } from "./types.js";

export function startApp(App: FC, update: Reducer<any>, port = 8080) {
  const server = http
    .createServer((req, res) => {
      if (!req.url) res.end();
      if (/\.js$/.test(req.url!)) {
        res.setHeader("Content-Type", "application/javascript");
        res.end(fs.readFileSync(path.join(__dirname, req.url!)));
        return;
      }
      res.end(`
        <div id="app"></div>
        <script>window.exports = {};</script>
        <script src="/teletype.js"></script>
    `);
    })
    .listen(port, () => {
      console.log(`listening on ${port}`);
    });

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
      send(message: ServerCommand) {
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
