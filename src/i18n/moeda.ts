import type { Locale } from "./config";

/**
 * Moeda de cada idioma do site. Os preços são cadastrados em reais (BRL) e
 * convertidos só na hora de exibir, pela cotação do dia.
 */
export type Moeda = "BRL" | "USD" | "EUR";

export const MOEDA_POR_IDIOMA: Record<Locale, Moeda> = {
  pt: "BRL",
  en: "USD",
  es: "EUR",
  fr: "EUR",
};

/** Quanto vale 1 real em cada moeda, e a data da cotação. */
export type Cotacoes = {
  USD: number;
  EUR: number;
  data: string | null;
};

/**
 * Usadas só se a API de câmbio estiver fora do ar (valores aproximados de set/2026),
 * para o site nunca ficar sem preço.
 */
export const COTACOES_RESERVA: Cotacoes = { USD: 0.19, EUR: 0.17, data: null };

/** Converte um valor em reais para a moeda pedida. */
export function converterDeReais(valor: number, moeda: Moeda, cotacoes: Cotacoes): number {
  return moeda === "BRL" ? valor : valor * cotacoes[moeda];
}
