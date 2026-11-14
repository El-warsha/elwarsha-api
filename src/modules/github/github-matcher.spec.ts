import { describe, expect, it } from "vitest";

import { extractWeekNumberFromTitle, matchPrToWeek } from "./github-matcher.js";

describe("github-matcher", () => {
  describe("extractWeekNumberFromTitle", () => {
    it("extracts a zero-padded week number", () => {
      expect(extractWeekNumberFromTitle("[week-06] implement the tracker")).toBe(6);
    });

    it("extracts an unpadded week number", () => {
      expect(extractWeekNumberFromTitle("[week-6] implement the tracker")).toBe(6);
    });

    it("is case-insensitive", () => {
      expect(extractWeekNumberFromTitle("[WEEK-06] implement the tracker")).toBe(6);
      expect(extractWeekNumberFromTitle("[Week-6] implement the tracker")).toBe(6);
    });

    it("tolerates leading whitespace", () => {
      expect(extractWeekNumberFromTitle("   [week-06] implement the tracker")).toBe(6);
      expect(extractWeekNumberFromTitle("\n\t[week-6] implement the tracker")).toBe(6);
    });

    it("extracts multi-digit week numbers", () => {
      expect(extractWeekNumberFromTitle("[week-12] final delivery")).toBe(12);
      expect(extractWeekNumberFromTitle("[week-012] final delivery")).toBe(12);
    });

    it("does not require text after the tag", () => {
      expect(extractWeekNumberFromTitle("[week-06]")).toBe(6);
    });

    it("returns null for titles without a leading week tag", () => {
      expect(extractWeekNumberFromTitle("feat: implement [week-06] tracker")).toBeNull();
      expect(extractWeekNumberFromTitle("week-06 implement the tracker")).toBeNull();
      expect(extractWeekNumberFromTitle("[week] implement the tracker")).toBeNull();
      expect(extractWeekNumberFromTitle("")).toBeNull();
    });
  });

  describe("matchPrToWeek", () => {
    it("matches the same week regardless of padding or casing", () => {
      expect(matchPrToWeek("[week-06] implement the tracker", 6)).toBe(true);
      expect(matchPrToWeek("[week-6] implement the tracker", 6)).toBe(true);
      expect(matchPrToWeek("[WEEK-06] implement the tracker", 6)).toBe(true);
    });

    it("does not match a different week", () => {
      expect(matchPrToWeek("[week-06] implement the tracker", 5)).toBe(false);
      expect(matchPrToWeek("[week-01] open the first PR", 6)).toBe(false);
    });

    it("does not match an untagged title", () => {
      expect(matchPrToWeek("implement [week-06] tracker", 6)).toBe(false);
    });
  });
});
