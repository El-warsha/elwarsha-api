const pattern = /^\[week-0?(\d+)\]/i;

export function extractWeekNumberFromTitle(title: string): number | null {
  const match = pattern.exec(title);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export function matchPrToWeek(title: string, targetWeek: number): boolean {
  return extractWeekNumberFromTitle(title) === targetWeek;
}