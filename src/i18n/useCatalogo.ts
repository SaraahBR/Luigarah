"use client";

import { useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LOCALE_TAGS, type Locale } from "./config";

type ComTipo = { subtitulo?: string | null; subtituloTraduzido?: string | null };

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/**
 * Textos do catálogo no idioma atual.
 * - tipo: subtítulo traduzido pelo backend (Google Translation), ou o original
 * - categoria, dimensão e identidade: dicionário fixo (usados nos filtros, então
 *   o valor original continua sendo o que vai para a API)
 * - preco: sempre em reais, formatado no padrão do idioma
 */
export function useCatalogo() {
  const t = useTranslations("catalogo");
  const locale = useLocale() as Locale;
  const tag = LOCALE_TAGS[locale];

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

  const moeda = useMemo(
    () => new Intl.NumberFormat(tag, { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
    [tag]
  );
  const moedaCentavos = useMemo(
    () => new Intl.NumberFormat(tag, { style: "currency", currency: "BRL", minimumFractionDigits: 2 }),
    [tag]
  );

  const preco = useCallback((v?: number | null) => moeda.format(v ?? 0), [moeda]);
  const precoCentavos = useCallback((v?: number | null) => moedaCentavos.format(v ?? 0), [moedaCentavos]);

  return { locale, tag, tipo, categoria, dimensao, identidade, preco, precoCentavos };
}
