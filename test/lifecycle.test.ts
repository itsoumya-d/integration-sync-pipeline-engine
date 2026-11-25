import { describe, it, expect } from "vitest";
import { GracefulShutdownManager } from "../src/lifecycle.js";

describe("GracefulShutdownManager", () => {
  it("registers and completes in-flight tasks", () => {
    const manager = new GracefulShutdownManager(1000);
    expect(manager.registerTask()).toBe(true);
    expect(manager.getInFlightTaskCount()).toBe(1);

    manager.completeTask();
    expect(manager.getInFlightTaskCount()).toBe(0);
  });

  it("rejects new tasks during shutdown", async () => {
    const manager = new GracefulShutdownManager(500);
    manager.registerTask();

    const shutdownPromise = manager.initiateShutdown();
    expect(manager.registerTask()).toBe(false); // rejected because terminating

    manager.completeTask();
    const success = await shutdownPromise;
    expect(success).toBe(true);
  });
});
