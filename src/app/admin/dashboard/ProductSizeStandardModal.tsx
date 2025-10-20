'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { GiHighHeel } from 'react-icons/gi';
import { ProdutoDTO } from '@/hooks/api/types';
import Toast from './Toast';
import {
  useDefinirPadraoProdutoMutation,
  useLimparPadraoProdutoMutation,
} from '@/hooks/api/produtosApi';

type SizeStandard = 'usa' | 'br' | 'sapatos';

interface ProductSizeStandardModalProps {
  product: ProdutoDTO;
  onClose: () => void;
  onSuccess?: () => void; // Callback para refetch após sucesso
}

export default function ProductSizeStandardModal({ product, onClose, onSuccess }: ProductSizeStandardModalProps) {
  const [selectedStandard, setSelectedStandard] = useState<SizeStandard | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [definirPadrao, { isLoading: isDefining }] = useDefinirPadraoProdutoMutation();
  const [limparPadrao, { isLoading: isClearing }] = useLimparPadraoProdutoMutation();

  const isLoading = isDefining || isClearing;

  // Carregar o padrão atual do produto quando o modal abre
  useEffect(() => {
    if (product.padrao) {
      // O backend retorna o padrão no campo `padrao`
      const padraoAtual = product.padrao;
      if (['usa', 'br', 'sapatos'].includes(padraoAtual)) {
        setSelectedStandard(padraoAtual);
      }
    }
  }, [product.padrao]);

  const handleToggle = (standard: SizeStandard) => {
    setSelectedStandard(selectedStandard === standard ? null : standard);
  };

  const handleConfirm = async () => {
    if (!product.id) return;

    try {
      if (selectedStandard) {
        // Definir padrão no backend
        await definirPadrao({
          id: product.id,
          padrao: selectedStandard,
        }).unwrap();
        
        setToast({ message: 'Padrão de tamanho definido com sucesso!', type: 'success' });
      } else {
        // Limpar padrão no backend
        await limparPadrao(product.id).unwrap();
        
        setToast({ message: 'Padrão de tamanho removido com sucesso!', type: 'success' });
      }
      
      // Chamar callback de sucesso para atualizar lista
      onSuccess?.();
      
      // Aguardar um pouco para garantir que o cache RTK Query seja invalidado
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setToast({ message: 'Erro ao atualizar padrão de tamanho', type: 'error' });
    }
  };

  const standards = [
    {
      value: 'usa' as SizeStandard,
      label: 'USA',
      flag: '🇺🇸',
      description: 'Tamanhos americanos (XXXS - XXXL)',
    },
    {
      value: 'br' as SizeStandard,
      label: 'Brasil',
      flag: '🇧🇷',
      description: 'Tamanhos brasileiros (PP - G2)',
    },
    {
      value: 'sapatos' as SizeStandard,
      label: 'Sapatos',
      icon: <GiHighHeel className="w-8 h-8" />,
      description: 'Numeração de sapatos (30 - 46)',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Padrão de Tamanhos</h2>
              <p className="text-sm text-gray-600 mt-1">{product.titulo}</p>
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
            <p className="text-sm text-gray-600 mb-6">
              Selecione o padrão de tamanhos para este produto. Apenas um padrão pode estar ativo por vez.
            </p>

            <div className="space-y-4">
              {standards.map((standard) => {
                const isSelected = selectedStandard === standard.value;

                return (
                  <div
                    key={standard.value}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                    onClick={() => handleToggle(standard.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Flag ou Icon */}
                        <div className="text-4xl">
                          {standard.flag || standard.icon}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="font-semibold text-gray-900">{standard.label}</h3>
                          <p className="text-sm text-gray-600">{standard.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <div
                        className={`
                          relative w-14 h-8 rounded-full transition-colors cursor-pointer
                          ${isSelected ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(standard.value);
                        }}
                      >
                        <div
                          className={`
                            absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform
                            ${isSelected ? 'translate-x-7' : 'translate-x-1'}
                          `}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : 'Confirmar'}
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
