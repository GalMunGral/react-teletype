import React from "react";
import { startApp } from "./index.js";
import App from "./demo/App.js";
import { reducer } from "./demo/reducer.js";

startApp(<App />, reducer);
