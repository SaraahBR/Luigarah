import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  ProdutoDTO, 
  RespostaProdutoDTO, 
  FiltrosProdutos, 
  TamanhoDTO, 
  ProdutoTamanhoDTO 
} from './types';

// Base URL do seu backend Spring Boot
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com';

export const produtosApi = createApi({
  reducerPath: 'produtosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/produtos`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Produto', 'Tamanho'],
  endpoints: (builder) => ({
    
    // ===== PRODUTOS =====
    
    // Listar todos os produtos com filtros
    listarProdutos: builder.query<RespostaProdutoDTO<ProdutoDTO[]>, FiltrosProdutos>({
      query: (filtros = {}) => {
        const params = new URLSearchParams();
        
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        
        return `?${params.toString()}`;
      },
      providesTags: ['Produto'],
    }),

    // Buscar produto por ID
    buscarProdutoPorId: builder.query<RespostaProdutoDTO<ProdutoDTO>, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Produto', id }],
    }),

    // Listar produtos por categoria
    listarProdutosPorCategoria: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { categoria: string; pagina?: number; tamanho?: number; subtitulo?: string }
    >({
      query: ({ categoria, pagina = 0, tamanho = 15, subtitulo }) => {
        const params = new URLSearchParams({
          pagina: pagina.toString(),
          tamanho: tamanho.toString(),
        });
        
        if (subtitulo) {
          params.append('subtitulo', subtitulo);
        }
        
        return `/categoria/${categoria}?${params.toString()}`;
      },
      providesTags: ['Produto'],
    }),

    // Atalhos para categorias específicas
    listarBolsas: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/bolsas?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    listarRoupas: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/roupas?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    listarSapatos: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/sapatos?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    // Buscar produtos por autor
    buscarProdutosPorAutor: builder.query<RespostaProdutoDTO<ProdutoDTO[]>, string>({
      query: (autor) => `/autor/${encodeURIComponent(autor)}`,
      providesTags: ['Produto'],
    }),

    // Contar produtos por categoria
    contarProdutosPorCategoria: builder.query<RespostaProdutoDTO<number>, string>({
      query: (categoria) => `/categoria/${categoria}/contar`,
      providesTags: ['Produto'],
    }),

    // ===== MUTATIONS (CREATE, UPDATE, DELETE) =====

    // Criar produto
    criarProduto: builder.mutation<RespostaProdutoDTO<ProdutoDTO>, Partial<ProdutoDTO>>({
      query: (produto) => ({
        url: '',
        method: 'POST',
        body: produto,
      }),
      invalidatesTags: ['Produto'],
    }),

    // Atualizar produto
    atualizarProduto: builder.mutation<
      RespostaProdutoDTO<ProdutoDTO>, 
      { id: number; produto: Partial<ProdutoDTO> }
    >({
      query: ({ id, produto }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: produto,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Produto', id },
        'Produto',
      ],
    }),

    // Deletar produto
    deletarProduto: builder.mutation<RespostaProdutoDTO<null>, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Produto', id },
        'Produto',
      ],
    }),

    // ===== TAMANHOS =====

    // Listar tamanhos de um produto
    listarTamanhosProduto: builder.query<RespostaProdutoDTO<TamanhoDTO[]>, number>({
      query: (id) => `/${id}/tamanhos`,
      providesTags: (result, error, id) => [{ type: 'Tamanho', id }],
    }),

    // Substituir tamanhos de um produto
    substituirTamanhosProduto: builder.mutation<
      RespostaProdutoDTO<TamanhoDTO[]>,
      { id: number; tamanhos: ProdutoTamanhoDTO[] }
    >({
      query: ({ id, tamanhos }) => ({
        url: `/${id}/tamanhos`,
        method: 'PUT',
        body: tamanhos,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tamanho', id },
        { type: 'Produto', id },
      ],
    }),

    // Upsert tamanhos de um produto
    upsertTamanhosProduto: builder.mutation<
      RespostaProdutoDTO<TamanhoDTO[]>,
      { id: number; tamanhos: ProdutoTamanhoDTO[] }
    >({
      query: ({ id, tamanhos }) => ({
        url: `/${id}/tamanhos`,
        method: 'PATCH',
        body: tamanhos,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tamanho', id },
        { type: 'Produto', id },
      ],
    }),

    // Remover tamanho de um produto
    removerTamanhoProduto: builder.mutation<
      RespostaProdutoDTO<null>,
      { id: number; etiqueta: string }
    >({
      query: ({ id, etiqueta }) => ({
        url: `/${id}/tamanhos/${encodeURIComponent(etiqueta)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tamanho', id },
        { type: 'Produto', id },
      ],
    }),
  }),
});

// Export dos hooks gerados automaticamente
export const {
  // Queries
  useListarProdutosQuery,
  useBuscarProdutoPorIdQuery,
  useListarProdutosPorCategoriaQuery,
  useListarBolsasQuery,
  useListarRoupasQuery,
  useListarSapatosQuery,
  useBuscarProdutosPorAutorQuery,
  useContarProdutosPorCategoriaQuery,
  useListarTamanhosProdutoQuery,
  
  // Mutations
  useCriarProdutoMutation,
  useAtualizarProdutoMutation,
  useDeletarProdutoMutation,
  useSubstituirTamanhosProdutoMutation,
  useUpsertTamanhosProdutoMutation,
  useRemoverTamanhoProdutoMutation,
  
  // Lazy queries (para chamar manualmente)
  useLazyListarProdutosQuery,
  useLazyBuscarProdutoPorIdQuery,
} = produtosApi;