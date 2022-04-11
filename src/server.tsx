import http from "http";
import fs from "fs";
import App from "./App.js";
import update from "./update.js";
import { attach } from "./teletype/Server.js";

const server = http.createServer((req, res) => {
  if (req.url == "/client.js") {
    res.setHeader("Content-Type", "application/javascript");
    res.end(fs.readFileSync("./teletype/Client.js"));
    return;
  }

  res.end(`
    <div id="app"></div>
    <script>window.exports = {};</script>
    <script src="/client.js"></script>
  `);
});

attach(server, update, App);

server.listen(8080);
