import React, { ReactNode, useContext, useEffect, useReducer } from "react";
import type { ServerCommand, Observer, Reducer } from "./types";

type Props = {
  store: Store;
  children: ReactNode;
};

export class Store<T extends object = any> {
  public state: T = null!;
  private observers: Observer<T>[] = [];
  constructor(private update: Reducer<T>) {}

  public dispatch(msg: ServerCommand) {
    this.state = this.update(this.state, msg);
    this.observers.forEach((obs) => obs(this.state));
  }

  public subscribe(observer: Observer<T>) {
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
    store.subscribe((state: any) => {
      console.debug("Component received state update:", state);
      forceUpdate();
    });
  }, []);

  return store.state;
};

export const StoreProvider: React.FC<Props> = ({ store, children }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
