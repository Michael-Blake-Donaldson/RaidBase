import { describe, expect, it } from "vitest";

import { buildTrustSummary, canDisplayPublicBadges } from "@/server/services/reputation";

describe("reputation service", () => {
  it("requires minimum review evidence before public badges are shown", () => {
    expect(canDisplayPublicBadges(4, 2)).toBe(false);
    expect(canDisplayPublicBadges(5, 2)).toBe(true);
    expect(canDisplayPublicBadges(3, 3)).toBe(true);
  });

  it("builds a high-confidence trust summary when signals are strong", () => {
    const summary = buildTrustSummary({
      reliabilityScore: 4.8,
      commsScore: 4.6,
      skillScore: 4.4,
      teamBehaviorScore: 4.7,
      toxicityRisk: 8,
      reviewCount: 8,
      uniqueReviewers: 5,
      publicBadges: ["Reliable", "Great Comms"],
    });

    expect(summary.isPubliclyVisible).toBe(true);
    expect(summary.trustScore).toBeGreaterThanOrEqual(85);
    expect(summary.tier).toMatch(/High confidence|Elite teammate/);
    expect(summary.publicBadges).toEqual(["Reliable", "Great Comms"]);
    expect(summary.highlights.length).toBeGreaterThan(0);
  });

  it("suppresses badges and marks the profile under review when toxicity risk is high", () => {
    const summary = buildTrustSummary({
      reliabilityScore: 3.8,
      commsScore: 2.7,
      skillScore: 4.1,
      teamBehaviorScore: 2.6,
      toxicityRisk: 62,
      reviewCount: 2,
      uniqueReviewers: 2,
      publicBadges: ["Reliable"],
    });

    expect(summary.isPubliclyVisible).toBe(false);
    expect(summary.tier).toBe("Under review");
    expect(summary.publicBadges).toEqual([]);
    expect(summary.concerns).toContain("teamBehavior");
    expect(summary.concerns).toContain("toxicityRisk");
  });
});