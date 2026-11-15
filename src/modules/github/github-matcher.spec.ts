import { extractWeekNumberFromTitle, matchPrToWeek } from "./github-matcher.js";

describe("GitHub Matcher", () => {
  it("extracts week number correctly from various formats", () => {
    expect(extractWeekNumberFromTitle("[week-06] implement feature")).toBe(6);
    expect(extractWeekNumberFromTitle("[week-6] fix bug")).toBe(6);
    expect(extractWeekNumberFromTitle("[WEEK-01] start")).toBe(1);
    expect(extractWeekNumberFromTitle("no brackets here")).toBeNull();
  });

  it("matches PR to target week accurately", () => {
    expect(matchPrToWeek("[week-06] submission", 6)).toBe(true);
    expect(matchPrToWeek("[week-5] submission", 6)).toBe(false);
  });
});
