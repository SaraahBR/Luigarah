"use client";

import { createContext, useContext, type ReactNode } from "react";
import { COTACOES_RESERVA, type Cotacoes } from "./moeda";

const CotacoesContext = createContext<Cotacoes>(COTACOES_RESERVA);

/**
 * Entrega aos componentes a cotação buscada no servidor (layout raiz): o preço já
 * aparece na moeda certa desde o primeiro render, sem requisição extra no navegador.
 */
export function CotacoesProvider({ cotacoes, children }: { cotacoes: Cotacoes; children: ReactNode }) {
  return <CotacoesContext.Provider value={cotacoes}>{children}</CotacoesContext.Provider>;
}

export function useCotacoes(): Cotacoes {
  return useContext(CotacoesContext);
}
