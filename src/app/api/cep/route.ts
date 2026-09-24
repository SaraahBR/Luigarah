import { NextResponse } from "next/server";
import { fetchComTimeout, PAIS_BRASIL, UF_PARA_NOME } from "@/lib/localidades/brasil";

type Endereco = { city: string; uf: string; district: string; street: string };

async function viaCep(cep: string): Promise<Endereco | null> {
  const r = await fetchComTimeout(`https://viacep.com.br/ws/${cep}/json/`, { cache: "no-store" }, 5000);
  const d = await r.json();
  if (!r.ok || d?.erro) return null;
  return { city: d.localidade || "", uf: d.uf || "", district: d.bairro || "", street: d.logradouro || "" };
}

async function brasilApi(cep: string): Promise<Endereco | null> {
  const r = await fetchComTimeout(`https://brasilapi.com.br/api/cep/v1/${cep}`, { cache: "no-store" }, 5000);
  if (!r.ok) return null;
  const d = await r.json();
  return { city: d.city || "", uf: d.state || "", district: d.neighborhood || "", street: d.street || "" };
}

/** Busca de CEP: ViaCEP e, se falhar ou não responder, BrasilAPI. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const value = (searchParams.get("value") || "").replace(/\D/g, "");

  if (!value || value.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  let endereco: Endereco | null = null;
  for (const buscar of [viaCep, brasilApi]) {
    try {
      endereco = await buscar(value);
      if (endereco) break;
    } catch {
      // tenta o próximo serviço
    }
  }

  if (!endereco) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    zip: value,
    city: endereco.city,
    state: UF_PARA_NOME[endereco.uf] || endereco.uf,
    district: endereco.district,
    street: endereco.street,
    country: PAIS_BRASIL,
  });
}
