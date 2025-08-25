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
  tamanho?: string;
  dimension?: "Grande" | "Mini" | "Média" | "Pequena";
  images?: string[];
  composition?: string;
  highlights?: string[];
};

export default async function RoupasCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const base = await getBaseUrl();

  let produtos: Produto[] = [];
  try {
    const res = await fetch(`${base}/api/produtos/roupas`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as { produtos?: Produto[] };
      produtos = data?.produtos ?? [];
    }
  } catch {}

  if (!produtos.length) {
    try {
      const data = (await import("@/data/roupas.json")).default as {
        produtos: Produto[];
      };
      produtos = data.produtos ?? [];
    } catch {
      produtos = [];
    }
  }

  const itensIniciais = produtos.filter(
    (p) => slugify(p.subtitle ?? "") === categoria
  );

  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitle).filter(Boolean))
  ) as string[];
  const marcas = Array.from(
    new Set(produtos.map((p) => p.title).filter(Boolean))
  ) as string[];

  const titulo = `Roupas: ${categoria.replace(/-/g, " ")}`;

  const ClientRoupasCategoria = (await import("./ClientRoupasCategoria"))
    .default;

  return (
    <ClientRoupasCategoria
      titulo={titulo}
      produtos={produtos}
      itensIniciais={itensIniciais}
      categorias={categorias}
      marcas={marcas}
    />
  );
}
