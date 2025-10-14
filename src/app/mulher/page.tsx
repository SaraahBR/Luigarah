"use client";

import { useMemo } from "react";
import { useProdutosMulher } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function MulherPage() {
  const { produtos = [], isLoading } = useProdutosMulher(0, 100);

  // Adicionar campo __tipo baseado na categoria do produto
  const produtosComTipo: ProdutoComTipo[] = useMemo(() => {
    return produtos.map((produto) => {
      // Determinar o tipo baseado na categoria
      let tipo: "bolsas" | "roupas" | "sapatos" = "roupas"; // default
      
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

  // Extrair marcas e categorias únicas
  const marcas = Array.from(
    new Set(produtosComTipo.map((p) => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  const categorias = Array.from(
    new Set(produtosComTipo.map((p) => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  return (
    <ClientMarcasIndex
      titulo="Moda Feminina"
      produtos={produtosComTipo}
      marcas={marcas}
      categorias={categorias}
      tamanhosDisponiveis={[]}
    />
  );
}
