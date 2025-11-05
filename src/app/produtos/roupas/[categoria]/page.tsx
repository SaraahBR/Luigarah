"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useRoupas, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";
import { normalizeIdentity } from "@/lib/identityUtils";
import { useTamanhosEDimensoes } from "@/hooks/useTamanhosEDimensoes";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

function RoupasCategoriaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = params.categoria as string;
  const identidadeParam = searchParams.get("identidade");
  const identidade = normalizeIdentity(identidadeParam); // Normaliza: "mulher"/"feminino" -> "feminino"
  
  // Buscar produtos por identidade ou todas as roupas
  const { roupas: roupasApi = [], isLoading: loadingRoupas } = useRoupas(0, 1000);
  const { produtos: produtosMulher = [], isLoading: loadingMulher } = useProdutosMulher(0, 1000);
  const { produtos: produtosHomem = [], isLoading: loadingHomem } = useProdutosHomem(0, 1000);
  const { produtos: produtosUnissex = [], isLoading: loadingUnissex } = useProdutosUnissex(0, 1000);
  const { produtos: produtosKids = [], isLoading: loadingKids } = useProdutosKids(0, 1000);

  const isLoading = identidade 
    ? (identidade === "feminino" && loadingMulher) || 
      (identidade === "masculino" && loadingHomem) || 
      (identidade === "unissex" && loadingUnissex) || 
      (identidade === "infantil" && loadingKids)
    : loadingRoupas;

  // Filtra produtos pela categoria específica e identidade
  const produtosFiltrados = useMemo(() => {
    let produtosBase = roupasApi;
    
    if (identidade) {
      // Filtrar roupas da identidade específica
      let produtosIdentidade: typeof produtosMulher = [];
      switch (identidade) {
        case "feminino": // "mulher" e "feminino" caem aqui
          produtosIdentidade = produtosMulher;
          break;
        case "masculino": // "homem" e "masculino" caem aqui
          produtosIdentidade = produtosHomem;
          break;
        case "unissex":
          produtosIdentidade = produtosUnissex;
          break;
        case "infantil": // "kids" e "infantil" caem aqui
          produtosIdentidade = produtosKids;
          break;
      }
      
      // Filtrar apenas roupas (que não sejam bolsas nem sapatos)
      produtosBase = produtosIdentidade.filter(p => {
        const cat = p.categoria?.toLowerCase() || "";
        return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
      });
    }
    
    // Filtrar produtos unissex se estiver em identidade feminino ou masculino
    if (identidade === "feminino" || identidade === "masculino") {
      produtosBase = produtosBase.filter((produto) => {
        const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
        return identidadeCodigo !== 'unissex';
      });
    }
    
    return produtosBase
      .filter(produto => 
        slugify(produto.subtitulo ?? "") === categoria
      )
      .map(produto => {
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
          __tipo: "roupas" as const
        };
      });
  }, [identidade, roupasApi, produtosMulher, produtosHomem, produtosUnissex, produtosKids, categoria]);

  // Prepara dados para o componente - usar produtosBase para obter todas as categorias/marcas da identidade
  let todosProdutosIdentidade = roupasApi;
  
  if (identidade) {
    switch (identidade) {
      case "feminino": // "mulher" e "feminino" caem aqui
        todosProdutosIdentidade = produtosMulher.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
      case "masculino": // "homem" e "masculino" caem aqui
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
      case "infantil": // "kids" e "infantil" caem aqui
        todosProdutosIdentidade = produtosKids.filter(p => {
          const cat = p.categoria?.toLowerCase() || "";
          return !cat.includes("bolsa") && !cat.includes("sapato") && !cat.includes("calçado");
        });
        break;
    }
    
    // Filtrar produtos unissex se estiver em identidade feminino ou masculino
    if (identidade === "feminino" || identidade === "masculino") {
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
  
  // Buscar tamanhos e dimensões disponíveis do banco de dados
  const {
    tamanhos: tamanhosDisponiveis,
    dimensoes: dimensoesDisponiveis,
  } = useTamanhosEDimensoes(produtosFiltrados);
  
  const titulo = `Roupas: ${categoria.replace(/-/g, " ")}`;

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

export default function RoupasCategoriaPage() {
  return (
    <Suspense fallback={<SimpleLoader isLoading={true} />}>
      <RoupasCategoriaPageContent />
    </Suspense>
  );
}
