
import {
  extractWeekNumberFromTitle,
  matchPrToWeek,
} from './github-matcher.js';

describe('extractWeekNumberFromTitle', () => {
  it('should extract the week number from a valid PR title', () => {
    const title = '[week-05] Implement feature X';

    const weekNumber = extractWeekNumberFromTitle(title);

    expect(weekNumber).toBe(5);
  });

  it('should extract the correct week number from a title without zero-padding', () => {
    const title = '[week-5] Implement feature X';

    const weekNumber = extractWeekNumberFromTitle(title);

    expect(weekNumber).toBe(5);
  });

  it('should return null when the title starts with whitespace', () => {
    const title = ' [week-05] Implement feature X';

    const weekNumber = extractWeekNumberFromTitle(title);

    expect(weekNumber).toBeNull();
  });

  it('should return null when the title does not start with a week marker', () => {
    const title = 'Implement [week-5] feature X';

    const weekNumber = extractWeekNumberFromTitle(title);

    expect(weekNumber).toBeNull();
  });
});

describe('matchPrToWeek', () => {
    it('should return true when the PR title matches the target week', () => {
        const title = '[week-05] Implement feature X';
        const targetWeek = 5;
        const result = matchPrToWeek(title, targetWeek);
        expect(result).toBe(true);
    });
    it('should return false when the PR title does not match the target week', () => {
        const title = '[week-05] Implement feature X';
        const targetWeek = 6;
        const result = matchPrToWeek(title, targetWeek);
        expect(result).toBe(false);
    });
    it('should return false when the PR title is invalid', () => {
        const title = 'Implement [week-5] feature X';
        const targetWeek = 5;
        const result = matchPrToWeek(title, targetWeek);
        expect(result).toBe(false);
    });
});
