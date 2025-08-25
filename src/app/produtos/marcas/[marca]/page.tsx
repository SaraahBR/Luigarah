import { getBaseUrl } from "@/lib/http";
import { slugify } from "@/lib/slug";

import bolsasData from "@/data/bolsas.json";
import roupasData from "@/data/roupas.json";
import sapatosData from "@/data/sapatos.json";

type Dim = "Grande" | "Médio" | "Média" | "Pequeno" | "Pequena" | "Mini";

type Produto = {
  id: number;
  title?: string; // marca
  subtitle?: string; // categoria
  author?: string;
  description?: string;
  preco?: number;
  img?: string;
  imgHover?: string;
  tamanho?: string;
  dimension?: Dim;
  images?: string[];
  composition?: string;
  highlights?: string[];
  __tipo?: "bolsas" | "roupas" | "sapatos";
};

async function loadFromApi(base: string, path: string) {
  const res = await fetch(`${base}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("fail");
  return (await res.json()) as Produto[];
}

export default async function MarcasPage({
  params,
}: {
  params: Promise<{ marca: string }>;
}) {
  const { marca } = await params;

  const base = await getBaseUrl();

  // tenta API aí se falhar usa fallback local já importado
  let bolsas: Produto[] = [];
  let roupas: Produto[] = [];
  let sapatos: Produto[] = [];

  try {
    bolsas = await loadFromApi(base, "/api/produtos/bolsas");
  } catch {
    bolsas = (bolsasData.produtos ?? []) as Produto[];
  }

  try {
    roupas = await loadFromApi(base, "/api/produtos/roupas");
  } catch {
    roupas = (roupasData.produtos ?? []) as Produto[];
  }

  try {
    sapatos = await loadFromApi(base, "/api/produtos/sapatos");
  } catch {
    sapatos = (sapatosData.produtos ?? []) as Produto[];
  }

  bolsas = bolsas.map((p) => ({ ...p, __tipo: "bolsas" as const }));
  roupas = roupas.map((p) => ({ ...p, __tipo: "roupas" as const }));
  sapatos = sapatos.map((p) => ({ ...p, __tipo: "sapatos" as const }));

  const produtos: Produto[] = [...bolsas, ...roupas, ...sapatos];

  // itens da MARCA da URL
  const itensIniciais = produtos.filter(
    (p) => slugify(p.title ?? "") === marca
  );

  // auxiliares
  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitle).filter(Boolean))
  ) as string[];
  const tipos = ["bolsas", "roupas", "sapatos"] as const;

  const titulo = `Marcas: ${marca.replace(/-/g, " ")}`;

  const ClientMarcasPage = (await import("./ClientMarcasPage")).default;

  return (
    <ClientMarcasPage
      titulo={titulo}
      produtos={produtos}
      itensIniciais={itensIniciais}
      categorias={categorias}
      tipos={tipos as unknown as string[]}
    />
  );
}
