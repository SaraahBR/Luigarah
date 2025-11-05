import { useMemo } from "react";
import { ProdutoDTO } from "./api/types";
import { useBuscarTamanhosEDimensoesUnicosQuery } from "./api/produtosApi";

interface UseTamanhosEDimensoesResult {
  tamanhos: string[];
  dimensoes: string[];
  isLoading: boolean;
  error: boolean;
}

/**
 * Hook para extrair tamanhos e dimensões únicos de uma lista de produtos.
 * Busca os dados diretamente do banco de dados via API e usa cache do RTK Query.
 * 
 * @param produtos - Lista de produtos filtrados
 * @returns Objeto com arrays de tamanhos e dimensões únicos, ordenados, e estados de loading/error
 */
export function useTamanhosEDimensoes(
  produtos: ProdutoDTO[]
): UseTamanhosEDimensoesResult {
  // Normalizar dimensões para o padrão: Grande, Médio, Pequeno
  const normalizarDimensao = (dim: string): string => {
    const dimLower = dim.toLowerCase();
    if (dimLower.includes('grand')) return 'Grande';
    if (dimLower.includes('médi') || dimLower.includes('medi')) return 'Médio';
    if (dimLower.includes('peque') || dimLower.includes('mini')) return 'Pequeno';
    return dim;
  };

  // Extrair IDs dos produtos
  const produtoIds = useMemo(() => {
    return produtos
      .map((p) => p.id)
      .filter((id): id is number => id !== undefined && id !== null);
  }, [produtos]);

  // Buscar tamanhos e dimensões da API
  const {
    data,
    isLoading,
    error,
  } = useBuscarTamanhosEDimensoesUnicosQuery(
    { produtoIds },
    { skip: produtoIds.length === 0 }
  );

  // Normalizar dimensões vindas da API
  const dimensoesNormalizadas = useMemo(() => {
    if (!data?.dimensoes) return [];
    const normalized = data.dimensoes.map(normalizarDimensao);
    // Remover duplicatas após normalização
    return Array.from(new Set(normalized));
  }, [data?.dimensoes]);

  return {
    tamanhos: data?.tamanhos || [],
    dimensoes: dimensoesNormalizadas,
    isLoading,
    error: !!error,
  };
}
