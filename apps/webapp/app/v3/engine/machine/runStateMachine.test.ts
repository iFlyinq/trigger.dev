import { fail } from "assert";
import { runMachine } from "./runStateMachine.server";

describe("Run state machine", () => {
  it("should use the initial state passed in", () => {
    runMachine.setInitialState("PENDING");
    expect(runMachine.currentState).toBe("PENDING");
  });

  it("should transition from PENDING to CANCELED", () => {
    runMachine.setInitialState("PENDING");
    const result = runMachine.transition("PENDING", "CANCELED");
    expect(result.success).toBe(true);
    if (!result.success) {
      fail("Expected transition to be successful");
    }
    expect(result.state).toBe("CANCELED");
    expect(runMachine.currentState).toBe("CANCELED");
  });

  it("Should not transition from CANCELED to PENDING", () => {
    runMachine.setInitialState("CANCELED");
    const result = runMachine.transition("CANCELED", "PENDING");
    expect(result.success).toBe(false);
    expect(runMachine.currentState).toBe("CANCELED");
  });
});
