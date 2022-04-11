import type { Message, Socket } from "./types";

export type Mutation =
  | {
      type: "TEXT";
      text: string;
    }
  | {
      type: "STYLE";
      property: string;
      value: unknown;
    }
  | {
      type: "EVENT";
      event: string;
      message: Message;
    };

class Teletype {
  static nextId = 0;
  public id = Teletype.nextId++;

  constructor(private client: Socket) {}

  protected sendMessage(msg: Message) {
    this.client.send(msg);
  }
}

export class SWText extends Teletype {
  constructor(public text: string, client: Socket) {
    super(client);
    this.sendMessage({
      type: "CREATE_TEXT_INSTANCE",
      payload: {
        id: this.id,
        text,
      },
    });
  }
  public update(newText: string) {
    this.sendMessage({
      type: "UPDATE_TEXT",
      payload: {
        id: this.id,
        text: newText,
      },
    });
  }
}

export class SWElement extends Teletype {
  public children: SWElement[] = [];
  constructor(
    public type: string,
    public props: Record<string, any>,
    client: Socket,
    public isRoot = false
  ) {
    super(client);
    this.sendMessage({
      type: "CREATE_INSTANCE",
      payload: {
        id: this.id,
        type,
        props,
      },
    });
  }

  public clear() {
    if (!this.isRoot) {
      console.warn("This is not a container");
    }
    this.children = [];
    this.props = {};
    this.sendMessage({
      type: "CLEAR_CONTAINER",
    });
  }

  public append(child: SWElement) {
    this.children.push(child);
    if (this.isRoot) {
      this.sendMessage({
        type: "APPEND_CHILD_TO_CONTAINER",
        payload: { childId: child.id },
      });
    } else {
      this.sendMessage({
        type: "APPEND_CHILD",
        payload: { parentId: this.id, childId: child.id },
      });
    }
  }

  public update(mutations: Mutation[]) {
    mutations.forEach((mutation) => {
      switch (mutation.type) {
        case "STYLE":
          const { property, value } = mutation;
          this.props.style[property] = value;
          break;
        case "EVENT":
          const { event, message } = mutation;
          this.props[event] = message;
          break;
      }
    });
    this.sendMessage({
      type: "UPDATE",
      payload: {
        id: this.id,
        mutations,
      },
    });
  }
}
