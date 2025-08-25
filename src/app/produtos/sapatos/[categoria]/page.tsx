import { getBaseUrl } from "@/lib/http";
import { slugify } from "@/lib/slug";

type Produto = {
  id: number;
  title?: string; // marca
  subtitle?: string; // categoria
  author?: string; // designer
  description?: string; // nome do produto
  preco?: number;
  img?: string;
  imgHover?: string;
  tamanho?: string; // ex.: 32..41
  dimension?: "Pequeno" | "Médio" | "Grande" | "Mini";
  images?: string[];
  composition?: string;
  highlights?: string[];
};

export default async function SapatosCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const base = await getBaseUrl();

  let produtos: Produto[] = [];
  try {
    const res = await fetch(`${base}/api/produtos/sapatos`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as { produtos?: Produto[] };
      produtos = data?.produtos ?? [];
    }
  } catch {}
  if (!produtos.length) {
    const data = (await import("@/data/sapatos.json")).default as {
      produtos: Produto[];
    };
    produtos = data.produtos ?? [];
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

  const titulo = `Sapatos: ${categoria.replace(/-/g, " ")}`;

  // Import dinâmico do componente cliente
  const ClientSapatosCategoria = (await import("./ClientSapatosCategoria"))
    .default;

  return (
    <ClientSapatosCategoria
      titulo={titulo}
      produtos={produtos}
      itensIniciais={itensIniciais}
      categorias={categorias}
      marcas={marcas}
    />
  );
}
