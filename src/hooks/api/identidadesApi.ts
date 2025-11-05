import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProdutoDTO, RespostaProdutoDTO } from './types';
import { getIdentityVariants } from '@/lib/identityUtils';

// URL base do backend Spring Boot - COM /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com';

export const identidadesApi = createApi({
  reducerPath: 'identidadesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/produtos`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Identidade'],
  // Cache mais agressivo para melhor performance
  keepUnusedDataFor: 300, // 5 minutos
  refetchOnMountOrArgChange: 300, // Só refaz query se dados tiverem mais de 5 minutos
  refetchOnFocus: false, // Não refaz query ao focar janela
  refetchOnReconnect: true, // Refaz query ao reconectar internet
  endpoints: (builder) => ({
    
    // Buscar produtos COM identidade (qualquer identidade)
    buscarProdutosComIdentidade: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>,
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 1000 }) => {
        const params = new URLSearchParams({
          pagina: pagina.toString(),
          tamanho: tamanho.toString(),
        });
        return `/com-identidade?${params.toString()}`;
      },
      providesTags: ['Identidade'],
    }),

    // Buscar produtos por código de identidade (com suporte a variantes)
    buscarProdutosPorIdentidade: builder.query<
      ProdutoDTO[],
      { codigo: string }
    >({
      async queryFn(args, _api, _extraOptions, baseQuery) {
        // Obtém todas as variantes da identidade
        const variants = getIdentityVariants(args.codigo);
        
        // Busca por todas as variantes em paralelo
        const promises = variants.map(variant =>
          baseQuery(`/identidade/codigo/${variant}`)
        );
        
        const results = await Promise.all(promises);
        
        // Combina todos os resultados e remove duplicatas por ID
        const allProducts = new Map<number, ProdutoDTO>();
        
        results.forEach(result => {
          if (result.data && Array.isArray(result.data)) {
            (result.data as ProdutoDTO[]).forEach(product => {
              if (product.id) {
                allProducts.set(product.id, product);
              }
            });
          }
        });
        
        return { data: Array.from(allProducts.values()) };
      },
      providesTags: ['Identidade'],
    }),

    // Buscar produtos por ID de identidade
    buscarProdutosPorIdentidadeId: builder.query<
      ProdutoDTO[],
      { identidadeId: number }
    >({
      query: ({ identidadeId }) => `/identidade/${identidadeId}`,
      transformResponse: (response: unknown) => {
        // A API retorna um array direto de produtos
        return Array.isArray(response) ? response : [];
      },
      providesTags: ['Identidade'],
    }),

    // Buscar produto com identidade populada por ID do produto
    // Usa o endpoint /com-identidade e busca o produto específico
    buscarProdutoComIdentidadePorId: builder.query<
      ProdutoDTO | null,
      number
    >({
      query: () => {
        const params = new URLSearchParams({
          pagina: '0',
          tamanho: '1000',
        });
        return `/com-identidade?${params.toString()}`;
      },
      transformResponse: (response: unknown, _meta, arg) => {
        let produtos: ProdutoDTO[] = [];
        
        if (Array.isArray(response)) {
          produtos = response;
        } else if (response && typeof response === 'object' && 'dados' in response) {
          const resposta = response as RespostaProdutoDTO<ProdutoDTO[]>;
          produtos = resposta.dados || [];
        }
        
        if (produtos.length > 0) {
          const produto = produtos.find(p => p.id === arg);
          return produto || null;
        }
        
        return null;
      },
      providesTags: ['Identidade'],
    }),
  }),
});

// Exportação dos hooks gerados automaticamente
export const {
  useBuscarProdutosComIdentidadeQuery,
  useBuscarProdutosPorIdentidadeQuery,
  useBuscarProdutosPorIdentidadeIdQuery,
  useBuscarProdutoComIdentidadePorIdQuery,
  useLazyBuscarProdutosPorIdentidadeQuery,
} = identidadesApi;
