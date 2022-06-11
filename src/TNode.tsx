export const TEvents = ["click"] as const;
export type TEvent = typeof TEvents[number];
export type TStyleDeclaration = { [key: string]: any };

export type TProps = {
  textContent?: string;
  style: TStyleDeclaration;
  events: Partial<Record<TEvent, ServerCommand>>;
};

export type Socket = {
  send(data: ServerCommand): void;
};

export type ServerCommand = {
  type: string;
  payload?: any;
};

export type Mutation =
  | {
      type: "SET_TEXT";
      text: string;
    }
  | {
      type: "SET_STYLE";
      property: string;
      value: any;
    }
  | {
      type: "SET_EVENT";
      event: TEvent;
      message: ServerCommand | undefined;
    };

export type ClientCommand =
  | {
      type: "CREATE_TEXT_INSTANCE";
      payload: {
        id: number;
        text: string;
        props?: object;
      };
    }
  | {
      type: "CREATE_INSTANCE";
      payload: {
        id: number;
        type: string;
        props: TProps | null;
      };
    }
  | {
      type: "UPDATE_TEXT";
      payload: {
        id: number;
        text: string;
      };
    }
  | {
      type: "UPDATE";
      payload: {
        id: number;
        mutations: Array<Mutation>;
      };
    }
  | {
      type: "APPEND_CHILD";
      payload: {
        parentId: number;
        childId: number;
      };
    }
  | {
      type: "CLEAR_CONTAINER";
    }
  | {
      type: "APPEND_CHILD_TO_CONTAINER";
      payload: {
        childId: number;
      };
    };

export class TNode {
  static nextId = 0;
  public id = TNode.nextId++;
  constructor(public client: Socket) {}
  protected sendMessage(msg: ClientCommand) {
    this.client.send(msg);
  }
}

export class TText extends TNode {
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

export class TElement extends TNode {
  public props: TProps = { style: {}, events: {} };
  public children = new Array<TNode>();
  constructor(
    public type: string,
    props: TProps | null,
    client: Socket,
    public isRoot = false
  ) {
    super(client);
    if (props) this.props = props;
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
    this.props = { style: {}, events: {} };
    this.sendMessage({
      type: "CLEAR_CONTAINER",
    });
  }

  public append(child: TNode) {
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

  public update(mutations: Array<Mutation>) {
    mutations.forEach((mutation) => {
      switch (mutation.type) {
        case "SET_STYLE":
          const { property, value } = mutation;
          this.props.style[property] = value;
          break;
        case "SET_EVENT":
          const { event, message } = mutation;
          this.props.events[event] = message;
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
