"use client";

import { useBolsas, useRoupas, useSapatos } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "./ClientMarcasIndex";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function MarcasIndexPage() {
  const { bolsas, isLoading: loadingBolsas } = useBolsas();
  const { roupas, isLoading: loadingRoupas } = useRoupas();
  const { sapatos, isLoading: loadingSapatos } = useSapatos();

  if (loadingBolsas || loadingRoupas || loadingSapatos) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Carregando marcas...</p>
      </section>
    );
  }

  // Combinar todos os produtos com tipo
  const todosProdutos: ProdutoComTipo[] = [
    ...(bolsas || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "bolsas" as const })),
    ...(roupas || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "roupas" as const })),
    ...(sapatos || []).map((p: ProdutoDTO) => ({ ...p, __tipo: "sapatos" as const }))
  ];

  // Extrair marcas únicas (titulo = marca)
  const marcas = Array.from(
    new Set(todosProdutos.map(p => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" }));

  // Extrair categorias únicas (subtitulo = categoria)
  const categorias = Array.from(
    new Set(todosProdutos.map(p => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  return (
    <ClientMarcasIndex
      titulo="Marcas"
      produtos={todosProdutos}
      marcas={marcas as string[]}
      categorias={categorias}
    />
  );
}