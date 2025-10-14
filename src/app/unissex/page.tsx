"use client";

import { useMemo } from "react";
import { useProdutosUnissex } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function UnissexPage() {
  const { produtos = [], isLoading } = useProdutosUnissex(0, 100);

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
      titulo="Moda Unissex"
      produtos={produtosComTipo}
      marcas={marcas}
      categorias={categorias}
      tamanhosDisponiveis={[]}
    />
  );
}
