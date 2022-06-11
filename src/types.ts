export type ServerCommand = {
  type: string;
  payload?: any;
};

export type Reducer<State> = (state: State, msg: ServerCommand) => State;
export type Observer<State> = (state: State) => void;

export type Socket = {
  send(data: ServerCommand): void;
};
