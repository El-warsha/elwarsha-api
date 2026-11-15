export function extractWeekNumberFromTitle(title: string): number | null {
  if (!title) return null;
  // يدعم صيغ مثل [week-06], [week-6], أو بأحرف غير كبيرة وصغيرة
  const match = title.match(/\[\s*week\s*-\s*0?(\d+)\s*\]/i);
  return match ? parseInt(match[1], 10) : null;
}

export function matchPrToWeek(title: string, targetWeek: number): boolean {
  const weekNumber = extractWeekNumberFromTitle(title);
  return weekNumber === targetWeek;
}
