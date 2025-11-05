"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useSapatos, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";
import { normalizeIdentity } from "@/lib/identityUtils";
import { useTamanhosEDimensoes } from "@/hooks/useTamanhosEDimensoes";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

function SapatosCategoriaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = params.categoria as string;
  const identidadeParam = searchParams.get('identidade');
  const identidade = normalizeIdentity(identidadeParam); // Normaliza: "mulher"/"feminino" -> "feminino"
  
  // Busca TODOS os sapatos usando a nova API
  const { sapatos: sapatosApi = [], isLoading: isLoadingSapatos } = useSapatos(0, 1000);
  
  // Busca produtos específicos por identidade (para ter dados mais precisos)
  const { produtos: produtosMulher = [], isLoading: isLoadingMulher } = useProdutosMulher(0, 1000);
  const { produtos: produtosHomem = [], isLoading: isLoadingHomem } = useProdutosHomem(0, 1000);
  const { produtos: produtosUnissex = [], isLoading: isLoadingUnissex } = useProdutosUnissex(0, 1000);
  const { produtos: produtosKids = [], isLoading: isLoadingKids } = useProdutosKids(0, 1000);
  
  const isLoading = isLoadingSapatos || isLoadingMulher || isLoadingHomem || isLoadingUnissex || isLoadingKids;

  // Filtra produtos pela categoria específica (subtitulo) e adiciona o campo __tipo
  const produtosFiltrados = useMemo(() => {
    // Determina qual array de produtos usar baseado na identidade normalizada
    let produtosBase = sapatosApi;
    
    if (identidade) {
      switch (identidade) {
        case "feminino": // "mulher" e "feminino" caem aqui
          produtosBase = produtosMulher.filter((p: typeof produtosMulher[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
        case "masculino": // "homem" e "masculino" caem aqui
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
        case "infantil": // "kids" e "infantil" caem aqui
          produtosBase = produtosKids.filter((p: typeof produtosKids[0]) => {
            const cat = p.categoria?.toLowerCase() || "";
            return cat.includes("sapato") || cat.includes("calçado");
          });
          break;
      }
      
      // Filtrar produtos unissex se estiver em identidade feminino ou masculino
      if (identidade === "feminino" || identidade === "masculino") {
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
      .map((produto: typeof produtosMulher[0]) => {
        // Normalizar imagens e destaques para garantir que sejam sempre arrays
        const imagensNormalizadas = Array.isArray(produto.imagens) 
          ? produto.imagens 
          : produto.imagens 
            ? [produto.imagens] 
            : undefined;
            
        const destaquesNormalizados = Array.isArray(produto.destaques)
          ? produto.destaques
          : produto.destaques
            ? [produto.destaques]
            : undefined;

        return {
          ...produto,
          imagens: imagensNormalizadas,
          destaques: destaquesNormalizados,
          __tipo: "sapatos" as const
        };
      });
  }, [identidade, sapatosApi, produtosMulher, produtosHomem, produtosUnissex, produtosKids, categoria]);

  // Prepara dados para o componente - usar produtosBase para obter todas as categorias/marcas da identidade
  let todosProdutosIdentidade = sapatosApi;
  
  if (identidade) {
    switch (identidade) {
      case "feminino": // "mulher" e "feminino" caem aqui
        todosProdutosIdentidade = produtosMulher.filter((p: typeof produtosMulher[0]) => {
          const cat = p.categoria?.toLowerCase() || "";
          return cat.includes("sapato") || cat.includes("calçado");
        });
        break;
      case "masculino": // "homem" e "masculino" caem aqui
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
      case "infantil": // "kids" e "infantil" caem aqui
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
  
  // Buscar tamanhos e dimensões disponíveis do banco de dados
  const {
    tamanhos: tamanhosDisponiveis,
    dimensoes: dimensoesDisponiveis,
  } = useTamanhosEDimensoes(produtosFiltrados);
  
  const titulo = `Sapatos: ${categoria.replace(/-/g, " ")}`;

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  return (
    <ClientMarcasIndex 
      titulo={titulo}
      produtos={produtosFiltrados}
      marcas={marcas}
      categorias={categorias}
      tamanhosDisponiveis={tamanhosDisponiveis}
      dimensoesDisponiveis={dimensoesDisponiveis}
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
