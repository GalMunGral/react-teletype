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
exports.useSession = exports.SessionContext = exports.Session = void 0;
const react_1 = __importStar(require("react"));
class Session {
    reducer;
    state = null;
    observers = new Array();
    constructor(reducer) {
        this.reducer = reducer;
    }
    dispatch(msg) {
        this.state = this.reducer(this.state, msg);
        this.observers.forEach((obs) => obs(this.state));
    }
    subscribe(observer) {
        this.observers.push(observer);
    }
}
exports.Session = Session;
exports.SessionContext = react_1.default.createContext(null);
function useSession() {
    const [, forceUpdate] = (0, react_1.useReducer)((s) => s + 1, 0);
    const session = (0, react_1.useContext)(exports.SessionContext);
    if (!session)
        throw "There is no SessionContext";
    (0, react_1.useEffect)(() => {
        session.subscribe(() => forceUpdate());
    }, []);
    return session.state;
}
exports.useSession = useSession;
