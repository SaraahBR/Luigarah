import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProdutoDTO, RespostaProdutoDTO } from './types';

// Base URL do backend Spring Boot - COM /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  endpoints: (builder) => ({
    
    // Buscar produtos COM identidade (qualquer identidade)
    buscarProdutosComIdentidade: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>,
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => {
        const params = new URLSearchParams({
          pagina: pagina.toString(),
          tamanho: tamanho.toString(),
        });
        return `/com-identidade?${params.toString()}`;
      },
      providesTags: ['Identidade'],
    }),

    // Buscar produtos por código de identidade
    buscarProdutosPorIdentidade: builder.query<
      ProdutoDTO[],
      { codigo: string }
    >({
      query: ({ codigo }) => `/identidade/codigo/${codigo}`,
      transformResponse: (response: unknown) => {
        // A API retorna um array direto de produtos
        return Array.isArray(response) ? response : [];
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
  }),
});

// Export dos hooks gerados automaticamente
export const {
  useBuscarProdutosComIdentidadeQuery,
  useBuscarProdutosPorIdentidadeQuery,
  useBuscarProdutosPorIdentidadeIdQuery,
  useLazyBuscarProdutosPorIdentidadeQuery,
} = identidadesApi;
