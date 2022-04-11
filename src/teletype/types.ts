export type Message = {
  type: string;
  [key: string]: any;
};

export type Socket = {
  send(data: Message): void;
};
