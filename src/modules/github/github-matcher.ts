export function extractWeekNumberFromTitle(title: string): number | null {
  const week = title.trim().match(/^\[week-0?(\d+)\]/i);
  return week ? parseInt(week[1], 10) : null;
}

export function matchPrToWeek(title: string, targetWeek: number): boolean {
  const weekNumber = extractWeekNumberFromTitle(title);
  return weekNumber === targetWeek;
}
