"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

type TamanhoComEstoque = {
  id: number;
  etiqueta: string;
  qtdEstoque: number;
};

type SizeStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produto: {
    id: number;
    titulo: string;
    subtitulo?: string;
    preco: number;
    imagem: string;
    tipo: "sapatos" | "roupas" | "bolsas";
  };
  tamanhosComEstoque?: TamanhoComEstoque[];
  estoqueBolsa?: number;
  onConfirm: (data: {
    tamanhoId?: number;
    tamanhoLabel?: string;
    quantidade: number;
  }) => void;
};

export default function SizeStockModal({
  isOpen,
  onClose,
  produto,
  tamanhosComEstoque = [],
  estoqueBolsa,
  onConfirm,
}: SizeStockModalProps) {
  const [selectedSize, setSelectedSize] = useState<TamanhoComEstoque | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isBolsa = produto.tipo === "bolsas";
  const maxStock = isBolsa 
    ? (estoqueBolsa || 0) 
    : (selectedSize?.qtdEstoque || 0);

  // Reset quando abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [isOpen]);

  // Atualiza quantidade máxima quando mudar tamanho
  useEffect(() => {
    if (selectedSize && quantity > selectedSize.qtdEstoque) {
      setQuantity(selectedSize.qtdEstoque);
    }
  }, [selectedSize, quantity]);

  const handleConfirm = () => {
    // Validação para sapatos e roupas
    if (!isBolsa && !selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }

    // Validação de estoque
    if (maxStock === 0) {
      toast.error("Produto sem estoque disponível");
      return;
    }

    if (quantity > maxStock) {
      toast.error(`Quantidade máxima disponível: ${maxStock}`);
      return;
    }

    if (quantity < 1) {
      toast.error("Quantidade mínima é 1");
      return;
    }

    // Confirma e fecha
    onConfirm({
      tamanhoId: selectedSize?.id,
      tamanhoLabel: selectedSize?.etiqueta,
      quantidade: quantity,
    });
    onClose();
  };

  // Filtrar apenas tamanhos com estoque disponível
  const tamanhosDisponiveis = tamanhosComEstoque.filter(t => t.qtdEstoque > 0);
  const temEstoque = isBolsa ? (estoqueBolsa || 0) > 0 : tamanhosDisponiveis.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Adicionar ao Carrinho</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Produto Info */}
          <div className="flex gap-3 pb-3 border-b">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={produto.imagem}
                alt={produto.titulo}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{produto.titulo}</h3>
              {produto.subtitulo && (
                <p className="text-xs text-gray-500 truncate">{produto.subtitulo}</p>
              )}
              <p className="text-sm font-semibold mt-1">
                {produto.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Sem estoque */}
          {!temEstoque && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 text-center font-medium">
                Produto sem estoque disponível
              </p>
            </div>
          )}

          {/* Seleção de Tamanho (Sapatos/Roupas) */}
          {!isBolsa && temEstoque && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Selecione o tamanho
              </label>
              <div className="grid grid-cols-4 gap-2">
                {tamanhosDisponiveis.map((tamanho) => (
                  <button
                    key={tamanho.etiqueta}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(tamanho);
                    }}
                    className={`
                      px-3 py-2 text-sm border rounded-md transition-all
                      ${
                        selectedSize?.etiqueta === tamanho.etiqueta
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }
                    `}
                  >
                    {tamanho.etiqueta}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedSize.qtdEstoque} unidade(s) disponível(is)
                </p>
              )}
            </div>
          )}

          {/* Estoque disponível para bolsas */}
          {isBolsa && temEstoque && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{estoqueBolsa}</span> unidade(s) disponível(is)
              </p>
            </div>
          )}

          {/* Seleção de Quantidade */}
          {temEstoque && (isBolsa || selectedSize) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    e.stopPropagation();
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(maxStock, Math.max(1, val)));
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur(); // Remove o foco imediatamente
                  }}
                  onFocus={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur(); // Previne o foco
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Previne a seleção do texto
                  }}
                  min={1}
                  max={maxStock}
                  readOnly
                  className="w-20 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black cursor-default select-none"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity(Math.min(maxStock, quantity + 1));
                  }}
                  disabled={quantity >= maxStock}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-auto">
                  Máx: {maxStock}
                </span>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm();
              }}
              disabled={!temEstoque || (!isBolsa && !selectedSize)}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
