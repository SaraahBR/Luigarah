import { useBuscarProdutoPorIdQuery, useListarEstoqueProdutoQuery } from '@/hooks/api/produtosApi';

export function useProdutoCompleto(produtoId: number) {
  console.log('[useProdutoCompleto] Buscando produto ID:', produtoId);
  
  const {
    data: produtoResponse,
    isLoading: produtoLoading,
    error: produtoError
  } = useBuscarProdutoPorIdQuery(produtoId);

  console.log('[useProdutoCompleto] Produto Response:', produtoResponse);
  console.log('[useProdutoCompleto] Produto Loading:', produtoLoading);
  console.log('[useProdutoCompleto] Produto Error:', produtoError);

  // A resposta da API é um RespostaProdutoDTO<ProdutoDTO>
  const produto = produtoResponse?.dados;

  const {
    data: estoqueResponse,
    isLoading: estoqueLoading,
    error: estoqueError
  } = useListarEstoqueProdutoQuery(produtoId, {
    // Se houver erro, não bloqueia a renderização do produto
    skip: !produtoId
  });

  console.log('[useProdutoCompleto] Estoque Response:', estoqueResponse);
  console.log('[useProdutoCompleto] Estoque Loading:', estoqueLoading);
  console.log('[useProdutoCompleto] Estoque Error:', estoqueError);

  // A resposta da API é um RespostaProdutoDTO<ProdutoTamanhoDTO[]>
  // ProdutoTamanhoDTO = { etiqueta: string, qtdEstoque: number }
  // Se houver erro no estoque, usa array vazio para não quebrar a UI
  const estoqueDados = estoqueResponse?.dados || [];

  // Se houver erro no endpoint de estoque, mostra warning mas continua
  if (estoqueError) {
    console.warn('[useProdutoCompleto] Erro ao buscar estoque (usando dados padrão):', estoqueError);
  }

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
    error: produtoError, // Retorna apenas erro do produto, não do estoque
    estoqueError, // Erro separado para estoque se necessário
    hasStock,
    availableSizes: isBolsa ? [] : tamanhosComEstoque.filter(t => t.qtdEstoque > 0).map(t => t.etiqueta)
  };
}