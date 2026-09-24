"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { ProdutoDTO } from "@/hooks/api/types";
import { useAtribuirIdentidadeMutation, useRemoverIdentidadeMutation } from "@/hooks/api/produtosApi";
import Toast from "./Toast";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useErroApi } from "@/i18n/useErroApi";
import { useCatalogo } from "@/i18n/useCatalogo";

interface ProductIdentityModalProps {
  product: ProdutoDTO | null;
  onClose: () => void;
}

export default function ProductIdentityModal({ product, onClose }: ProductIdentityModalProps) {
  const t = useTranslations("admin.identity");
  const traduzirErro = useErroApi();
  const cat = useCatalogo();
  const [identidadeId, setIdentidadeId] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [atribuirIdentidade, { isLoading: isAtribuindo }] = useAtribuirIdentidadeMutation();
  const [removerIdentidade, { isLoading: isRemovendo }] = useRemoverIdentidadeMutation();

  if (!product) return null;

  const handleAtribuir = async () => {
    if (!identidadeId || !product.id) {
      setToast({ message: t("selectRequired"), type: "error" });
      return;
    }

    try {
      await atribuirIdentidade({
        produtoId: product.id,
        identidadeId: parseInt(identidadeId),
      }).unwrap();
      setToast({ message: t("assigned"), type: "success" });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setToast({ 
        message: t("assignError", { erro: traduzirErro(err) }), 
        type: "error" 
      });
    }
  };

  const handleRemover = async () => {
    if (!product.id) return;

    if (!window.confirm(t("confirmRemove"))) {
      return;
    }

    try {
      await removerIdentidade(product.id).unwrap();
      setToast({ message: t("removed"), type: "success" });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setToast({ 
        message: t("removeError", { erro: traduzirErro(err) }), 
        type: "error" 
      });
    }
  };



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t("close")}>
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Informações do produto */}
          <div className="bg-gray-50 rounded-lg p-4 flex gap-4 items-start">
            {/* Imagem do produto */}
            {product.imagem && (
              <div className="flex-shrink-0 relative w-20 h-20">
                <Image
                  src={product.imagem}
                  alt={product.titulo}
                  fill
                  className="object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            {/* Informações textuais */}
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{t("product")}</p>
              <p className="font-bold text-gray-900">{product.titulo}</p>
              {product.identidade && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">{t("current")}</p>
                  <p className="font-semibold text-gray-900 capitalize">{cat.identidade(product.identidade.codigo)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Atribuir Identidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assignNew")}
            </label>
            <select
              value={identidadeId}
              onChange={(e) => setIdentidadeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            >
              <option value="">{t("selectPlaceholder")}</option>
              <option value="1">{t("optMale")}</option>
              <option value="2">{t("optFemale")}</option>
              <option value="3">{cat.identidade("unissex")}</option>
              <option value="4">{cat.identidade("infantil")}</option>
            </select>
            <button
              onClick={handleAtribuir}
              disabled={isAtribuindo || !identidadeId}
              className="w-full mt-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAtribuindo ? t("assigning") : t("assign")}
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
                {isRemovendo ? t("removing") : t("remove")}
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
