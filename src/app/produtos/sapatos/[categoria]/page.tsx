"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useSapatos, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

function SapatosCategoriaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = params.categoria as string;
  const identidade = searchParams.get('identidade');
  
  // Busca TODOS os sapatos usando a nova API
  const { sapatos: sapatosApi = [], isLoading: isLoadingSapatos } = useSapatos(0, 100);
  
  // Busca produtos específicos por identidade (para ter dados mais precisos)
  const { produtos: produtosMulher = [], isLoading: isLoadingMulher } = useProdutosMulher();
  const { produtos: produtosHomem = [], isLoading: isLoadingHomem } = useProdutosHomem();
  const { produtos: produtosUnissex = [], isLoading: isLoadingUnissex } = useProdutosUnissex();
  const { produtos: produtosKids = [], isLoading: isLoadingKids } = useProdutosKids();
  
  const isLoading = isLoadingSapatos || isLoadingMulher || isLoadingHomem || isLoadingUnissex || isLoadingKids;

  // Filtra produtos pela categoria específica (subtitulo) e adiciona o campo __tipo
  const produtosFiltrados = useMemo(() => {
    // Determina qual array de produtos usar baseado na identidade
    let produtosBase = sapatosApi;
    
    if (identidade) {
      switch (identidade) {
        case "mulher":
          produtosBase = produtosMulher.filter((p: typeof produtosMulher[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
        case "homem":
          produtosBase = produtosHomem.filter((p: typeof produtosHomem[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
        case "unissex":
          produtosBase = produtosUnissex.filter((p: typeof produtosUnissex[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
        case "kids":
        case "infantil":
          produtosBase = produtosKids.filter((p: typeof produtosKids[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
      }
      
      // Filtrar produtos unissex se estiver em identidade mulher ou homem
      if (identidade === "mulher" || identidade === "homem") {
        produtosBase = produtosBase.filter((produto: typeof produtosMulher[0]) => {
          const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
          return identidadeCodigo !== 'unissex';
        });
      }
    }
    
    return produtosBase
      .filter((produto: typeof produtosMulher[0]) => 
        slugify(produto.subtitulo ?? "") === categoria
      )
      .map((produto: typeof produtosMulher[0]) => ({
        ...produto,
        __tipo: "sapatos" as const
      }));
  }, [identidade, sapatosApi, produtosMulher, produtosHomem, produtosUnissex, produtosKids, categoria]);

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  // Prepara dados para o componente - usar produtosBase para obter todas as categorias/marcas da identidade
  let todosProdutosIdentidade = sapatosApi;
  
  if (identidade) {
    switch (identidade) {
      case "mulher":
        todosProdutosIdentidade = produtosMulher.filter((p: typeof produtosMulher[0]) => {
          const cat = p.categoria?.toLowerCase() || "";
          return cat.includes("sapato") || cat.includes("calçado");
        });
        break;
      case "homem":
        todosProdutosIdentidade = produtosHomem.filter((p: typeof produtosHomem[0]) => {
          const cat = p.categoria?.toLowerCase() || "";
          return cat.includes("sapato") || cat.includes("calçado");
        });
        break;
      case "unissex":
        todosProdutosIdentidade = produtosUnissex.filter((p: typeof produtosUnissex[0]) => {
          const cat = p.categoria?.toLowerCase() || "";
          return cat.includes("sapato") || cat.includes("calçado");
        });
        break;
      case "kids":
      case "infantil":
        todosProdutosIdentidade = produtosKids.filter((p: typeof produtosKids[0]) => {
          const cat = p.categoria?.toLowerCase() || "";
          return cat.includes("sapato") || cat.includes("calçado");
        });
        break;
    }
    
    // Filtrar produtos unissex se estiver em identidade mulher ou homem
    if (identidade === "mulher" || identidade === "homem") {
      todosProdutosIdentidade = todosProdutosIdentidade.filter((produto: typeof produtosMulher[0]) => {
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

export default function SapatosCategoriaPage() {
  return (
    <Suspense fallback={<SimpleLoader isLoading={true} />}>
      <SapatosCategoriaPageContent />
    </Suspense>
  );
}
