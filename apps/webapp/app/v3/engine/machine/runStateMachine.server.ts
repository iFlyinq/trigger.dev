import { TaskRunStatus } from "@trigger.dev/database";
import { StateMachine, StateTransition } from "./stateMachine.server";

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
