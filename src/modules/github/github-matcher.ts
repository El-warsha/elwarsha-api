const WEEK_TITLE_PATTERN = /^\[week-0?(\d+)\]/i;

/**
 * Extracts the week number from a pull request title that follows the
 * ElWarsha convention, for example `[week-06] implement the tracker`.
 *
 * Titles are trimmed first so accidental leading whitespace does not hide a
 * valid submission from the tracker.
 */
export function extractWeekNumberFromTitle(title: string): number | null {
  const match = WEEK_TITLE_PATTERN.exec(title.trim());
  if (!match) {
    return null;
  }

  const weekNumber = Number.parseInt(match[1], 10);
  return Number.isInteger(weekNumber) ? weekNumber : null;
}

export function matchPrToWeek(title: string, targetWeek: number): boolean {
  return extractWeekNumberFromTitle(title) === targetWeek;
}
