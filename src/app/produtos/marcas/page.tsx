"use client";

import { useBolsas, useRoupas, useSapatos } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "./ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
  __tamanhos?: string[]; // Tamanhos disponíveis para este produto
};

export default function MarcasIndexPage() {
  const { bolsas = [], isLoading: loadingBolsas } = useBolsas(0, 100);
  const { roupas = [], isLoading: loadingRoupas } = useRoupas(0, 100);
  const { sapatos = [], isLoading: loadingSapatos } = useSapatos(0, 100);

  if (loadingBolsas || loadingRoupas || loadingSapatos) {
    return <SimpleLoader isLoading={true} />;
  }

  // Combinar todos os produtos com tipo
  const todosProdutos: ProdutoComTipo[] = [
    ...(bolsas || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "bolsas" as const, __tamanhos: [] })),
    ...(roupas || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "roupas" as const, __tamanhos: [] })),
    ...(sapatos || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "sapatos" as const, __tamanhos: [] }))
  ];

  // Extrair marcas únicas (titulo = marca)
  const marcas = Array.from(
    new Set(todosProdutos.map(p => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" }));

  // Extrair categorias únicas (subtitulo = categoria)
  const categorias = Array.from(
    new Set(todosProdutos.map(p => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  // Tamanhos podem ser array vazio por enquanto
  const todosOsTamanhos: string[] = [];

  return (
    <ClientMarcasIndex
      titulo="Marcas"
      produtos={todosProdutos}
      marcas={marcas as string[]}
      categorias={categorias}
      tamanhosDisponiveis={todosOsTamanhos}
    />
  );
}