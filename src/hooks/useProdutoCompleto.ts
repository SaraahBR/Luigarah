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

  // Verifica se é bolsa (categoria = "bolsas")
  const isBolsa = produto?.categoria?.toLowerCase() === 'bolsas';

  // Para bolsas: estoque está vinculado ao produto (etiqueta = null)
  // Para roupas/sapatos: estoque está vinculado aos tamanhos
  const tamanhosComEstoque = isBolsa 
    ? [] // Bolsas não têm tamanhos
    : tamanhos.map(etiqueta => {
        const itemEstoque = estoque.find(e => e.etiqueta === etiqueta);
        return {
          etiqueta,
          qtdEstoque: itemEstoque?.qtdEstoque || 0
        };
      });

  // Para bolsas, busca o estoque sem etiqueta (etiqueta = null)
  const estoqueBolsa = isBolsa ? estoque.find(e => e.etiqueta === null)?.qtdEstoque || 0 : 0;

  // Define se há estoque disponível
  const hasStock = isBolsa 
    ? estoqueBolsa > 0 
    : tamanhosComEstoque.some(t => t.qtdEstoque > 0);

  return {
    produto,
    tamanhos,
    estoque,
    tamanhosComEstoque,
    estoqueBolsa, // Novo: estoque específico para bolsas
    isBolsa, // Novo: indica se é uma bolsa
    isLoading: produtoLoading || tamanhosLoading || estoqueLoading,
    error: produtoError || tamanhosError || estoqueError,
    hasStock,
    availableSizes: isBolsa ? [] : tamanhosComEstoque.filter(t => t.qtdEstoque > 0).map(t => t.etiqueta)
  };
}