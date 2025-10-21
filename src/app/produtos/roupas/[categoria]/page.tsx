"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useRoupas, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

function RoupasCategoriaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = params.categoria as string;
  const identidade = searchParams.get("identidade")?.toLowerCase();
  
  // Buscar produtos por identidade ou todas as roupas
  const { roupas: roupasApi = [], isLoading: loadingRoupas } = useRoupas(0, 100);
  const { produtos: produtosMulher = [], isLoading: loadingMulher } = useProdutosMulher(0, 100);
  const { produtos: produtosHomem = [], isLoading: loadingHomem } = useProdutosHomem(0, 100);
  const { produtos: produtosUnissex = [], isLoading: loadingUnissex } = useProdutosUnissex(0, 100);
  const { produtos: produtosKids = [], isLoading: loadingKids } = useProdutosKids(0, 100);

  const isLoading = identidade 
    ? (identidade === "mulher" && loadingMulher) || 
      (identidade === "homem" && loadingHomem) || 
      (identidade === "unissex" && loadingUnissex) || 
      (identidade === "kids" && loadingKids)
    : loadingRoupas;

  // Filtra produtos pela categoria específica e identidade
  const produtosFiltrados = useMemo(() => {
    let produtosBase = roupasApi;
    
    if (identidade) {
      // Filtrar roupas da identidade específica
      let produtosIdentidade: typeof produtosMulher = [];
      switch (identidade) {
        case "mulher":
          produtosIdentidade = produtosMulher;
          break;
        case "homem":
          produtosIdentidade = produtosHomem;
          break;
        case "unissex":
          produtosIdentidade = produtosUnissex;
          break;
        case "kids":
          produtosIdentidade = produtosKids;
          break;
      }
      
      // Filtrar apenas roupas (que não sejam bolsas nem sapatos)
      produtosBase = produtosIdentidade.filter(p => {
        const cat = p.categoria?.toLowerCase() || "";
        return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
      });
    }
    
    // Filtrar produtos unissex se estiver em identidade mulher ou homem
    if (identidade === "mulher" || identidade === "homem") {
      produtosBase = produtosBase.filter((produto) => {
        const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
        return identidadeCodigo !== 'unissex';
      });
    }
    
    return produtosBase
      .filter(produto => 
        slugify(produto.subtitulo ?? "") === categoria
      )
      .map(produto => ({
        ...produto,
        __tipo: "roupas" as const
      }));
  }, [identidade, roupasApi, produtosMulher, produtosHomem, produtosUnissex, produtosKids, categoria]);

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  // Prepara dados para o componente - usar produtosBase para obter todas as categorias/marcas da identidade
  let todosProdutosIdentidade = roupasApi;
  
  if (identidade) {
    switch (identidade) {
      case "mulher":
        todosProdutosIdentidade = produtosMulher.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
      case "homem":
        todosProdutosIdentidade = produtosHomem.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
      case "unissex":
        todosProdutosIdentidade = produtosUnissex.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
      case "kids":
        todosProdutosIdentidade = produtosKids.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
    }
    
    // Filtrar produtos unissex se estiver em identidade mulher ou homem
    if (identidade === "mulher" || identidade === "homem") {
      todosProdutosIdentidade = todosProdutosIdentidade.filter((produto) => {
        const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
        return identidadeCodigo !== 'unissex';
      });
    }
  }
  
  const categorias = Array.from(
    new Set(todosProdutosIdentidade.map((p: typeof produtosMulher[0]) => p.subtitulo).filter(Boolean))
  ) as string[];
  
  const marcas = Array.from(
    new Set(todosProdutosIdentidade.map((p: typeof produtosMulher[0]) => p.titulo).filter(Boolean))
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

export default function RoupasCategoriaPage() {
  return (
    <Suspense fallback={<SimpleLoader isLoading={true} />}>
      <RoupasCategoriaPageContent />
    </Suspense>
  );
}
