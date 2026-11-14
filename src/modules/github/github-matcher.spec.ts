import { describe, it, expect } from "vitest";
import { extractWeekNumberFromTitle, matchPrToWeek } from "./github-matcher";

describe("extractWeekNumberFromTitle", () => {
  it("reads week 6 from [week-06]", () => {
    expect(extractWeekNumberFromTitle("[week-06] add form")).toBe(6);
  });

  it("reads week 6 from [week-6]", () => {
    expect(extractWeekNumberFromTitle("[week-6] add form")).toBe(6);
  });

  it("ignores letter case", () => {
    expect(extractWeekNumberFromTitle("[WEEK-06] add form")).toBe(6);
  });

  it("accepts title with or without text/spaces after the bracket", () => {
    expect(extractWeekNumberFromTitle("[week-06]")).toBe(6);
    expect(extractWeekNumberFromTitle("[week-06]    add form")).toBe(6);
  });

  it("returns null when the title has leading spaces", () => {
    expect(extractWeekNumberFromTitle("  [week-06] add form")).toBeNull();
  });

  it("returns null when there are spaces inside the tag", () => {
    expect(extractWeekNumberFromTitle("[week 06] add form")).toBeNull();
    expect(extractWeekNumberFromTitle("[ week-06 ] add form")).toBeNull();
  });

  it("returns null when the title does not start with the pattern", () => {
    expect(extractWeekNumberFromTitle("Fix bug [week-06]")).toBeNull();
  });
});

describe("matchPrToWeek", () => {
  it("is true for the same week", () => {
    expect(matchPrToWeek("[week-06] x", 6)).toBe(true);
  });

  it("does not confuse week 1 with week 10", () => {
    expect(matchPrToWeek("[week-10] x", 1)).toBe(false);
  });

  it("returns false when the title has leading spaces", () => {
    expect(matchPrToWeek(" [week-06] x", 6)).toBe(false);
  });
});
