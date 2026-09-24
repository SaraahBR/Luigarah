/**
 * Dados de localidade do Brasil.
 * Estados e municípios vêm do IBGE (nomes em português, os mesmos do ViaCEP),
 * o que permite o CEP preencher estado e cidade já selecionáveis nas listas.
 */

export const PAIS_BRASIL = "Brazil";

export const UF_PARA_NOME: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/** Aceita o nome do estado (com ou sem acento) ou a sigla e devolve a UF. */
export function nomeParaUf(estado: string): string | null {
  const alvo = normalizar(estado);
  for (const [uf, nome] of Object.entries(UF_PARA_NOME)) {
    if (normalizar(nome) === alvo || uf.toLowerCase() === alvo) return uf;
  }
  return null;
}

export const isBrasil = (pais?: string | null) =>
  !!pais && ["brazil", "brasil", "br"].includes(pais.trim().toLowerCase());

/** fetch com tempo máximo: APIs externas lentas não travam a tela. */
export async function fetchComTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}
