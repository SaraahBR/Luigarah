import { getBaseUrl } from "@/lib/http";
import { slugify } from "@/lib/slug";

type Produto = {
  id: number;
  titulo?: string;     // marca
  subtitulo?: string;  // categoria
  autor?: string;      // designer
  descricao?: string;  // nome do produto
  preco?: number;
  imagem?: string;
  imagemHover?: string;
  tamanho?: string;
  dimensao?: "Grande" | "Mini" | "Média" | "Pequena";
  imagens?: string[];
  composicao?: string;
  destaques?: string[];
  categoria?: string;  // bolsas, roupas, sapatos
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
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  const itensIniciais = produtos.filter(
    (p) => slugify(p.subtitulo ?? "") === categoria
  );

  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitulo).filter(Boolean))
  ) as string[];
  const marcas = Array.from(
    new Set(produtos.map((p) => p.titulo).filter(Boolean))
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
