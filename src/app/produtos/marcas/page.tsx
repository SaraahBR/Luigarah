"use client";

import { useGetBolsasQuery, useGetRoupasQuery, useGetSapatosQuery, useGetTamanhosPorCategoriaQuery } from "@/store/productsApi";
import type { Produto } from "@/store/productsApi";
import ClientMarcasIndex from "./ClientMarcasIndex";

type ProdutoComTipo = Produto & {
  __tipo: "bolsas" | "roupas" | "sapatos";
  __tamanhos?: string[]; // Tamanhos disponíveis para este produto
};

export default function MarcasIndexPage() {
  const { data: bolsas, isLoading: loadingBolsas } = useGetBolsasQuery();
  const { data: roupas, isLoading: loadingRoupas } = useGetRoupasQuery();
  const { data: sapatos, isLoading: loadingSapatos } = useGetSapatosQuery();
  
  // Buscar tamanhos disponíveis por categoria
  const { data: tamanhosRoupas = [] } = useGetTamanhosPorCategoriaQuery("roupas");
  const { data: tamanhosSapatos = [] } = useGetTamanhosPorCategoriaQuery("sapatos");

  if (loadingBolsas || loadingRoupas || loadingSapatos) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Carregando marcas...</p>
      </section>
    );
  }

  // Combinar todos os produtos com tipo e tamanhos baseados na categoria
  const todosProdutos: ProdutoComTipo[] = [
    ...(bolsas || []).map((p: Produto) => ({ ...p, __tipo: "bolsas" as const, __tamanhos: [] })), // Bolsas não têm tamanhos
    ...(roupas || []).map((p: Produto) => ({ ...p, __tipo: "roupas" as const, __tamanhos: tamanhosRoupas })),
    ...(sapatos || []).map((p: Produto) => ({ ...p, __tipo: "sapatos" as const, __tamanhos: tamanhosSapatos }))
  ];

  // Extrair marcas únicas (titulo = marca)
  const marcas = Array.from(
    new Set(todosProdutos.map(p => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" }));

  // Extrair categorias únicas (subtitulo = categoria)
  const categorias = Array.from(
    new Set(todosProdutos.map(p => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  // Combinar todos os tamanhos disponíveis
  const todosOsTamanhos = [...tamanhosRoupas, ...tamanhosSapatos];

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