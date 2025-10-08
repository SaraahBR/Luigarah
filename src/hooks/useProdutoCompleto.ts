import { useGetProdutoByIdQuery, useGetTamanhosProdutoQuery, useGetEstoqueProdutoQuery } from '@/store/productsApi';

export function useProdutoCompleto(produtoId: number) {
  const {
    data: produto,
    isLoading: produtoLoading,
    error: produtoError
  } = useGetProdutoByIdQuery(produtoId);

  const {
    data: tamanhos = [],
    isLoading: tamanhosLoading,
    error: tamanhosError
  } = useGetTamanhosProdutoQuery(produtoId);

  const {
    data: estoque = [],
    isLoading: estoqueLoading,
    error: estoqueError
  } = useGetEstoqueProdutoQuery(produtoId);

  // Combina tamanhos com estoque do backend
  const tamanhosComEstoque = tamanhos.map(etiqueta => {
    const itemEstoque = estoque.find(e => e.etiqueta === etiqueta);
    return {
      etiqueta,
      qtdEstoque: itemEstoque?.qtdEstoque || 0
    };
  });

  return {
    produto,
    tamanhos,
    estoque,
    tamanhosComEstoque,
    isLoading: produtoLoading || tamanhosLoading || estoqueLoading,
    error: produtoError || tamanhosError || estoqueError,
    hasStock: tamanhosComEstoque.some(t => t.qtdEstoque > 0),
    availableSizes: tamanhosComEstoque.filter(t => t.qtdEstoque > 0).map(t => t.etiqueta)
  };
}