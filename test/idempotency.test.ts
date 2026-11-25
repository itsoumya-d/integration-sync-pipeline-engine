import { describe, it, expect } from "vitest";
import { IdempotencyTracker } from "../src/idempotency.js";

describe("IdempotencyTracker", () => {
  it("detects new records as changed", () => {
    const tracker = new IdempotencyTracker();
    const isNew = tracker.hasChanged("emp-01", { name: "Alice", role: "Dev" });
    expect(isNew).toBe(true);
  });

  it("filters out unchanged duplicate payloads", () => {
    const tracker = new IdempotencyTracker();
    tracker.hasChanged("emp-01", { name: "Alice", role: "Dev" });

    // Same data payload with different key order should produce same fingerprint
    const isDuplicate = tracker.hasChanged("emp-01", { role: "Dev", name: "Alice" });
    expect(isDuplicate).toBe(false);
  });

  it("detects payload modification", () => {
    const tracker = new IdempotencyTracker();
    tracker.hasChanged("emp-01", { name: "Alice", role: "Dev" });

    const isUpdated = tracker.hasChanged("emp-01", { name: "Alice", role: "Senior Dev" });
    expect(isUpdated).toBe(true);
  });

  it("filters batch of records", () => {
    const tracker = new IdempotencyTracker();
    const batch = [
      { id: "1", data: { val: "a" } },
      { id: "2", data: { val: "b" } },
    ];

    const firstRun = tracker.filterChangedRecords(batch);
    expect(firstRun.length).toBe(2);

    const secondRun = tracker.filterChangedRecords(batch);
    expect(secondRun.length).toBe(0);
  });
});
