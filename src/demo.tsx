import React from "react";
import { startApp } from "./index.js";
import { update } from "./demo/Update.js";
import { App } from "./demo/View.js";

startApp(<App />, update);
