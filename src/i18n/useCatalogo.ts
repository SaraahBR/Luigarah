"use client";

import { useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LOCALE_TAGS, type Locale } from "./config";
import { useCotacoes } from "./CotacoesProvider";
import { MOEDA_POR_IDIOMA, converterDeReais } from "./moeda";

type ComTipo = { subtitulo?: string | null; subtituloTraduzido?: string | null };

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/**
 * Textos do catálogo no idioma atual.
 * - tipo: subtítulo traduzido pelo backend (Google Translation), ou o original
 * - categoria, dimensão e identidade: dicionário fixo (usados nos filtros, então
 *   o valor original continua sendo o que vai para a API)
 * - preco: convertido de reais para a moeda do idioma (BRL, USD ou EUR) pela cotação
 *   do dia e formatado no padrão do idioma; precoBRL mantém em reais (painel admin)
 */
export function useCatalogo() {
  const t = useTranslations("catalogo");
  const locale = useLocale() as Locale;
  const tag = LOCALE_TAGS[locale];
  const cotacoes = useCotacoes();
  const moeda = MOEDA_POR_IDIOMA[locale];

  const tipo = useCallback((p?: ComTipo | null) => p?.subtituloTraduzido || p?.subtitulo || "", []);

  const categoria = useCallback(
    (valor?: string | null) => {
      if (!valor) return "";
      const chave = `categorias.${semAcento(valor)}`;
      return t.has(chave) ? t(chave) : valor;
    },
    [t]
  );

  const dimensao = useCallback(
    (valor?: string | null) => {
      if (!valor) return "";
      const chave = `dimensoes.${semAcento(valor)}`;
      return t.has(chave) ? t(chave) : valor;
    },
    [t]
  );

  const identidade = useCallback(
    (valor?: string | null) => {
      if (!valor) return "";
      const chave = `identidades.${semAcento(valor)}`;
      return t.has(chave) ? t(chave) : valor;
    },
    [t]
  );

  const formato = useMemo(
    () => new Intl.NumberFormat(tag, { style: "currency", currency: moeda, maximumFractionDigits: 0 }),
    [tag, moeda]
  );
  const formatoCentavos = useMemo(
    () => new Intl.NumberFormat(tag, { style: "currency", currency: moeda, minimumFractionDigits: 2 }),
    [tag, moeda]
  );
  const formatoReais = useMemo(
    () => new Intl.NumberFormat(tag, { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
    [tag]
  );

  /** Valor em reais -> moeda do idioma */
  const converter = useCallback(
    (v?: number | null) => converterDeReais(v ?? 0, moeda, cotacoes),
    [moeda, cotacoes]
  );

  const preco = useCallback((v?: number | null) => formato.format(converter(v)), [formato, converter]);
  const precoCentavos = useCallback((v?: number | null) => formatoCentavos.format(converter(v)), [formatoCentavos, converter]);
  const precoBRL = useCallback((v?: number | null) => formatoReais.format(v ?? 0), [formatoReais]);

  return {
    locale, tag, tipo, categoria, dimensao, identidade,
    moeda, cotacoes, preco, precoCentavos, precoBRL,
  };
}
