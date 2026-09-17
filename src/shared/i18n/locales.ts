export const supportedLocales = ["en", "pt-BR"] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "pt-BR";

export function isSupportedLocale(locale: string | undefined): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function resolvePreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const requestedLocales = acceptLanguage
    .split(",")
    .map((value) => value.trim().split(";")[0])
    .filter(Boolean);

  for (const requestedLocale of requestedLocales) {
    if (isSupportedLocale(requestedLocale)) {
      return requestedLocale;
    }

    const language = requestedLocale.split("-")[0];
    const supportedLanguage = supportedLocales.find((locale) => locale.split("-")[0] === language);

    if (supportedLanguage) {
      return supportedLanguage;
    }
  }

  return defaultLocale;
}
