// GET /api/cep?value=01001000
import { NextResponse } from "next/server";

const UF_TO_NAME: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const value = (searchParams.get("value") || "").replace(/\D/g, "");

  if (!value || value.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  const r = await fetch(`https://viacep.com.br/ws/${value}/json/`, { cache: "no-store" });
  const data = await r.json();

  if (data?.erro) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    zip: value,
    city: data.localidade || "",
    state: UF_TO_NAME[data.uf] || data.uf || "",
    district: data.bairro || "",
    street: data.logradouro || "",
    country: "Brazil",
  });
}
