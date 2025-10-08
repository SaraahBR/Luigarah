"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useGetRoupasQuery } from "@/store/productsApi";
import { slugify } from "@/lib/slug";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";

export default function RoupasCategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;
  
  // Busca TODAS as roupas
  const { data: produtos = [], isLoading } = useGetRoupasQuery();

  // Filtra produtos pela categoria específica (subtitulo) e adiciona o campo __tipo
  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter(produto => 
        slugify(produto.subtitulo ?? "") === categoria
      )
      .map(produto => ({
        ...produto,
        __tipo: "roupas" as const
      }));
  }, [produtos, categoria]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Prepara dados para o componente
  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitulo).filter(Boolean))
  ) as string[];
  
  const marcas = Array.from(
    new Set(produtos.map((p) => p.titulo).filter(Boolean))
  ) as string[];
  
  const titulo = `Roupas: ${categoria.replace(/-/g, " ")}`;
  const tamanhosDisponiveis = ["XXXS", "XXS", "XS", "S", "M", "L", "XL"];

  return (
    <ClientMarcasIndex 
      titulo={titulo}
      produtos={produtosFiltrados}
      marcas={marcas}
      categorias={categorias}
      tamanhosDisponiveis={tamanhosDisponiveis}
    />
  );
}
