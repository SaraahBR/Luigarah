import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper para fazer parse de campos JSON que vêm como string
const parseJsonField = (field: unknown): unknown => {
  if (!field || typeof field !== 'string') return field;
  try {
    // Remove quebras de linha, espaços extras e normaliza a string
    const cleanField = field
      .replace(/\r\n/g, '')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();
    
    return JSON.parse(cleanField);
  } catch (error) {
    console.warn('❌ Erro ao fazer parse do campo JSON:', { field, error });
    return field;
  }
};

// Helper específico para arrays de strings
const parseStringArray = (field: string[] | string | undefined): string[] | undefined => {
  if (!field) return undefined;
  if (Array.isArray(field)) {
    // Filtra URLs válidas se já é array
    return field.filter(url => url && typeof url === 'string' && url.trim() && url !== '/');
  }
  
  if (typeof field === 'string') {
    const parsed = parseJsonField(field);
    if (Array.isArray(parsed)) {
      // Limpa URLs removendo caracteres inválidos no final e valida
      const cleanUrls = parsed.map(url => {
        if (typeof url === 'string') {
          const cleanUrl = url.trim().replace(/[^\w\-\.\/\:\?\&\=\%]+$/, '');
          // Valida se é uma URL válida (deve ter http ou ser path absoluto válido)
          if (cleanUrl && cleanUrl.length > 1 && (cleanUrl.startsWith('http') || (cleanUrl.startsWith('/') && !cleanUrl.endsWith('/')))) {
            return cleanUrl;
          }
        }
        return null;
      }).filter(Boolean) as string[];
      
      return cleanUrls.length > 0 ? cleanUrls : undefined;
    }
    return undefined;
  }
  return undefined;
};

// Helper específico para objetos
const parseObject = (field: Record<string, unknown> | string | undefined): Record<string, unknown> | undefined => {
  if (!field) return undefined;
  if (typeof field === 'object') return field;
  if (typeof field === 'string') {
    const parsed = parseJsonField(field);
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : undefined;
  }
  return undefined;
};

// Helper para transformar produtos do backend
const transformProdutos = (r: ProdutoRaw[] | { dados: ProdutoRaw[] } | { produtos: ProdutoRaw[] }): Produto[] => {
  let produtos: ProdutoRaw[] = [];
  if (Array.isArray(r)) produtos = r;
  else if ('dados' in r) produtos = r.dados;
  else if ('produtos' in r) produtos = r.produtos;
  
  return produtos.map(produto => ({
    ...produto,
    imagens: parseStringArray(produto.imagens),
    destaques: parseStringArray(produto.destaques),
    modelo: parseObject(produto.modelo)
  }));
};

// Tipo para tamanho com estoque
export type ProdutoTamanho = {
  etiqueta: string;
  qtdEstoque: number;
};

// Tipo para dados crus do backend (antes do parse)
type ProdutoRaw = {
  id: number;
  titulo: string;
  subtitulo: string;
  autor?: string;
  descricao?: string;
  preco?: number;
  imagem?: string;
  imagemHover?: string;
  imagens?: string[] | string;  // Pode vir como string JSON
  dimensao?: string;
  composicao?: string;
  destaques?: string[] | string;  // Pode vir como string JSON
  categoria?: string;
  modelo?: Record<string, unknown> | string;  // Pode vir como string JSON
  dataCriacao?: string;
  dataAtualizacao?: string;
};

export type Produto = {
  id: number;
  titulo: string;      // marca
  subtitulo: string;   // categoria
  autor?: string;      // designer
  descricao?: string;  // nome do produto
  preco?: number;
  imagem?: string;
  imagemHover?: string;
  imagens?: string[];  // Será sempre array após o parse
  dimensao?: string;
  composicao?: string;
  destaques?: string[];  // Será sempre array após o parse
  categoria?: string;  // bolsas, roupas, sapatos
  modelo?: Record<string, unknown>;  // Será sempre objeto após o parse
  dataCriacao?: string;
  dataAtualizacao?: string;
};

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://luigarah-backend.onrender.com"
  }),
  keepUnusedDataFor: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 60,
  endpoints: (builder) => ({
    getBolsas: builder.query<Produto[], void>({
      query: () => "/produtos/simple?limite=100",
      transformResponse: (response: { dados: Produto[] }) => {
        const produtos = transformProdutos(response.dados);
        
        // Filtro simples: apenas produtos com categoria 'bolsas'
        const produtosFiltrados = produtos.filter(p => {
          const categoria = (p.categoria || '').toLowerCase();
          return categoria === 'bolsas';
        });
        
        return produtosFiltrados;
      },
    }),
    getRoupas: builder.query<Produto[], void>({
      query: () => "/produtos/simple?limite=100&categoria=roupas",
      transformResponse: (response: { dados: Produto[] }) => {
        const produtos = transformProdutos(response.dados);
        
        // Filtro simples: apenas produtos com categoria 'roupas'
        const produtosFiltrados = produtos.filter(p => {
          const categoria = (p.categoria || '').toLowerCase();
          return categoria === 'roupas';
        });
        
        return produtosFiltrados;
      },
    }),
    getSapatos: builder.query<Produto[], void>({
      query: () => "/produtos/simple?limite=100&categoria=sapatos",
      transformResponse: (response: { dados: Produto[] }) => {
        const produtos = transformProdutos(response.dados);
        
        // Filtro simples: apenas produtos com categoria 'sapatos'
        const produtosFiltrados = produtos.filter(p => {
          const categoria = (p.categoria || '').toLowerCase();
          return categoria === 'sapatos';
        });
        
        return produtosFiltrados;
      },
    }),
    
    // Endpoint para buscar catálogo de tamanhos por categoria
    getTamanhosPorCategoria: builder.query<string[], string>({
      query: (categoria) => `/produtos/categoria/${categoria}/tamanhos/catalogo`,
      transformResponse: (response: { dados?: string[] } | string[]) => {
        if (Array.isArray(response)) return response;
        return response.dados || [];
      },
    }),
    // Endpoint para filtrar produtos por categoria e tamanho
    getProdutosPorCategoriaETamanho: builder.query<Produto[], { categoria: string; tamanho: string }>({
      query: ({ categoria, tamanho }) => `/produtos/categoria/${categoria}/tamanho/${tamanho}?tamanho=100`,
      transformResponse: (response: { dados: ProdutoRaw[] }) => transformProdutos(response.dados),
    }),
    
    // Endpoint para filtrar produtos por dimensão
    getProdutosPorDimensao: builder.query<Produto[], string>({
      query: (dimensao) => `/produtos/dimensao/${dimensao}?tamanho=100`,
      transformResponse: (response: { dados: ProdutoRaw[] }) => transformProdutos(response.dados),
    }),

    // Endpoint específico para filtrar BOLSAS por dimensão
    getBolsasPorDimensao: builder.query<Produto[], string>({
      query: (dimensao) => `/produtos/dimensao/${dimensao}?tamanho=100`,
      transformResponse: (response: { dados: ProdutoRaw[] }) => {
        const produtos = transformProdutos(response.dados);
        
        // Filtro simples: apenas produtos com categoria 'bolsas'
        const produtosFiltrados = produtos.filter(p => {
          const categoria = (p.categoria || '').toLowerCase();
          return categoria === 'bolsas';
        });
        
        return produtosFiltrados;
      },
    }),
    
    // Endpoint para filtrar produtos por categoria e dimensão
    getProdutosPorCategoriaEDimensao: builder.query<Produto[], { categoria: string; dimensao: string }>({
      query: ({ categoria, dimensao }) => `/produtos/categoria/${categoria}/dimensao/${dimensao}?tamanho=100`,
      transformResponse: (response: { dados: ProdutoRaw[] }) => transformProdutos(response.dados),
    }),
    
    getTamanhosProduto: builder.query<string[], number>({
      query: (produtoId) => `/produtos/${produtoId}/tamanhos`,
      transformResponse: (response: { dados: string[] }) => response.dados,
    }),
    
    // Novos endpoints para estoque
    getEstoqueProduto: builder.query<ProdutoTamanho[], number>({
      query: (produtoId) => `/produtos/${produtoId}/estoque`,
      transformResponse: (response: { dados: ProdutoTamanho[] }) => response.dados,
    }),
    
    // Endpoint para buscar produto individual (mais eficiente para páginas de detalhes)
    getProdutoById: builder.query<Produto, number>({
      query: (id) => `/produtos/${id}`,
      transformResponse: (response: { dados: ProdutoRaw }) => {
        const produto = response.dados;
        return {
          ...produto,
          imagens: parseStringArray(produto.imagens),
          destaques: parseStringArray(produto.destaques),
          modelo: parseObject(produto.modelo)
        };
      },
    }),
  }),
});

export const {
  useGetBolsasQuery,
  useGetRoupasQuery,
  useGetSapatosQuery,
  useGetTamanhosPorCategoriaQuery,
  useGetProdutosPorCategoriaETamanhoQuery,
  useGetProdutosPorDimensaoQuery,
  useGetBolsasPorDimensaoQuery,
  useGetProdutosPorCategoriaEDimensaoQuery,
  useGetTamanhosProdutoQuery,
  useGetEstoqueProdutoQuery,
  useGetProdutoByIdQuery,
} = productsApi;
