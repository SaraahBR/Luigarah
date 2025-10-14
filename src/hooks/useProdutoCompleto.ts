import { useBuscarProdutoPorIdQuery, useListarEstoqueProdutoQuery } from '@/hooks/api/produtosApi';

export function useProdutoCompleto(produtoId: number) {
  const {
    data: produtoResponse,
    isLoading: produtoLoading,
    error: produtoError
  } = useBuscarProdutoPorIdQuery(produtoId);

  // A resposta da API é um RespostaProdutoDTO<ProdutoDTO>
  const produto = produtoResponse?.dados;

  const {
    data: estoqueResponse,
    isLoading: estoqueLoading,
    error: estoqueError
  } = useListarEstoqueProdutoQuery(produtoId);

  // A resposta da API é um RespostaProdutoDTO<ProdutoTamanhoDTO[]>
  // ProdutoTamanhoDTO = { etiqueta: string, qtdEstoque: number }
  const estoqueDados = estoqueResponse?.dados || [];

  // Transforma ProdutoTamanhoDTO em TamanhoDTO (adiciona categoria)
  const tamanhosComEstoque = estoqueDados.map(item => ({
    etiqueta: item.etiqueta,
    categoria: produto?.categoria || '',
    qtdEstoque: item.qtdEstoque
  }));

  // Verifica se é bolsa (categoria = "bolsas")
  const isBolsa = produto?.categoria?.toLowerCase() === 'bolsas';

  // Para bolsas, busca o estoque sem etiqueta (etiqueta vazia ou "unico")
  const estoqueBolsa = isBolsa 
    ? tamanhosComEstoque.find(t => !t.etiqueta || t.etiqueta === '' || t.etiqueta === 'unico')?.qtdEstoque || 0 
    : 0;

  // Define se há estoque disponível
  const hasStock = isBolsa 
    ? estoqueBolsa > 0 
    : tamanhosComEstoque.some(t => t.qtdEstoque > 0);

  // Extrair apenas as etiquetas para compatibilidade
  const tamanhos = tamanhosComEstoque.map(t => t.etiqueta);

  return {
    produto,
    tamanhos,
    estoque: tamanhosComEstoque, // Para compatibilidade com código antigo
    tamanhosComEstoque,
    estoqueBolsa,
    isBolsa,
    isLoading: produtoLoading || estoqueLoading,
    error: produtoError || estoqueError,
    hasStock,
    availableSizes: isBolsa ? [] : tamanhosComEstoque.filter(t => t.qtdEstoque > 0).map(t => t.etiqueta)
  };
}