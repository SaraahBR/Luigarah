/**
 * Idiomas do site.
 * O idioma escolhido fica no cookie NEXT_LOCALE (as URLs não mudam); na primeira
 * visita é detectado pelo idioma do navegador.
 */
export const LOCALES = ["pt", "en", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Nome de cada idioma escrito no próprio idioma (usado no seletor). */
export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
};

/** Tag completa para Intl (datas, números, moeda) e para o atributo lang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Escolhe o idioma a partir do cabeçalho Accept-Language do navegador. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const preferidos = header
    .split(",")
    .map((parte) => {
      const [tag, q] = parte.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return preferidos.map((p) => p.base).find(isLocale) ?? DEFAULT_LOCALE;
}
