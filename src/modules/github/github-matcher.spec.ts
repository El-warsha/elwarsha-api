
import { describe, expect, it } from "vitest";
import { extractWeekNumberFromTitle, matchPrToWeek } from "./github-matcher.js";

describe("github-matcher", () => {
  describe("extractWeekNumberFromTitle", () => {
    it("extracts week number with leading zero", () => {
      expect(extractWeekNumberFromTitle("[week-06] ...")).toBe(6);
    });

    it("extracts week number without leading zero", () => {
      expect(extractWeekNumberFromTitle("[week-6] ...")).toBe(6);
    });

    it("is case-insensitive", () => {
      expect(extractWeekNumberFromTitle("[WEEK-6] ...")).toBe(6);
    });

    it("returns null for non-matching titles", () => {
      expect(extractWeekNumberFromTitle("[not-week-6] ...")).toBeNull();
      expect(extractWeekNumberFromTitle("Add API")).toBeNull();
    });
  });

  describe("matchPrToWeek", () => {
    it("returns true when week matches target", () => {
      expect(matchPrToWeek("[week-6] Add API", 6)).toBe(true);
    });

    it("returns false when week differs from target", () => {
      expect(matchPrToWeek("[week-6] Add API", 7)).toBe(false);
    });

    it("returns false for non-matching titles", () => {
      expect(matchPrToWeek("Add API", 6)).toBe(false);
    });
  });
});
