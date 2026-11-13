
const WeekRegex = /^\[week-0?(\d+)\]/i;

export function extractWeekNumberFromTitle(title: string): number | null {
  const match = title.match(WeekRegex);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function matchPrToWeek(title: string, targetWeek: number): boolean {
  return extractWeekNumberFromTitle(title) === targetWeek;
}