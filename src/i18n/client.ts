import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_TAGS, type Locale } from "./config";

/**
 * Idioma atual no navegador, lido do cookie NEXT_LOCALE.
 * Usado fora dos componentes React (clientes da API), onde não há hooks.
 */
export function getClientLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : document.documentElement.lang?.split("-")[0];
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Cabeçalho enviado ao backend para receber os produtos traduzidos.
 * No painel admin os produtos vêm sempre no original (português): é o texto
 * que o admin edita e salva, e a tradução é refeita a partir dele.
 */
export function acceptLanguageHeader(): string {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return LOCALE_TAGS[DEFAULT_LOCALE];
  }
  return LOCALE_TAGS[getClientLocale()];
}

/** Grava o idioma escolhido e recarrega para buscar tudo no novo idioma. */
export function setClientLocale(locale: Locale) {
  const umAno = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${umAno}; samesite=lax`;
  window.location.reload();
}
