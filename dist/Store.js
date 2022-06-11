"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProvider = exports.useUpdate = exports.StoreContext = exports.Store = void 0;
const react_1 = __importStar(require("react"));
class Store {
    update;
    state = null;
    observers = [];
    constructor(update) {
        this.update = update;
    }
    dispatch(msg) {
        this.state = this.update(this.state, msg);
        this.observers.forEach((obs) => obs(this.state));
    }
    subscribe(observer) {
        this.observers.push(observer);
    }
}
exports.Store = Store;
exports.StoreContext = react_1.default.createContext(null);
const useUpdate = () => {
    const [, forceUpdate] = (0, react_1.useReducer)((s) => s + 1, 0);
    const store = (0, react_1.useContext)(exports.StoreContext);
    if (!store) {
        console.log("Cannot find StoreContext");
        return;
    }
    (0, react_1.useEffect)(() => {
        store.subscribe((state) => {
            console.debug("Component received state update:", state);
            forceUpdate();
        });
    }, []);
    return store.state;
};
exports.useUpdate = useUpdate;
const StoreProvider = ({ store, children }) => (react_1.default.createElement(exports.StoreContext.Provider, { value: store }, children));
exports.StoreProvider = StoreProvider;
