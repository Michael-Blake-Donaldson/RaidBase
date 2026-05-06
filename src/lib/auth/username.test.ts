import { describe, expect, it } from "vitest";

import { normalizeUsername, validateUsername } from "@/lib/auth/username";

describe("username validation", () => {
  it("normalizes to lowercase and nfkc", () => {
    expect(normalizeUsername("  GhostTrace  ")).toBe("ghosttrace");
  });

  it("rejects reserved usernames", () => {
    const result = validateUsername("admin");
    expect(result.ok).toBe(false);
  });

  it("rejects blocked words", () => {
    const result = validateUsername("badshitname");
    expect(result.ok).toBe(false);
  });

  it("accepts safe usernames", () => {
    const result = validateUsername("vector_hush");
    expect(result.ok).toBe(true);
  });
});