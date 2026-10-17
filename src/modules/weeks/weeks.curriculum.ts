import type { CurriculumWeek } from "./curriculum/curriculum.types.js";
import { curriculumAr } from "./curriculum/curriculum.ar.js";
import { curriculumEn } from "./curriculum/curriculum.en.js";

export type { CurriculumWeek };

const curriculumData: Record<"ar" | "en", Record<number, CurriculumWeek>> = {
  ar: curriculumAr,
  en: curriculumEn,
};

export function getCurriculumWeek(weekNumber: number, locale: "ar" | "en" = "en"): CurriculumWeek | null {
  return curriculumData[locale]?.[weekNumber] ?? curriculumData.en[weekNumber] ?? null;
}

export function getAllCurriculumWeeks(locale: "ar" | "en" = "en"): CurriculumWeek[] {
  const dataset = curriculumData[locale] ?? curriculumData.en;
  return Object.values(dataset);
}
