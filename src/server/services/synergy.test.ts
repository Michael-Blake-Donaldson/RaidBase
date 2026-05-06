import { describe, expect, it } from "vitest";

import { computeSynergyScore } from "@/server/services/synergy";

describe("computeSynergyScore", () => {
  it("returns a high score for highly compatible inputs", () => {
    const score = computeSynergyScore({
      scheduleMatch: 90,
      rankCompatibility: 95,
      roleComplement: 88,
      regionLatencyFit: 92,
      communicationMatch: 95,
      mutualReputationFit: 90,
    });

    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("caps score within bounds", () => {
    const score = computeSynergyScore({
      scheduleMatch: 250,
      rankCompatibility: 250,
      roleComplement: 250,
      regionLatencyFit: 250,
      communicationMatch: 250,
      mutualReputationFit: 250,
    });

    expect(score).toBe(100);
  });
});