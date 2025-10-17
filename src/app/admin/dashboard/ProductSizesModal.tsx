'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { ProdutoDTO } from '@/hooks/api/types';
import {
  useListarTamanhosGerenciarQuery,
  useSubstituirTamanhosGerenciarMutation,
  useAdicionarTamanhosGerenciarMutation,
  useRemoverTamanhoGerenciarMutation,
  useListarProdutosPorPadraoQuery,
} from '@/hooks/api/produtosApi';
import Toast from './Toast';

type SizeStandard = 'usa' | 'br' | 'sapatos';

interface ProductSizesModalProps {
  product: ProdutoDTO;
  onClose: () => void;
}

// Função para obter tamanhos por padrão
const getSizesByStandard = (standard: SizeStandard): string[] => {
  const SIZES_MAP: Record<SizeStandard, string[]> = {
    usa: ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    br: ['PP', 'P', 'M', 'G', 'XG', 'G1', 'G2'],
    sapatos: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
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
  const { data: produtosSapatos } = useListarProdutosPorPadraoQuery('sapatos');
  
  // Combinar todos os resultados
  const todosProdutosComPadrao = [
    ...(produtosUSA?.dados || []),
    ...(produtosBR?.dados || []),
    ...(produtosSapatos?.dados || []),
  ];
  
  // Encontrar o padrão do produto atual
  const padraoAtual = todosProdutosComPadrao.find(p => p.id === product.id)?.padrao;

  // Atualizar padrão quando encontrado
  useEffect(() => {
    if (padraoAtual && ['usa', 'br', 'sapatos'].includes(padraoAtual)) {
      setPadrao(padraoAtual as SizeStandard);
      setCatalogoCompleto(getSizesByStandard(padraoAtual as SizeStandard));
    }
  }, [padraoAtual]);

  // Buscar tamanhos do produto no backend
  const {
    data: tamanhosAtuaisData,
    isLoading: isLoadingAtuais,
    error: errorTamanhos,
    refetch: refetchTamanhos,
  } = useListarTamanhosGerenciarQuery(product.id || 0, {
    skip: !product.id,
  });

  // Mutations
  const [substituirTamanhos, { isLoading: isSubstituindo }] = useSubstituirTamanhosGerenciarMutation();
  const [adicionarTamanhos, { isLoading: isAdicionando }] = useAdicionarTamanhosGerenciarMutation();
  const [removerTamanho, { isLoading: isRemovendo }] = useRemoverTamanhoGerenciarMutation();

  // Se erro 400, considera que não tem tamanhos (lista vazia)
  const tamanhosAtuais = tamanhosAtuaisData?.dados || [];
  const isLoading = isLoadingAtuais || isSubstituindo || isAdicionando || isRemovendo;

  // Inicializar tamanhos selecionados
  useEffect(() => {
    if (tamanhosAtuais.length > 0) {
      setSelectedSizes(new Set(tamanhosAtuais));
    }
  }, [tamanhosAtuais]);

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
      const etiquetas = Array.from(selectedSizes);
      
      await substituirTamanhos({
        id: product.id,
        etiquetas,
      }).unwrap();

      await refetchTamanhos();

      setToast({ message: 'Tamanhos atualizados com sucesso!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setToast({ message: 'Erro ao atualizar tamanhos', type: 'error' });
    }
  };

  const handleRemoveSize = async (etiqueta: string) => {
    if (!product.id) return;

    try {
      await removerTamanho({
        id: product.id,
        etiqueta,
      }).unwrap();

      const newSelected = new Set(selectedSizes);
      newSelected.delete(etiqueta);
      setSelectedSizes(newSelected);

      setToast({ message: `Tamanho ${etiqueta} removido com sucesso!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Erro ao remover tamanho', type: 'error' });
    }
  };

  const getPadraoLabel = () => {
    if (!padrao) return '';
    switch (padrao) {
      case 'usa': return '🇺🇸 USA';
      case 'br': return '🇧🇷 Brasil';
      case 'sapatos': return '👠 Sapatos';
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
