import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/dom";

// Global test setup and utilities
afterEach(() => {
  cleanup();
});
