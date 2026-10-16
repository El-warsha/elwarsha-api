
type Locale = "en" | "ar";

type LanguagePreference = {
  lang: string;
  q: number;
};

export const localeResolver = (
  acceptLang: string | undefined,
): Locale => {
  if (!acceptLang) {
    return "en";
  }

  const langArr = acceptLang.split(",");

  const langObjs: LanguagePreference[] = langArr.map((ele) => {
    const [lang, quality] = ele.trim().split(";");

    const q = quality
      ? Number(quality.trim().replace(/^q=/, ""))
      : 1;

    return { lang: lang.trim(), q };
  });

  const supportedLanguages = langObjs
    .map((item) => ({
      ...item,
      locale: item.lang.split("-")[0].toLowerCase(),
    }))
    .filter(
      (item) =>
        (item.locale === "en" || item.locale === "ar") &&
        Number.isFinite(item.q) &&
        item.q > 0 &&
        item.q <= 1,
    )
    .sort((a, b) => b.q - a.q);

  const bestLanguage = supportedLanguages[0];

  if (!bestLanguage) {
    return "en";
  }

  return bestLanguage.locale as Locale;
};

const acceptLang = "en-US,en;q=0.9,ar;q=0.8";

console.log(localeResolver(acceptLang));
