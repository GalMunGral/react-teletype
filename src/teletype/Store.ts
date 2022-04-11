import React, { useContext, useEffect, useReducer } from "react";
import type { Message } from "./types";

type State = any;
export type Reducer = (state: State, msg: Message) => State;
export type Observer = (state: State) => void;

export class Store {
  public state: State = null;
  private observers: Observer[] = [];
  constructor(private update: Reducer) {}

  public dispatch(msg: Message) {
    this.state = this.update(this.state, msg);
    this.observers.forEach((obs) => obs(this.state));
  }

  public subscribe(observer: Observer) {
    this.observers.push(observer);
  }
}

export const StoreContext = React.createContext<Store | null>(null);

export const useUpdate = () => {
  const [, forceUpdate] = useReducer((s) => s + 1, 0);
  const store = useContext(StoreContext);
  if (!store) {
    console.log("Cannot find StoreContext");
    return;
  }
  useEffect(() => {
    store.subscribe((state: State) => {
      console.debug("Component received state update:", state);
      forceUpdate();
    });
  }, []);

  return store.state;
};

export default Store;
