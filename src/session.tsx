import React, { useContext, useEffect, useReducer } from "react";

export type Reducer<State, Message> = (state: State, msg: Message) => State;
export type Observer<State> = (state: State) => void;

export class Session<State = any, Message = any> {
  public state: State = null!;
  private observers = new Array<Observer<State>>();
  constructor(private reducer: Reducer<State, Message>) {}
  public dispatch(msg: Message) {
    this.state = this.reducer(this.state, msg);
    this.observers.forEach((obs) => obs(this.state));
  }
  public subscribe(observer: Observer<State>) {
    this.observers.push(observer);
  }
}

export const SessionContext = React.createContext<Session | null>(null);

export function useSession<State = any>(): State {
  const [, forceUpdate] = useReducer((s) => s + 1, 0);
  const session = useContext(SessionContext) as Session<State>;
  if (!session) throw "There is no SessionContext";
  useEffect(() => {
    session.subscribe(() => forceUpdate());
  }, []);
  return session.state;
}
