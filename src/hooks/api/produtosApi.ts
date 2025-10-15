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

console.log('[produtosApi] API Base URL:', API_BASE_URL);

export const produtosApi = createApi({
  reducerPath: 'produtosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Produto', 'Tamanho', 'Estoque'],
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
        
        return `/produtos?${params.toString()}`;
      },
      providesTags: ['Produto'],
    }),

    // Buscar produto por ID
    buscarProdutoPorId: builder.query<RespostaProdutoDTO<ProdutoDTO>, number>({
      query: (id) => `/produtos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Produto', id }],
    }),

    // Listar produtos por categoria
    listarProdutosPorCategoria: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { categoria: string; pagina?: number; tamanho?: number }
    >({
      query: ({ categoria, pagina = 0, tamanho = 15 }) => {
        const params = new URLSearchParams({
          pagina: pagina.toString(),
          tamanho: tamanho.toString(),
        });
        
        return `/produtos/categoria/${categoria}?${params.toString()}`;
      },
      providesTags: ['Produto'],
    }),

    // Atalhos para categorias específicas
    listarBolsas: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/produtos/categoria/bolsas?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    listarRoupas: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/produtos/categoria/roupas?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    listarSapatos: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { pagina?: number; tamanho?: number }
    >({
      query: ({ pagina = 0, tamanho = 15 }) => 
        `/produtos/categoria/sapatos?pagina=${pagina}&tamanho=${tamanho}`,
      providesTags: ['Produto'],
    }),

    // Buscar produtos por autor
    buscarProdutosPorAutor: builder.query<RespostaProdutoDTO<ProdutoDTO[]>, string>({
      query: (autor) => `/produtos/autor/${encodeURIComponent(autor)}`,
      providesTags: ['Produto'],
    }),

    // Busca global em todos os campos
    buscarProdutosGlobal: builder.query<
      RespostaProdutoDTO<ProdutoDTO[]>, 
      { termo: string; pagina?: number; tamanho?: number }
    >({
      query: ({ termo, pagina = 0, tamanho = 20 }) => {
        const params = new URLSearchParams({
          busca: termo,
          pagina: pagina.toString(),
          tamanho: tamanho.toString(),
        });
        return `/produtos/buscar?${params.toString()}`;
      },
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

    // Listar tamanhos de um produto (apenas etiquetas)
    listarTamanhosProduto: builder.query<RespostaProdutoDTO<string[]>, number>({
      query: (id) => `/tamanhos/produtos/${id}/tamanhos`,
      providesTags: (result, error, id) => [{ type: 'Tamanho', id }],
    }),

    // Listar estoque de um produto (tamanhos com quantidade)
    listarEstoqueProduto: builder.query<RespostaProdutoDTO<ProdutoTamanhoDTO[]>, number>({
      query: (id) => `/estoque/produtos/${id}/estoque`,
      providesTags: (result, error, id) => [{ type: 'Estoque', id }],
    }),

    // Substituir tamanhos de um produto
    substituirTamanhosProduto: builder.mutation<
      RespostaProdutoDTO<TamanhoDTO[]>,
      { id: number; tamanhos: ProdutoTamanhoDTO[] }
    >({
      query: ({ id, tamanhos }) => ({
        url: `/tamanhos/produtos/${id}/tamanhos`,
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
        url: `/tamanhos/produtos/${id}/tamanhos`,
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
        url: `/tamanhos/produtos/${id}/tamanhos/${encodeURIComponent(etiqueta)}`,
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
  useBuscarProdutosGlobalQuery,
  useContarProdutosPorCategoriaQuery,
  useListarTamanhosProdutoQuery,
  useListarEstoqueProdutoQuery,
  
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
  useLazyBuscarProdutosGlobalQuery,
} = produtosApi;