"use client";

import React from "react";
import { slugify } from "@/lib/slug";
import { useGetBolsasQuery, useGetRoupasQuery, useGetSapatosQuery } from "@/store/productsApi";
import type { Produto } from "@/store/productsApi";
import ClientMarcasIndex from "../ClientMarcasIndex";

type ProdutoComTipo = Produto & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function MarcasPage({
  params,
}: {
  params: Promise<{ marca: string }>;
}) {
  const { marca } = React.use(params);
  const { data: bolsas = [], isLoading: loadingBolsas } = useGetBolsasQuery();
  const { data: roupas = [], isLoading: loadingRoupas } = useGetRoupasQuery();
  const { data: sapatos = [], isLoading: loadingSapatos } = useGetSapatosQuery();

  if (loadingBolsas || loadingRoupas || loadingSapatos) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Carregando produtos da marca...</p>
      </section>
    );
  }

  // Combinar todos os produtos com tipo
  const todosProdutos: ProdutoComTipo[] = [
    ...(bolsas || []).map((p: Produto) => ({ ...p, __tipo: "bolsas" as const })),
    ...(roupas || []).map((p: Produto) => ({ ...p, __tipo: "roupas" as const })),
    ...(sapatos || []).map((p: Produto) => ({ ...p, __tipo: "sapatos" as const }))
  ];

  // Filtrar produtos da marca (titulo = marca)
  const produtosDaMarca = todosProdutos.filter((p) => {
    const tMarca = slugify(p.titulo ?? "");
    const tParam = slugify(marca);
    return tMarca === tParam;
  });

  if (!produtosDaMarca.length) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p>Nenhum produto encontrado para a marca &ldquo;{marca}&rdquo;.</p>
      </div>
    );
  }

  const nomeRealMarca = produtosDaMarca[0]?.titulo ?? marca.charAt(0).toUpperCase() + marca.slice(1);
  
  // Prepara dados para os filtros do componente
  const todasCategorias = Array.from(
    new Set(todosProdutos.map((p) => p.subtitulo).filter(Boolean))
  ) as string[];
  
  const todasMarcas = Array.from(
    new Set(todosProdutos.map((p) => p.titulo).filter(Boolean))
  ) as string[];

  return (
    <ClientMarcasIndex
      titulo={`Marca • ${nomeRealMarca}`}
      produtos={produtosDaMarca}
      marcas={todasMarcas}
      categorias={todasCategorias}
      tamanhosDisponiveis={[]}
    />
  );
}
