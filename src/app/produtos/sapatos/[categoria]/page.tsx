"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useGetSapatosQuery } from "@/store/productsApi";
import { slugify } from "@/lib/slug";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";

export default function SapatosCategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;
  
  // Busca TODOS os sapatos
  const { data: produtos = [], isLoading } = useGetSapatosQuery();

  // Filtra produtos pela categoria específica (subtitulo)
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => 
      slugify(produto.subtitulo ?? "") === categoria
    );
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
  
  const titulo = `Sapatos: ${categoria.replace(/-/g, " ")}`;
  const tamanhosDisponiveis = ["32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

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
