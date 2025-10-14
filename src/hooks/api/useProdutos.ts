import { useMemo } from 'react';
import {
  useListarProdutosQuery,
  useListarBolsasQuery,
  useListarRoupasQuery,
  useListarSapatosQuery,
  useBuscarProdutoPorIdQuery,
  useBuscarProdutosPorAutorQuery,
} from './produtosApi';
import { useBuscarProdutosPorIdentidadeQuery } from './identidadesApi';
import { FiltrosProdutos } from './types';

// Hook para produtos de bolsas
export const useBolsas = (pagina = 0, tamanho = 15) => {
  const { data, isLoading, error, refetch } = useListarBolsasQuery({
    pagina,
    tamanho,
  });

  return {
    bolsas: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 0,
    paginaAtual: data?.paginaAtual || 0,
  };
};

// Hook para produtos de roupas
export const useRoupas = (pagina = 0, tamanho = 15) => {
  const { data, isLoading, error, refetch } = useListarRoupasQuery({
    pagina,
    tamanho,
  });

  return {
    roupas: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 0,
    paginaAtual: data?.paginaAtual || 0,
  };
};

// Hook para produtos de sapatos
export const useSapatos = (pagina = 0, tamanho = 15) => {
  const { data, isLoading, error, refetch } = useListarSapatosQuery({
    pagina,
    tamanho,
  });

  return {
    sapatos: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 0,
    paginaAtual: data?.paginaAtual || 0,
  };
};

// Hook para buscar produtos com filtros avançados
export const useProdutosFiltrados = (filtros: FiltrosProdutos) => {
  const { data, isLoading, error, refetch } = useListarProdutosQuery(filtros);

  return {
    produtos: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 0,
    paginaAtual: data?.paginaAtual || 0,
  };
};

// Hook para buscar um produto específico
export const useProduto = (id: number) => {
  const { data, isLoading, error, refetch } = useBuscarProdutoPorIdQuery(id, {
    skip: !id,
  });

  return {
    produto: data?.dados,
    isLoading,
    error,
    refetch,
    encontrado: data?.sucesso || false,
  };
};

// Hook para buscar produtos por identidade (por código)
export const useProdutosPorIdentidade = (codigo: string, pagina = 0, tamanho = 15) => {
  const { data, isLoading, error, refetch } = useBuscarProdutosPorIdentidadeQuery(
    { codigo },
    { skip: !codigo }
  );

  // A API de identidades retorna um array direto de produtos
  const produtos = data || [];

  // Implementar paginação no frontend
  const inicio = pagina * tamanho;
  const fim = inicio + tamanho;
  const produtosPaginados = produtos.slice(inicio, fim);
  const total = produtos.length;
  const totalPaginas = Math.ceil(total / tamanho);

  return {
    produtos: produtosPaginados,
    isLoading,
    error,
    refetch,
    total,
    totalPaginas,
    paginaAtual: pagina,
  };
};

// Hook para produtos femininos
export const useProdutosMulher = (pagina = 0, tamanho = 15) => {
  return useProdutosPorIdentidade('mulher', pagina, tamanho);
};

// Hook para produtos masculinos
export const useProdutosHomem = (pagina = 0, tamanho = 15) => {
  return useProdutosPorIdentidade('homem', pagina, tamanho);
};

// Hook para produtos unissex
export const useProdutosUnissex = (pagina = 0, tamanho = 15) => {
  return useProdutosPorIdentidade('unissex', pagina, tamanho);
};

// Hook para produtos infantis
export const useProdutosKids = (pagina = 0, tamanho = 15) => {
  return useProdutosPorIdentidade('infantil', pagina, tamanho);
};

// Hook para buscar produtos por autor
export const useProdutosPorAutor = (autor: string) => {
  const { data, isLoading, error, refetch } = useBuscarProdutosPorAutorQuery(autor, {
    skip: !autor,
  });

  return {
    produtos: data?.dados || [],
    isLoading,
    error,
    refetch,
  };
};

// Hook para buscar produtos com pesquisa (busca livre)
export const usePesquisarProdutos = (termoBusca: string, categoria?: string) => {
  const filtros = useMemo(() => {
    const params: FiltrosProdutos = {};
    
    if (termoBusca) {
      params.busca = termoBusca;
    }
    
    if (categoria) {
      params.categoria = categoria as 'bolsas' | 'roupas' | 'sapatos';
    }
    
    return params;
  }, [termoBusca, categoria]);

  const { data, isLoading, error, refetch } = useListarProdutosQuery(filtros, {
    skip: !termoBusca,
  });

  return {
    produtos: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
  };
};

// Hook para produtos por categoria com subtítulo
export const useProdutosPorCategoriaESubtitulo = (
  categoria: string,
  subtitulo?: string,
  pagina = 0,
  tamanho = 15
) => {
  const filtros = useMemo(() => ({
    categoria: categoria as 'bolsas' | 'roupas' | 'sapatos',
    subtitulo,
    pagina,
    tamanho,
  }), [categoria, subtitulo, pagina, tamanho]);

  const { data, isLoading, error, refetch } = useListarProdutosQuery(filtros);

  return {
    produtos: data?.dados || [],
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    totalPaginas: data?.totalPaginas || 0,
    paginaAtual: data?.paginaAtual || 0,
  };
};