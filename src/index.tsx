import http from "http";
import fs from "fs";
import path from "path";
import React, { ReactNode } from "react";
import { WebSocketServer } from "ws";
import { SplitRenderer } from "./Renderer.js";
import {
  Session,
  Reducer,
  SessionContext as SessionContext,
} from "./Session.js";

type ServerCommand = any;

export function startApp(
  rootNode: ReactNode,
  reducer: Reducer<any, any>,
  port = process.env.PORT
) {
  const bootstrap = `
    <div id="app"></div>
      <script>window.exports = {};</script>
    <script src="/teletype.js"></script>
  `;

  const server = http
    .createServer((req, res) => {
      if (!req.url) res.end();
      if (/\.js$/.test(req.url!)) {
        res.setHeader("Content-Type", "application/javascript");
        fs.createReadStream(path.join(__dirname, req.url!)).pipe(res);
      } else {
        res.end(bootstrap);
      }
    })
    .listen(port, () => {
      console.log(`listening on ${port}`);
    });

  const sessions = new Map<string, Session>();
  function getSession(userId: string): Session {
    if (!sessions.has(userId)) {
      const s = new Session(reducer);
      s.dispatch({ type: "INIT" });
      sessions.set(userId, s);
    }
    return sessions.get(userId)!;
  }

  const wss = new WebSocketServer({ server });
  wss.on("connection", (client) => {
    client.onmessage = (e) => {
      const userId = String(e.data);
      const session = getSession(userId);

      new SplitRenderer({
        send(message: ServerCommand) {
          client.send(JSON.stringify(message));
        },
      }).render(
        <SessionContext.Provider value={session}>
          {rootNode}
        </SessionContext.Provider>
      );

      client.onmessage = (e) => {
        const s = String(e.data);
        if (!s.length) return;
        try {
          session.dispatch(JSON.parse(s));
        } catch (e) {
          console.log(e);
        }
      };
    };
  });
}
