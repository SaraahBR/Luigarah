// Exportar tudo da API de produtos
export * from './produtosApi';
export * from './useProdutos';
export * from './types';
export * from './config';

// Re-exports principais da API
export { 
  produtosApi,
  // Hooks RTK Query
  useListarProdutosQuery,
  useBuscarProdutoPorIdQuery,
  useListarBolsasQuery,
  useListarRoupasQuery,
  useListarSapatosQuery,
} from './produtosApi';