export type TStyleDeclaration = {
  [name in Exclude<keyof CSSStyleDeclaration, "length" | "parentRule">]?:
    | string
    | number
    | undefined;
};

export type ServerCommand = {
  type: string;
  args?: any;
};

export type SynthesizedServerCommand = ServerCommand & {
  checked: boolean;
  value: string;
  clientX: number;
  clientY: number;
  key: string;
  // todo
};

export interface TEventDeclaration {
  click?: ServerCommand;
  dragstart?: ServerCommand;
  drag?: ServerCommand;
  dragend?: ServerCommand;
  drop?: ServerCommand;
}

export interface TNodeProperties {
  draggable?: boolean;
  value?: string;
  // todo
}

export class TProps {
  public style: TStyleDeclaration = {};
  public events: TEventDeclaration = {};
  public properties: TNodeProperties = {};
}

export type Mutation =
  | {
      type: "SET_STYLE";
      name: keyof TStyleDeclaration;
      value: ValueOf<TStyleDeclaration>;
    }
  | {
      type: "SET_EVENT";
      name: keyof TEventDeclaration;
      value: ValueOf<TEventDeclaration>;
    }
  | {
      type: "SET_PROP";
      name: keyof TNodeProperties;
      value: ValueOf<TNodeProperties>;
    };

export type ClientCommand =
  | {
      type: "CREATE_TEXT_INSTANCE";
      args: {
        id: number;
        text: string;
      };
    }
  | {
      type: "UPDATE_TEXT";
      args: {
        id: number;
        text: string;
      };
    }
  | {
      type: "CREATE_INSTANCE";
      args: {
        id: number;
        type: string;
        props: TProps | null;
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
      type: "CLEAR_CONTAINER";
    }
  | {
      type: "APPEND_CHILD_TO_CONTAINER";
      args: {
        childId: number;
      };
    }
  | {
      type: "REMOVE_CHILD_FROM_CONTAINER";
      args: {
        childId: number;
      };
    }
  | {
      type: "APPEND_CHILD";
      args: {
        parentId: number;
        childId: number;
      };
    }
  | {
      type: "REMOVE_CHILD";
      args: {
        parentId: number;
        childId: number;
      };
    };

export interface Socket {
  send(data: ServerCommand): void;
}

export class TNode {
  static nextId = 0;
  public id = TNode.nextId++;
  constructor(public client: Socket) {}
  protected sendMessage(msg: ClientCommand) {
    this.client.send(msg);
  }
}

export class TContainer extends TNode {
  public children = new Array<TNode>();

  constructor(client: Socket) {
    super(client);
  }

  public clear() {
    this.children = [];
    this.sendMessage({
      type: "CLEAR_CONTAINER",
    });
  }
  public append(child: TNode) {
    this.children.push(child);
    this.sendMessage({
      type: "APPEND_CHILD_TO_CONTAINER",
      args: {
        childId: child.id,
      },
    });
  }
  public remove(child: TNode) {
    this.children = this.children.filter((c) => c != child);
    this.sendMessage({
      type: "REMOVE_CHILD_FROM_CONTAINER",
      args: {
        childId: child.id,
      },
    });
  }
}

export class TText extends TNode {
  constructor(public text: string, client: Socket) {
    super(client);
    this.sendMessage({
      type: "CREATE_TEXT_INSTANCE",
      args: {
        id: this.id,
        text,
      },
    });
  }

  public update(newText: string) {
    this.sendMessage({
      type: "UPDATE_TEXT",
      args: {
        id: this.id,
        text: newText,
      },
    });
  }
}

export class TElement extends TNode {
  public children = new Array<TNode>();

  constructor(public type: string, public props: TProps, client: Socket) {
    super(client);
    this.sendMessage({
      type: "CREATE_INSTANCE",
      args: {
        id: this.id,
        type,
        props,
      },
    });
  }

  public update(mutations: Array<Mutation>) {
    mutations.forEach((mutation) => {
      switch (mutation.type) {
        case "SET_STYLE": {
          const { name, value } = mutation;
          this.props.style[name] = value;
          break;
        }
        case "SET_EVENT": {
          const { name, value } = mutation;
          this.props.events[name] = value;
          break;
        }
        case "SET_PROP": {
          const { name, value } = mutation;
          (this.props.properties[name] as any) = value;
          break;
        }
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

  public append(child: TNode) {
    this.children.push(child);
    this.sendMessage({
      type: "APPEND_CHILD",
      args: {
        parentId: this.id,
        childId: child.id,
      },
    });
  }

  public remove(child: TNode) {
    this.children = this.children.filter((c) => c != child);
    this.sendMessage({
      type: "REMOVE_CHILD",
      args: {
        parentId: this.id,
        childId: child.id,
      },
    });
  }
}
