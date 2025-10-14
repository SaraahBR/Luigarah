"use client";

import { useMemo } from "react";
import { useProdutosHomem } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function HomemPage() {
  const { produtos = [], isLoading } = useProdutosHomem(0, 100);

  // Adicionar campo __tipo baseado na categoria do produto
  const produtosComTipo: ProdutoComTipo[] = useMemo(() => {
    return produtos.map((produto) => {
      let tipo: "bolsas" | "roupas" | "sapatos" = "roupas";
      
      const categoria = produto.categoria?.toLowerCase() || "";
      if (categoria.includes("bolsa")) {
        tipo = "bolsas";
      } else if (categoria.includes("sapato") || categoria.includes("calçado")) {
        tipo = "sapatos";
      }

      return {
        ...produto,
        __tipo: tipo,
      };
    });
  }, [produtos]);

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  const marcas = Array.from(
    new Set(produtosComTipo.map((p) => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  const categorias = Array.from(
    new Set(produtosComTipo.map((p) => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  return (
    <ClientMarcasIndex
      titulo="Moda Masculina"
      produtos={produtosComTipo}
      marcas={marcas}
      categorias={categorias}
      tamanhosDisponiveis={[]}
    />
  );
}
