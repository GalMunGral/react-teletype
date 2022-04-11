import React, { ReactNode } from "react";
import Store, { StoreContext } from "./Store.js";

type Props = {
  store: Store;
  children: ReactNode;
};

const StoreProvider: React.FC<Props> = ({ store, children }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export default StoreProvider;
