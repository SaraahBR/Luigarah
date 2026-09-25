import { useMemo } from "react";
import { ProdutoDTO } from "./api/types";
import { useBuscarTamanhosDosProdutosQuery } from "./api/produtosApi";

interface UseTamanhosEDimensoesResult {
  tamanhos: string[];
  dimensoes: string[];
  isLoading: boolean;
  error: boolean;
}

/**
 * Hook para extrair tamanhos e dimensões únicos de uma lista de produtos.
 * - Tamanhos: uma única requisição para todos os produtos (cache do RTK Query).
 * - Dimensões: lidas dos próprios produtos, que já vêm com o campo `dimensao`.
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

  // Extrair IDs dos produtos (ordenados: a mesma lista reaproveita o cache)
  const produtoIds = useMemo(() => {
    return produtos
      .map((p) => p.id)
      .filter((id): id is number => id !== undefined && id !== null)
      .sort((a, b) => a - b);
  }, [produtos]);

  // Buscar tamanhos da API
  const {
    data: tamanhos,
    isLoading,
    error,
  } = useBuscarTamanhosDosProdutosQuery(
    { produtoIds },
    { skip: produtoIds.length === 0 }
  );

  // Dimensões dos produtos, normalizadas e sem repetição
  const dimensoesNormalizadas = useMemo(() => {
    const dimensoes = produtos
      .map((p) => p.dimensao?.trim())
      .filter((d): d is string => !!d)
      .sort();
    return Array.from(new Set(dimensoes.map(normalizarDimensao)));
  }, [produtos]);

  return {
    tamanhos: tamanhos || [],
    dimensoes: dimensoesNormalizadas,
    isLoading,
    error: !!error,
  };
}
