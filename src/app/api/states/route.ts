import { NextResponse } from "next/server";
import { fetchComTimeout, isBrasil } from "@/lib/localidades/brasil";

type IbgeEstado = { sigla: string; nome: string };
type CountriesNowStates = { data?: { states?: Array<{ name?: string }> } };

/**
 * Estados de um país.
 * - Brasil: IBGE (nomes em português, iguais aos do ViaCEP)
 * - Demais: countriesnow (endpoint GET; o POST antigo passou a redirecionar e demorar)
 * Em caso de falha devolve [], e a tela libera o campo para digitação livre.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as unknown));
  const country =
    typeof (body as Record<string, unknown>).country === "string"
      ? ((body as Record<string, unknown>).country as string)
      : "";

  if (!country) {
    return NextResponse.json({ error: "country é obrigatório" }, { status: 400 });
  }

  try {
    if (isBrasil(country)) {
      const r = await fetchComTimeout(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
        { next: { revalidate: 86400 } }
      );
      const estados = (await r.json()) as IbgeEstado[];
      return NextResponse.json(estados.map((e) => e.nome));
    }

    const r = await fetchComTimeout(
      `https://countriesnow.space/api/v0.1/countries/states/q?country=${encodeURIComponent(country)}`,
      { next: { revalidate: 86400 } }
    );
    const data = (await r.json().catch(() => ({}))) as CountriesNowStates;
    const states =
      data?.data?.states
        ?.map((s) => (typeof s?.name === "string" ? s.name : ""))
        .filter((n): n is string => Boolean(n))
        .sort((a, b) => a.localeCompare(b, "pt-BR")) || [];

    return NextResponse.json(states);
  } catch {
    return NextResponse.json([]);
  }
}
