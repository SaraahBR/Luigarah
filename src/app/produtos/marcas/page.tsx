"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useBolsas, useRoupas, useSapatos, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "./ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
  __tamanhos?: string[]; // Tamanhos disponíveis para este produto
};

function MarcasIndexPageContent() {
  const searchParams = useSearchParams();
  const identidade = searchParams.get("identidade")?.toLowerCase();

  // Buscar produtos por identidade ou todos os produtos
  const { bolsas = [], isLoading: loadingBolsas } = useBolsas(0, 100);
  const { roupas = [], isLoading: loadingRoupas } = useRoupas(0, 100);
  const { sapatos = [], isLoading: loadingSapatos } = useSapatos(0, 100);
  
  const { produtos: produtosMulher = [], isLoading: loadingMulher } = useProdutosMulher(0, 100);
  const { produtos: produtosHomem = [], isLoading: loadingHomem } = useProdutosHomem(0, 100);
  const { produtos: produtosUnissex = [], isLoading: loadingUnissex } = useProdutosUnissex(0, 100);
  const { produtos: produtosKids = [], isLoading: loadingKids } = useProdutosKids(0, 100);

  const isLoading = identidade 
    ? (identidade === "mulher" && loadingMulher) || 
      (identidade === "homem" && loadingHomem) || 
      (identidade === "unissex" && loadingUnissex) || 
      (identidade === "kids" && loadingKids)
    : loadingBolsas || loadingRoupas || loadingSapatos;

  // Combinar produtos baseado na identidade ou todos
  const todosProdutos: ProdutoComTipo[] = useMemo(() => {
    let produtosBase: ProdutoDTO[] = [];
    
    if (identidade) {
      // Filtrar por identidade
      switch (identidade) {
        case "mulher":
          produtosBase = produtosMulher;
          break;
        case "homem":
          produtosBase = produtosHomem;
          break;
        case "unissex":
          produtosBase = produtosUnissex;
          break;
        case "kids":
          produtosBase = produtosKids;
          break;
        default:
          produtosBase = [...bolsas, ...roupas, ...sapatos];
      }
    } else {
      // Todos os produtos
      produtosBase = [...bolsas, ...roupas, ...sapatos];
    }

    // Filtrar produtos unissex se estiver em identidade mulher ou homem
    if (identidade === "mulher" || identidade === "homem") {
      produtosBase = produtosBase.filter((produto) => {
        const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
        return identidadeCodigo !== 'unissex';
      });
    }

    // Adicionar campo __tipo baseado na categoria
    return produtosBase.map((produto) => {
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
        __tamanhos: []
      };
    });
  }, [identidade, bolsas, roupas, sapatos, produtosMulher, produtosHomem, produtosUnissex, produtosKids]);

  if (isLoading) {
    return <SimpleLoader isLoading={true} />;
  }

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

export default function MarcasIndexPage() {
  return (
    <Suspense fallback={<SimpleLoader isLoading={true} />}>
      <MarcasIndexPageContent />
    </Suspense>
  );
}