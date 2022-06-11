export type State = {
  r: number;
  g: number;
  b: number;
  count: number;
};

export type Message =
  | {
      type: "INCREMENT";
    }
  | {
      type: "INIT";
    };
