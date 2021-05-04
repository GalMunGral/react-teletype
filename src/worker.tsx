declare const self: ServiceWorkerGlobalScope;

import setup from "./setup";
import App from "./demo-app/App";
import update from "./demo-app/update";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

setup(App, update);
