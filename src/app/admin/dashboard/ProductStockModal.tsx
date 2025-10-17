'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShoppingBag, FiTag, FiPackage } from 'react-icons/fi';
import { ProdutoDTO, ProdutoTamanhoDTO } from '@/hooks/api/types';
import {
  useListarTamanhosGerenciarQuery,
  useListarEstoqueQuery,
  useAtualizarEstoqueEmMassaMutation,
  useAtualizarEstoquePorEtiquetaMutation,
  useAtualizarEstoqueSemTamanhoMutation,
} from '@/hooks/api/produtosApi';
import Toast from './Toast';

interface ProductStockModalProps {
  produto: ProdutoDTO;
  onClose: () => void;
}

export default function ProductStockModal({ produto, onClose }: ProductStockModalProps) {
  const [modo, setModo] = useState<'set' | 'inc' | 'dec'>('set');
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  const [singleStock, setSingleStock] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isBolsa = produto.categoria?.toLowerCase().includes('bolsa');

  // Buscar tamanhos do produto
  const { data: tamanhosData, isLoading: isLoadingTamanhos } = useListarTamanhosGerenciarQuery(
    produto.id || 0,
    { skip: !produto.id || isBolsa }
  );

  // Buscar estoque atual
  const { data: estoqueData, isLoading: isLoadingEstoque } = useListarEstoqueQuery(
    produto.id || 0,
    { skip: !produto.id }
  );

  const [atualizarEmMassa, { isLoading: isUpdatingBulk }] = useAtualizarEstoqueEmMassaMutation();
  const [atualizarPorEtiqueta, { isLoading: isUpdatingTag }] = useAtualizarEstoquePorEtiquetaMutation();
  const [atualizarSemTamanho, { isLoading: isUpdatingSingle }] = useAtualizarEstoqueSemTamanhoMutation();

  const tamanhosDoProduto = tamanhosData?.dados || [];
  const estoque = estoqueData?.dados || [];
  const isLoading = isLoadingTamanhos || isLoadingEstoque;

  // Inicializar valores do estoque
  useEffect(() => {
    if (estoque.length > 0) {
      if (isBolsa) {
        setSingleStock(estoque[0]?.qtdEstoque || 0);
      } else {
        const values: Record<string, number> = {};
        estoque.forEach((item: ProdutoTamanhoDTO) => {
          if (item.etiqueta) {
            values[item.etiqueta] = item.qtdEstoque || 0;
          }
        });
        setStockValues(values);
      }
    }
  }, [estoque, isBolsa]);

  // Verificar se o produto tem tamanhos definidos (para roupas/sapatos)
  const temTamanhos = tamanhosDoProduto.length > 0;

  // Se não é bolsa e não tem tamanhos, mostrar aviso
  if (!isBolsa && !temTamanhos && !isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Estoque</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-center mb-2">
              <strong>Defina os tamanhos primeiro!</strong>
            </p>
            <p className="text-yellow-700 text-sm text-center">
              Para gerenciar o estoque de roupas ou sapatos, você precisa primeiro:
            </p>
            <ol className="text-yellow-700 text-sm mt-2 ml-6 list-decimal text-left">
              <li>Definir o <strong>Padrão de Tamanhos</strong> (usa/br/sapatos)</li>
              <li>Selecionar os <strong>Tamanhos</strong> disponíveis</li>
            </ol>
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

  const handleUpdateSingleStock = async () => {
    if (!produto.id) return;
    
    try {
      await atualizarSemTamanho({
        id: produto.id,
        modo,
        valor: singleStock,
      }).unwrap();
      setToast({ message: 'Estoque atualizado com sucesso!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setToast({ message: 'Erro ao atualizar estoque', type: 'error' });
    }
  };

  const handleUpdateTagStock = async (etiqueta: string) => {
    if (!produto.id) return;
    
    try {
      const valor = stockValues[etiqueta] || 0;
      await atualizarPorEtiqueta({
        id: produto.id,
        etiqueta,
        modo,
        valor,
      }).unwrap();
      setToast({ message: `Estoque da etiqueta ${etiqueta} atualizado com sucesso!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Erro ao atualizar estoque', type: 'error' });
    }
  };

  const handleBulkUpdate = async () => {
    if (!produto.id) return;
    
    try {
      const itens: ProdutoTamanhoDTO[] = Object.entries(stockValues).map(([etiqueta, quantidade]) => ({
        etiqueta,
        qtdEstoque: quantidade,
      }));

      await atualizarEmMassa({
        id: produto.id,
        itens,
      }).unwrap();
      setToast({ message: 'Estoque atualizado em massa com sucesso!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setToast({ message: 'Erro ao atualizar estoque', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <FiPackage className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Estoque</h2>
              <p className="text-sm text-gray-600">{produto.titulo}</p>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <>
              {/* Modo de atualização */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de Atualização
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModo('set')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      modo === 'set'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Definir
                  </button>
                  <button
                    onClick={() => setModo('inc')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      modo === 'inc'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Incrementar
                  </button>
                  <button
                    onClick={() => setModo('dec')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      modo === 'dec'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Decrementar
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {modo === 'set' && 'Define o valor exato do estoque'}
                  {modo === 'inc' && 'Adiciona ao estoque atual'}
                  {modo === 'dec' && 'Subtrai do estoque atual'}
                </p>
              </div>

              {/* Estoque de bolsa (sem tamanhos) */}
              {isBolsa ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <FiShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Estoque de Bolsa</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade Disponível
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={singleStock}
                      onChange={(e) => setSingleStock(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleUpdateSingleStock}
                    disabled={isUpdatingSingle}
                    className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdatingSingle ? 'Atualizando...' : 'Atualizar Estoque'}
                  </button>
                </div>
              ) : (
                /* Estoque com tamanhos (roupas/sapatos) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <FiTag className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Estoque por Tamanho</h3>
                    </div>
                    <button
                      onClick={handleBulkUpdate}
                      disabled={isUpdatingBulk}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdatingBulk ? 'Salvando...' : 'Salvar Todos'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tamanhosDoProduto.map((tag) => {
                      const currentStock = estoque.find((e: ProdutoTamanhoDTO) => e.etiqueta === tag)?.qtdEstoque || 0;
                      const inputValue = stockValues[tag] ?? currentStock;

                      return (
                        <div key={tag} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">{tag}</label>
                            <span className="text-xs text-gray-500">
                              Atual: {currentStock}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              min="0"
                              value={inputValue}
                              onChange={(e) => setStockValues({
                                ...stockValues,
                                [tag]: parseInt(e.target.value) || 0,
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            />
                            <button
                              onClick={() => handleUpdateTagStock(tag)}
                              disabled={isUpdatingTag}
                              className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Atualizar apenas este tamanho"
                            >
                              <FiTag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
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
    </div>
  );
}
