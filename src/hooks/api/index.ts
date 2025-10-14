// Exportar tudo da API de produtos
export * from './produtosApi';
export * from './identidadesApi';
export * from './useProdutos';
export * from './types';
export * from './config';

// Re-exports principais da API de produtos
export { 
  produtosApi,
  // Hooks RTK Query
  useListarProdutosQuery,
  useBuscarProdutoPorIdQuery,
  useListarBolsasQuery,
  useListarRoupasQuery,
  useListarSapatosQuery,
} from './produtosApi';

// Re-exports da API de identidades
export {
  identidadesApi,
  useBuscarProdutosPorIdentidadeQuery,
  useBuscarProdutosPorIdentidadeIdQuery,
  useBuscarProdutosComIdentidadeQuery,
} from './identidadesApi';