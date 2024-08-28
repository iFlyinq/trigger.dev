type State = string;

export type StateTransition<S extends State, I extends string = string> = {
  id: I;
  /** States it can transition from.
   * If undefined it can move from any state. */
  from?: readonly S[];
  /** States it transitions to */
  to: S;
};

type Result<S extends State> =
  | {
      success: true;
      state: S;
    }
  | {
      success: false;
      error: string;
    };

export class StateMachine<S extends State, I extends string, T extends StateTransition<S, I>> {
  private states: readonly S[];
  private transitions: T[];
  private state?: S;

  constructor(states: readonly S[], transitions: T[]) {
    this.states = states;
    this.transitions = transitions;
  }

  public setInitialState(state: S) {
    if (!this.states.includes(state)) {
      throw new Error(`Invalid state: ${state}`);
    }
    this.state = state;
  }

  public get currentState() {
    return this.state;
  }

  public get allTransitions() {
    return this.transitions;
  }

  public transition(to: S): Result<S> {
    const transition = this.transitions.find((t) => {
      if (t.from) {
        if (!this.state) return false;
        return t.from.includes(this.state);
      }
      return t.to === to;
    });
    if (!transition) {
      return {
        success: false,
        error: `Invalid transition from ${this.currentState ?? "none"} to ${to}`,
      };
    }

    this.state = to;
    return { success: true, state: to };
  }
}

export type PossibleTransitions<M extends StateMachine<any, any, any>> = M extends StateMachine<
  infer S,
  infer I,
  infer T
>
  ? T
  : never;

export type PossibleTransitionIds<M extends StateMachine<any, any, any>> = M extends StateMachine<
  infer S,
  infer I,
  infer T
>
  ? I
  : never;
