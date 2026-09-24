import { NextResponse } from "next/server";
import { PAISES } from "@/lib/localidades/paises";

/**
 * Lista de países (fixa no projeto: a restcountries v3.1 foi desativada).
 * name  = nome em inglês, usado nas APIs de estados/cidades e salvo no perfil
 * label = nome em português, exibido na tela
 */
export async function GET() {
  const pt = new Intl.DisplayNames(["pt-BR"], { type: "region" });

  const countries = PAISES.map((c) => {
    let label = c.name;
    try {
      label = pt.of(c.iso2) || c.name;
    } catch {
      // mantém o nome em inglês
    }
    return { name: c.name, iso2: c.iso2, label };
  }).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  return NextResponse.json(countries, {
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
