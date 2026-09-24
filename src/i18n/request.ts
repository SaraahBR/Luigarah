import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, localeFromAcceptLanguage } from "./config";

/**
 * Idioma de cada requisição (sem prefixo na URL):
 * 1. cookie NEXT_LOCALE, gravado pelo seletor de idioma
 * 2. idioma preferido do navegador (Accept-Language)
 * 3. português
 */
export default getRequestConfig(async () => {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie)
    ? cookie
    : localeFromAcceptLanguage((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
