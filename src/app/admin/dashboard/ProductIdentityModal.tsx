"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { ProdutoDTO } from "@/hooks/api/types";
import { useAtribuirIdentidadeMutation, useRemoverIdentidadeMutation } from "@/hooks/api/produtosApi";
import Toast from "./Toast";

interface ProductIdentityModalProps {
  product: ProdutoDTO | null;
  onClose: () => void;
}

export default function ProductIdentityModal({ product, onClose }: ProductIdentityModalProps) {
  const [identidadeId, setIdentidadeId] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [atribuirIdentidade, { isLoading: isAtribuindo }] = useAtribuirIdentidadeMutation();
  const [removerIdentidade, { isLoading: isRemovendo }] = useRemoverIdentidadeMutation();

  if (!product) return null;

  const handleAtribuir = async () => {
    if (!identidadeId || !product.id) {
      setToast({ message: "Selecione uma identidade!", type: "error" });
      return;
    }

    try {
      await atribuirIdentidade({
        produtoId: product.id,
        identidadeId: parseInt(identidadeId),
      }).unwrap();
      setToast({ message: "Identidade atribuída com sucesso!", type: "success" });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const error = err as { data?: { mensagem?: string }; message?: string };
      setToast({ 
        message: `Erro ao atribuir identidade: ${error.data?.mensagem || error.message || "Erro desconhecido"}`, 
        type: "error" 
      });
    }
  };

  const handleRemover = async () => {
    if (!product.id) return;

    if (!window.confirm("Tem certeza que deseja remover a identidade deste produto?")) {
      return;
    }

    try {
      await removerIdentidade(product.id).unwrap();
      setToast({ message: "Identidade removida com sucesso!", type: "success" });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const error = err as { data?: { mensagem?: string }; message?: string };
      setToast({ 
        message: `Erro ao remover identidade: ${error.data?.mensagem || error.message || "Erro desconhecido"}`, 
        type: "error" 
      });
    }
  };

  // Mapear código da identidade para ID
  const getIdentidadeIdFromCodigo = (codigo: string): string => {
    const map: Record<string, string> = {
      "mulher": "1",
      "homem": "2",
      "unissex": "3",
      "infantil": "4",
    };
    return map[codigo] || "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Identidade</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Informações do produto */}
          <div className="bg-gray-50 rounded-lg p-4 flex gap-4 items-start">
            {/* Imagem do produto */}
            {product.imagem && (
              <div className="flex-shrink-0">
                <img
                  src={product.imagem}
                  alt={product.titulo}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            {/* Informações textuais */}
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Produto:</p>
              <p className="font-bold text-gray-900">{product.titulo}</p>
              {product.identidade && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Identidade Atual:</p>
                  <p className="font-semibold text-gray-900 capitalize">{product.identidade.codigo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Atribuir Identidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atribuir Nova Identidade
            </label>
            <select
              value={identidadeId}
              onChange={(e) => setIdentidadeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            >
              <option value="">Selecione uma identidade...</option>
              <option value="1">Feminino (Mulher)</option>
              <option value="2">Masculino (Homem)</option>
              <option value="3">Unissex</option>
              <option value="4">Infantil</option>
            </select>
            <button
              onClick={handleAtribuir}
              disabled={isAtribuindo || !identidadeId}
              className="w-full mt-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAtribuindo ? "Atribuindo..." : "Atribuir Identidade"}
            </button>
          </div>

          {/* Remover Identidade */}
          {product.identidade && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleRemover}
                disabled={isRemovendo}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isRemovendo ? "Removendo..." : "Remover Identidade Atual"}
              </button>
            </div>
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
