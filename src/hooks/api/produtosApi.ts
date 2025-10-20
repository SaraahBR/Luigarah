import { createApi, fetchBaseQuery, BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { 
  ProdutoDTO, 
  RespostaProdutoDTO, 
  FiltrosProdutos, 
  TamanhoDTO, 
  ProdutoTamanhoDTO,
  PadraoItemDTO
} from './types';

// Base URL do seu backend Spring Boot
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers) => {
    // Pega o token do localStorage (mesmo formato usado pelo httpClient)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('luigara:auth:token');
        if (raw) {
          const authToken = JSON.parse(raw) as { token: string; tipo: string };
          headers.set('Authorization', `${authToken.tipo} ${authToken.token}`);
        }
      } catch (error) {
        console.error('[produtosApi] Erro ao recuperar token:', error);
      }
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query customizado que suprime erros 400 de endpoints de tamanhos
const baseQueryWithSilentErrors = async (
  args: string | { url: string; [key: string]: unknown },
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Se for erro 400 em endpoints de tamanhos/estoque, não exibe no console
  if (result.error && result.error.status === 400) {
    const url = typeof args === 'string' ? args : args.url;
    if (url && (url.includes('/tamanhos') || url.includes('/estoque'))) {
      // Suprime o erro no console - produto simplesmente não tem tamanhos ainda
      return { data: { dados: [] } };
    }
  }
  
  return result;
};

export const produtosApi = createApi({
  reducerPath: 'produtosApi',
  baseQuery: baseQueryWithSilentErrors,
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
        url: '/produtos',
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
        url: `/produtos/${id}`,
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
        url: `/produtos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Produto', id },
        'Produto',
      ],
    }),

    // Atribuir identidade a um produto
    atribuirIdentidade: builder.mutation<
      RespostaProdutoDTO<ProdutoDTO>,
  { produtoId: number; identidadeId: number }
    >({
    query: ({ produtoId, identidadeId }) => ({
  url: `/produtos/${produtoId}/identidade`,
  method: 'PUT',
  body: { identidadeId },
      }),
      invalidatesTags: (result, error, { produtoId }) => [
        { type: 'Produto', id: produtoId },
        'Produto',
      ],
    }),

    // Remover identidade de um produto
    removerIdentidade: builder.mutation<RespostaProdutoDTO<null>, number>({
      query: (produtoId) => ({
        url: `/produtos/${produtoId}/identidade`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, produtoId) => [
        { type: 'Produto', id: produtoId },
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

    // ===== ESTOQUE =====

    // Listar estoque do produto
    listarEstoque: builder.query<
      RespostaProdutoDTO<ProdutoTamanhoDTO[]>,
      number
    >({
      query: (id) => `/estoque/produtos/${id}/estoque`,
      providesTags: (result, error, id) => [{ type: 'Estoque', id }],
    }),

    // Atualizar estoque em massa
    atualizarEstoqueEmMassa: builder.mutation<
      RespostaProdutoDTO<ProdutoTamanhoDTO[]>,
      { id: number; itens: ProdutoTamanhoDTO[] }
    >({
      query: ({ id, itens }) => ({
        url: `/estoque/produtos/${id}/estoque`,
        method: 'PUT',
        body: itens,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estoque', id },
        { type: 'Produto', id },
      ],
    }),

    // Atualizar estoque por etiqueta (roupas/sapatos)
    atualizarEstoquePorEtiqueta: builder.mutation<
      RespostaProdutoDTO<ProdutoTamanhoDTO[]>,
      { id: number; etiqueta: string; modo: 'set' | 'inc' | 'dec'; valor: number }
    >({
      query: ({ id, etiqueta, modo, valor }) => ({
        url: `/estoque/produtos/${id}/estoque/${encodeURIComponent(etiqueta)}?modo=${modo}&valor=${valor}`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estoque', id },
        { type: 'Produto', id },
      ],
    }),

    // Atualizar estoque sem tamanho (bolsas)
    atualizarEstoqueSemTamanho: builder.mutation<
      RespostaProdutoDTO<ProdutoTamanhoDTO[]>,
      { id: number; modo: 'set' | 'inc' | 'dec'; valor: number }
    >({
      query: ({ id, modo, valor }) => ({
        url: `/estoque/produtos/${id}/estoque?modo=${modo}&valor=${valor}`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Estoque', id },
        { type: 'Produto', id },
      ],
    }),

    // ===== PADRÃO DE TAMANHOS =====

    // Listar produtos por padrão (para verificar qual padrão está definido)
    listarProdutosPorPadrao: builder.query<
      RespostaProdutoDTO<PadraoItemDTO[]>,
      string | null
    >({
      query: (padrao) => ({
        url: `/padroes-tamanho/produtos`,
        params: padrao ? { padrao } : {},
      }),
      providesTags: ['Produto'],
    }),

    // Definir padrão de tamanhos de um produto
    definirPadraoProduto: builder.mutation<
      RespostaProdutoDTO<PadraoItemDTO>,
      { id: number; padrao: 'usa' | 'br' | 'sapatos' | null }
    >({
      query: ({ id, padrao }) => ({
        url: `/padroes-tamanho/produtos/${id}/padrao?padrao=${padrao}`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Produto', id },
        'Produto',
      ],
    }),

    // Limpar padrão de tamanhos de um produto
    limparPadraoProduto: builder.mutation<
      RespostaProdutoDTO<PadraoItemDTO>,
      number
    >({
      query: (id) => ({
        url: `/padroes-tamanho/produtos/${id}/padrao`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Produto', id },
        'Produto',
      ],
    }),

    // ===== TAMANHOS (Catálogo e Gestão) =====

    // Listar catálogo de tamanhos por categoria e padrão
    listarCatalogoPorCategoria: builder.query<
      RespostaProdutoDTO<string[]>,
      { categoria: string; padrao?: string }
    >({
      query: ({ categoria, padrao }) => {
        const params = new URLSearchParams({ categoria });
        if (padrao) params.append('padrao', padrao);
        return `/tamanhos?${params.toString()}`;
      },
    }),

    // Listar tamanhos de um produto (NOVO - gestão completa)
    listarTamanhosGerenciar: builder.query<
      RespostaProdutoDTO<string[]>,
      number
    >({
      query: (id) => `/tamanhos/produtos/${id}/tamanhos`,
      providesTags: (result, error, id) => [{ type: 'Tamanho', id }],
    }),

    // Substituir tamanhos do produto (PUT)
    substituirTamanhosGerenciar: builder.mutation<
      RespostaProdutoDTO<string[]>,
      { id: number; etiquetas: string[] }
    >({
      query: ({ id, etiquetas }) => ({
        url: `/tamanhos/produtos/${id}/tamanhos`,
        method: 'PUT',
        body: etiquetas,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tamanho', id },
        { type: 'Produto', id },
      ],
    }),

    // Adicionar tamanhos ao produto (PATCH)
    adicionarTamanhosGerenciar: builder.mutation<
      RespostaProdutoDTO<string[]>,
      { id: number; etiquetas: string[] }
    >({
      query: ({ id, etiquetas }) => ({
        url: `/tamanhos/produtos/${id}/tamanhos`,
        method: 'PATCH',
        body: etiquetas,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tamanho', id },
        { type: 'Produto', id },
      ],
    }),

    // Remover tamanho específico do produto (NOVO)
    removerTamanhoGerenciar: builder.mutation<
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
  useListarEstoqueQuery,
  useListarCatalogoPorCategoriaQuery,
  useListarTamanhosGerenciarQuery,
  useListarProdutosPorPadraoQuery,
  
  // Mutations
  useCriarProdutoMutation,
  useAtualizarProdutoMutation,
  useDeletarProdutoMutation,
  useAtribuirIdentidadeMutation,
  useRemoverIdentidadeMutation,
  useSubstituirTamanhosProdutoMutation,
  useUpsertTamanhosProdutoMutation,
  useRemoverTamanhoProdutoMutation,
  useAtualizarEstoqueEmMassaMutation,
  useAtualizarEstoquePorEtiquetaMutation,
  useAtualizarEstoqueSemTamanhoMutation,
  useDefinirPadraoProdutoMutation,
  useLimparPadraoProdutoMutation,
  useSubstituirTamanhosGerenciarMutation,
  useAdicionarTamanhosGerenciarMutation,
  useRemoverTamanhoGerenciarMutation,
  
  // Lazy queries (para chamar manualmente)
  useLazyListarProdutosQuery,
  useLazyBuscarProdutoPorIdQuery,
  useLazyBuscarProdutosGlobalQuery,
} = produtosApi;