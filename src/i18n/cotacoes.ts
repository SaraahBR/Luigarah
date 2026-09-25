import { COTACOES_RESERVA, type Cotacoes } from "./moeda";

/** Taxas oficiais do Banco Central Europeu (atualizadas uma vez por dia útil, sem chave de API). */
const URL_COTACOES = "https://api.frankfurter.dev/v1/latest?base=BRL&symbols=USD,EUR";

/** A cotação muda uma vez por dia: basta buscar de novo a cada 6 horas. */
const REVALIDAR_EM_SEGUNDOS = 6 * 60 * 60;

/**
 * Cotação do real em dólar e euro, buscada no servidor (layout raiz).
 * O Next guarda a resposta no cache de dados, então as páginas não esperam a API
 * a cada visita; se ela falhar, usa as cotações de reserva.
 */
export async function obterCotacoes(): Promise<Cotacoes> {
  try {
    const resposta = await fetch(URL_COTACOES, {
      next: { revalidate: REVALIDAR_EM_SEGUNDOS },
      signal: AbortSignal.timeout(3000),
    });
    if (!resposta.ok) return COTACOES_RESERVA;

    const dados = (await resposta.json()) as { date?: string; rates?: { USD?: number; EUR?: number } };
    const { USD, EUR } = dados.rates ?? {};
    if (typeof USD !== "number" || typeof EUR !== "number" || USD <= 0 || EUR <= 0) {
      return COTACOES_RESERVA;
    }
    return { USD, EUR, data: dados.date ?? null };
  } catch {
    return COTACOES_RESERVA;
  }
}
