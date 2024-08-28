import { TaskRunStatus } from "@trigger.dev/database";
import { runMachine, RunTransitionIds } from "./runStateMachine.server";

export class RunEngine {
  machine = runMachine;

  constructor(initialState: TaskRunStatus) {
    this.machine.setInitialState(initialState);
  }

  async cancelRun(): Promise<boolean> {
    const result = this.machine.transition("CANCELED");
    // return result.success;
    return true;
  }
}

export interface RunTransition {
  transition: RunTransitionIds;
}
