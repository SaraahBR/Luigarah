import { NextResponse } from "next/server";
import { fetchComTimeout, isBrasil, nomeParaUf } from "@/lib/localidades/brasil";

type IbgeMunicipio = { nome: string };

/**
 * Cidades de um estado.
 * - Brasil: municípios do IBGE pela UF
 * - Demais: countriesnow (endpoint GET)
 * Em caso de falha devolve [], e a tela libera o campo para digitação livre.
 */
export async function POST(req: Request) {
  const { country, state } = await req.json().catch(() => ({}));
  if (!country || !state) {
    return NextResponse.json({ error: "country e state são obrigatórios" }, { status: 400 });
  }

  try {
    if (isBrasil(country)) {
      const uf = nomeParaUf(state);
      if (!uf) return NextResponse.json([]);

      const r = await fetchComTimeout(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
        { next: { revalidate: 86400 } }
      );
      const municipios = (await r.json()) as IbgeMunicipio[];
      return NextResponse.json(municipios.map((m) => m.nome));
    }

    const url =
      "https://countriesnow.space/api/v0.1/countries/state/cities/q" +
      `?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`;
    const r = await fetchComTimeout(url, { next: { revalidate: 86400 } });
    const data = await r.json().catch(() => ({}));
    const cities: string[] = Array.isArray(data?.data)
      ? [...data.data].sort((a: string, b: string) => a.localeCompare(b, "pt-BR"))
      : [];

    return NextResponse.json(cities);
  } catch {
    return NextResponse.json([]);
  }
}
