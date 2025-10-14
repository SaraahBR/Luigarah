"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useBolsas } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

export default function BolsasCategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;
  
  // Busca TODAS as bolsas usando a nova API
  const { bolsas: produtos = [], isLoading } = useBolsas(0, 100);

  // Filtra produtos pela categoria específica (subtitulo) e adiciona o campo __tipo
  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter(produto => 
        slugify(produto.subtitulo ?? "") === categoria
      )
      .map(produto => ({
        ...produto,
        __tipo: "bolsas" as const
      }));
  }, [produtos, categoria]);

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  // Prepara dados para o componente
  const categorias = Array.from(
    new Set(produtos.map((p) => p.subtitulo).filter(Boolean))
  ) as string[];
  
  const marcas = Array.from(
    new Set(produtos.map((p) => p.titulo).filter(Boolean))
  ) as string[];
  
  const titulo = `Bolsas: ${categoria.replace(/-/g, " ")}`;
  const tamanhosDisponiveis: string[] = []; // Bolsas não usam tamanhos

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
