import { describe, it, expect } from "vitest";
import { extractWeekNumberFromTitle, matchPrToWeek } from "./github-matcher.js";

describe("Github Matcher", () => {
  it("should extract week number from title", () => {
    expect(extractWeekNumberFromTitle("[week-01] PR title")).toBe(1);
    expect(extractWeekNumberFromTitle("[WEEK-1] Another PR title")).toBe(1);
    expect(extractWeekNumberFromTitle("PR title [week-01]")).toBeNull();
    expect(extractWeekNumberFromTitle("PR title")).toBeNull();
  });

  it("should match PR to target week", () => {
    expect(matchPrToWeek("[week-01] PR title", 1)).toBe(true);
    expect(matchPrToWeek("PR title [week-01]", 1)).toBe(false);
    expect(matchPrToWeek("[WEEK-1] PR title", 1)).toBe(true);
    expect(matchPrToWeek("[week-2] PR title", 1)).toBe(false);
  });
});
