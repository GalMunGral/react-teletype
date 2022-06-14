export type State = {
  r: number;
  g: number;
  b: number;
  prevX: number;
  prevY: number;
  deltaX: number;
  deltaY: number;
  count: number;
};

export type Message =
  | {
      type: "INCREMENT";
    }
  | {
      type: "DRAGSTART";
      clientX: number;
      clientY: number;
    }
  | {
      type: "DRAG";
      clientX: number;
      clientY: number;
    }
  | {
      type: "INIT";
    };
