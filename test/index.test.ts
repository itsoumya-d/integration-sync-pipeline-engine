import { describe, it, expect } from "vitest";
import { ENGINE_VERSION } from "../src/index.js";

describe("Base Engine Setup", () => {
  it("exports valid version", () => {
    expect(ENGINE_VERSION).toBe("1.0.0");
  });
});
