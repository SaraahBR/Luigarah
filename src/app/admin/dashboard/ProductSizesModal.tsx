'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiX, FiTrash2, FiCheck } from 'react-icons/fi';
import { ProdutoDTO } from '@/hooks/api/types';
import {
  useListarTamanhosGerenciarQuery,
  useSubstituirTamanhosGerenciarMutation,
  useListarProdutosPorPadraoQuery,
} from '@/hooks/api/produtosApi';
import Toast from './Toast';

type SizeStandard = 'usa' | 'br';

interface ProductSizesModalProps {
  product: ProdutoDTO;
  onClose: () => void;
}

// Função para obter tamanhos por padrão e categoria
const getSizesByStandard = (standard: SizeStandard, categoria?: string): string[] => {
  // Para sapatos, sempre usar numeração
  if (categoria?.toLowerCase() === 'sapatos') {
    return ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  }
  
  // Para roupas e bolsas
  const SIZES_MAP: Record<SizeStandard, string[]> = {
    usa: ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    br: ['PP', 'P', 'M', 'G', 'XG', 'G1', 'G2'],
  };
  return SIZES_MAP[standard] || [];
};

export default function ProductSizesModal({ product, onClose }: ProductSizesModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [padrao, setPadrao] = useState<SizeStandard | null>(null);
  const [catalogoCompleto, setCatalogoCompleto] = useState<string[]>([]);

  // Buscar produtos em cada categoria de padrão
  const { data: produtosUSA } = useListarProdutosPorPadraoQuery('usa');
  const { data: produtosBR } = useListarProdutosPorPadraoQuery('br');
  
  // Combinar todos os resultados
  const todosProdutosComPadrao = [
    ...(produtosUSA?.dados || []),
    ...(produtosBR?.dados || []),
  ];
  
  // Encontrar o padrão do produto atual
  const padraoAtual = todosProdutosComPadrao.find(p => p.id === product.id)?.padrao;

  // Atualizar padrão quando encontrado
  useEffect(() => {
    console.log(' [ProductSizesModal] Verificando padrão:', {
      produtoId: product.id,
      categoria: product.categoria,
      padraoAtual: padraoAtual,
      todosProdutosComPadrao: todosProdutosComPadrao.length
    });
    
    if (padraoAtual && ['usa', 'br'].includes(padraoAtual)) {
      const novoPadrao = padraoAtual as SizeStandard;
      setPadrao(novoPadrao);
      // Passar a categoria para obter os tamanhos corretos
      setCatalogoCompleto(getSizesByStandard(novoPadrao, product.categoria));
      console.log(' [ProductSizesModal] Padrão definido:', novoPadrao, 'Categoria:', product.categoria);
    } else {
      console.warn(' [ProductSizesModal] Produto sem padrão de tamanhos definido!');
    }
  }, [padraoAtual, product.id, product.categoria, todosProdutosComPadrao.length]);

  // Buscar tamanhos do produto no backend
  const {
    data: tamanhosAtuaisData,
    isLoading: isLoadingAtuais,
    refetch: refetchTamanhos,
  } = useListarTamanhosGerenciarQuery(product.id || 0, {
    skip: !product.id,
  });

  // Mutations
  const [substituirTamanhos, { isLoading: isSubstituindo }] = useSubstituirTamanhosGerenciarMutation();

  // Se erro 400, considera que não tem tamanhos (lista vazia)
  const tamanhosAtuais = useMemo(() => tamanhosAtuaisData?.dados || [], [tamanhosAtuaisData?.dados]);
  const isLoading = isLoadingAtuais || isSubstituindo;

  // Inicializar tamanhos selecionados
  useEffect(() => {
    if (tamanhosAtuais.length > 0) {
      setSelectedSizes(new Set(tamanhosAtuais));
    }
  }, [tamanhosAtuais.length, tamanhosAtuais]);

  const handleToggleSize = (size: string) => {
    const newSelected = new Set(selectedSizes);
    if (newSelected.has(size)) {
      newSelected.delete(size);
    } else {
      newSelected.add(size);
    }
    setSelectedSizes(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedSizes(new Set(catalogoCompleto));
  };

  const handleClearAll = () => {
    setSelectedSizes(new Set());
  };

  const handleSave = async () => {
    if (!product.id) return;

    try {
      // Ordenar etiquetas antes de enviar
      const etiquetas = Array.from(selectedSizes).sort((a, b) => {
        // Para números (sapatos), ordenar numericamente
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        // Para letras (usa, br), ordenar pela ordem do catálogo
        const indexA = catalogoCompleto.indexOf(a);
        const indexB = catalogoCompleto.indexOf(b);
        return indexA - indexB;
      });
      
      console.log(' [ProductSizesModal] Enviando dados:', {
        produtoId: product.id,
        categoria: product.categoria,
        padrao: padrao,
        etiquetas: etiquetas,
        quantidade: etiquetas.length,
        etiquetasOrdenadas: true
      });
      
      const resultado = await substituirTamanhos({
        id: product.id,
        etiquetas,
      }).unwrap();

      console.log(' [ProductSizesModal] Sucesso:', resultado);

      await refetchTamanhos();

      setToast({ message: 'Tamanhos atualizados com sucesso!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (error: unknown) {
      console.error(' [ProductSizesModal] Erro detalhado:', error);
      console.error(' [ProductSizesModal] Erro JSON:', JSON.stringify(error, null, 2));
      
      let mensagemErro = 'Erro ao atualizar tamanhos';
      
      if (error && typeof error === 'object') {
        // Tentar extrair mensagem de várias estruturas possíveis
        const err = error as {
          data?: {
            mensagem?: string;
            erro?: string;
            message?: string;
            error?: string;
            detalhes?: string;
          };
          status?: number;
          originalStatus?: number;
        };
        
        console.log(' [ProductSizesModal] Status do erro:', err.status || err.originalStatus);
        console.log(' [ProductSizesModal] Data do erro:', err.data);
        
        if (err.data) {
          mensagemErro = 
            err.data.mensagem || 
            err.data.erro || 
            err.data.message || 
            err.data.error ||
            err.data.detalhes ||
            mensagemErro;
        }
        
        // Se for erro 400, adicionar contexto
        if (err.status === 400 || err.originalStatus === 400) {
          mensagemErro = `Backend rejeitou (400): ${mensagemErro}`;
        }
      }
      
      setToast({ message: mensagemErro, type: 'error' });
    }
  };

  const getPadraoLabel = () => {
    if (!padrao) return '';
    switch (padrao) {
      case 'usa': return '🇺🇸 USA';
      case 'br': return '🇧🇷 Brasil';
    }
  };

  // Verificar se precisa definir padrão
  if (!padrao) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tamanhos</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-center">
              Por favor, defina primeiro o <strong>Padrão de Tamanhos</strong> para este produto.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Tamanhos</h2>
              <p className="text-sm text-gray-600 mt-1">{product.titulo}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  {getPadraoLabel()}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedSizes.size} de {catalogoCompleto.length} selecionados
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && catalogoCompleto.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <>
                {/* Ações rápidas */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      Selecionar Todos
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Limpar Todos
                    </button>
                  </div>
                </div>

                {/* Grid de tamanhos */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {catalogoCompleto.map((size) => {
                    const isSelected = selectedSizes.has(size);
                    
                    return (
                      <div key={size} className="relative">
                        <button
                          onClick={() => handleToggleSize(size)}
                          disabled={isLoading}
                          className={`
                            w-full aspect-square rounded-lg border-2 transition-all font-semibold text-sm
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isSelected 
                              ? 'bg-amber-600 border-amber-600 text-white shadow-lg scale-105' 
                              : 'bg-white border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                            }
                          `}
                        >
                          {size}
                        </button>
                        
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {catalogoCompleto.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Nenhum tamanho disponível para este padrão. 
                      <br />
                      Configure o padrão de tamanhos primeiro.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Salvar Tamanhos
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
