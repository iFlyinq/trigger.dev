import { TaskRunAttemptStatus, TaskRunStatus } from "@trigger.dev/database";

type State = string;

type StateTransition<S extends State> = {
  /** States it can transition from.
   * If undefined it can move from any state. */
  from?: S[];
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

const cancelRun: StateTransition<TaskRunStatus> = {
  from: ["PENDING"],
  to: "CANCELED",
};

const expireRun: StateTransition<TaskRunStatus> = {
  from: ["PENDING"],
  to: "EXPIRED",
};

const executeRun: StateTransition<TaskRunStatus> = {
  from: ["PENDING"],
  to: "EXECUTING",
};

class StateMachine<S extends State, T extends StateTransition<S>> {
  private states: S[];
  private transitions: T[];
  private state?: S;

  constructor(states: S[], transitions: T[]) {
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

  public transition(from: S, to: S): Result<S> {
    const transition = this.transitions.find((t) => {
      if (t.from && !t.from.includes(from)) {
        return false;
      }
      return t.to === to;
    });
    if (!transition) {
      return { success: false, error: `Invalid transition from ${from} to ${to}` };
    }

    this.state = to;
    return { success: true, state: to };
  }
}

type TaskRunState = {
  run: {
    status: TaskRunStatus;
  };
  attempt?: {
    status: TaskRunAttemptStatus;
  };
  timestamp: Date;
  waitingOn?: string;
  checkpointId?: string;
};

//todo what should this be responsible for?
// How does it interact with the database and Redis, if at all?
// How do only allow valid transitions?
// How do we make it testable for the basic transitions?

export class TaskRunStateMachine {
  private state: TaskRunState;

  constructor(initialState: TaskRunState) {
    this.state = initialState;
  }

  public get currentState() {
    return this.state;
  }

  public cancelRun(): TaskRunState {
    this.state = {
      run: { status: "CANCELED" },
      timestamp: new Date(),
      attempt: this.state.attempt ? { status: "CANCELED" } : undefined,
    };
    return this.state;
  }

  public expireRun(): TaskRunState {
    if (this.state.run.status !== "PENDING") {
      throw new Error("Can only expire a PENDING run");
    }
    if (this.state.attempt) {
      throw new Error("Can only expire a run which has an attempt");
    }

    this.state = {
      run: { status: "EXPIRED" },
      timestamp: new Date(),
    };
    return this.state;
  }
}
