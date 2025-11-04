"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

type TamanhoDisponivel = {
  id: number;
  etiqueta: string;
  qtdEstoque: number;
};

type ChangeSizeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produto: {
    id: number;
    titulo: string;
    imagem?: string;
    tipo: "sapatos" | "roupas" | "bolsas";
  };
  tamanhoAtual?: {
    id?: number;
    etiqueta?: string;
  };
  tamanhosDisponiveis: TamanhoDisponivel[];
  onConfirm: (novoTamanhoId: number, novaEtiqueta: string) => void;
};

export default function ChangeSizeModal({
  isOpen,
  onClose,
  produto,
  tamanhoAtual,
  tamanhosDisponiveis,
  onConfirm,
}: ChangeSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState<TamanhoDisponivel | null>(null);

  // Reset quando abrir modal
  useEffect(() => {
    if (isOpen) {
      // Seleciona o tamanho atual se disponível
      const tamanhoAtualObj = tamanhosDisponiveis.find(
        (t) => t.id === tamanhoAtual?.id
      );
      setSelectedSize(tamanhoAtualObj || null);
    }
  }, [isOpen, tamanhoAtual, tamanhosDisponiveis]);

  const handleConfirm = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }

    onConfirm(selectedSize.id, selectedSize.etiqueta);
    onClose();
  };

  const tamanhosComEstoque = tamanhosDisponiveis.filter((t) => t.qtdEstoque > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Tamanho</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Produto info */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
            {produto.imagem && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={produto.imagem}
                  alt={produto.titulo}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{produto.titulo}</p>
              {tamanhoAtual?.etiqueta && (
                <p className="text-xs text-zinc-600">
                  Tamanho atual: <span className="font-medium">{tamanhoAtual.etiqueta}</span>
                </p>
              )}
            </div>
          </div>

          {/* Tamanhos disponíveis */}
          {tamanhosComEstoque.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-600">
              Nenhum tamanho disponível no momento
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">
                Selecione o novo tamanho:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {tamanhosComEstoque.map((tamanho) => (
                  <button
                    key={tamanho.id}
                    onClick={() => setSelectedSize(tamanho)}
                    className={`
                      relative px-3 py-2 border rounded-md text-sm font-medium transition-colors
                      ${
                        selectedSize?.id === tamanho.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 hover:border-zinc-400"
                      }
                      ${tamanho.qtdEstoque === 0 ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                    disabled={tamanho.qtdEstoque === 0}
                  >
                    {tamanho.etiqueta}
                    {tamanho.id === tamanhoAtual?.id && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] px-1 rounded-full">
                        atual
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSize || selectedSize.id === tamanhoAtual?.id}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
