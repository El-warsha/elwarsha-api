

export function extractWeekNumberFromTitle(title: string): number | null{

    const reg = /^\[week-0?(\d+)\]/i;
    const match = title.match(reg);
    return match ? parseInt(match[1], 10): null;
}

export function matchPrToWeek(title: string, targetWeek: number): boolean{
    const weekNumber = extractWeekNumberFromTitle(title);
    return weekNumber === targetWeek;
}
