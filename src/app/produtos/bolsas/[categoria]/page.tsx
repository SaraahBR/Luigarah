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
  dimensao?: "Grande" | "Média" | "Pequena" | "Mini";
  imagens?: string[];
  composicao?: string;
  destaques?: string[];
  categoria?: string;  // bolsas, roupas, sapatos
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
    // Fallback removido - usar apenas dados da API
    produtos = [];
  }

  // Itens da categoria da URL
  const itensIniciais = produtos.filter(
    (p) => slugify(p.subtitulo ?? "") === categoria
  );

  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitulo).filter(Boolean))
  ) as string[];
  const marcas = Array.from(
    new Set(produtos.map((p) => p.titulo).filter(Boolean))
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
