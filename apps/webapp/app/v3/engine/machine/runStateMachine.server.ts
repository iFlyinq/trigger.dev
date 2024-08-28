import { TaskRunAttemptStatus, TaskRunStatus } from "@trigger.dev/database";
import { PossibleTransitionIds, StateMachine, StateTransition } from "./stateMachine.server";

export const cancelRun: StateTransition<TaskRunStatus> = {
  id: "cancel" as const,
  from: ["PENDING"],
  to: "CANCELED",
};

type T = (typeof cancelRun)["id"];

export const expireRun: StateTransition<TaskRunStatus> = {
  id: "expire",
  from: ["PENDING"],
  to: "EXPIRED",
};

export const executeRun: StateTransition<TaskRunStatus> = {
  id: "execute",
  from: ["PENDING"],
  to: "EXECUTING",
};

export const runMachine = new StateMachine(
  [
    "DELAYED",
    "WAITING_FOR_DEPLOY",
    "PENDING",
    "EXECUTING",
    "RETRYING_AFTER_FAILURE",
    "WAITING_TO_RESUME",
    "COMPLETED_SUCCESSFULLY",
    "CANCELED",
    "COMPLETED_WITH_ERRORS",
    "CRASHED",
    "PAUSED",
    "INTERRUPTED",
    "SYSTEM_FAILURE",
    "EXPIRED",
  ],
  [cancelRun, expireRun, executeRun]
);

export type RunTransitionIds = PossibleTransitionIds<typeof runMachine>;

//todo could be Zod schemas instead so we can have types?
//would be used to only allow writing to the database if the state is correct
export type State = {
  run: TaskRunStatus;
  attempt: (TaskRunAttemptStatus | null)[];
};

const pending: State = {
  run: "PENDING",
  attempt: [null],
};

const executing: State = {
  run: "EXECUTING",
  attempt: [null, "EXECUTING"],
};
