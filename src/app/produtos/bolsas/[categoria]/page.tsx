import { getBaseUrl } from "@/lib/http";
import { slugify } from "@/lib/slug";

type Produto = {
  id: number;
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  preco?: number;
  img?: string;
  imgHover?: string;
  dimension?: "Grande" | "Média" | "Pequena" | "Mini";
  images?: string[];
  composition?: string;
  highlights?: string[];
};

export default async function BolsasCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const base = await getBaseUrl();

  // Primeiro tenta API e depois  Fallback para JSON local
  let produtos: Produto[] = [];
  try {
    const res = await fetch(`${base}/api/produtos/bolsas`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as { produtos?: Produto[] };
      produtos = data?.produtos ?? [];
    }
  } catch {}
  if (!produtos.length) {
    try {
      const data = (await import("@/data/bolsas.json")).default as {
        produtos: Produto[];
      };
      produtos = data.produtos ?? [];
    } catch {
      produtos = [];
    }
  }

  // Itens da categoria da URL
  const itensIniciais = produtos.filter(
    (p) => slugify(p.subtitle ?? "") === categoria
  );

  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitle).filter(Boolean))
  ) as string[];
  const marcas = Array.from(
    new Set(produtos.map((p) => p.title).filter(Boolean))
  ) as string[];

  const titulo = `Bolsas: ${categoria.replace(/-/g, " ")}`;

  // Import dinâmico do componente cliente
  const ClientBolsasCategoria = (await import("./ClientBolsasCategoria"))
    .default;

  return (
    <ClientBolsasCategoria
      titulo={titulo}
      produtos={produtos}
      itensIniciais={itensIniciais}
      categorias={categorias}
      marcas={marcas}
    />
  );
}
