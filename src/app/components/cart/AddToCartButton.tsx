"use client";

import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { add as addCartItem } from "@/store/cartSlice";
import type { Tipo } from "@/store/wishlistSlice";

type Props = {
  id: number;
  tipo: Tipo;                  // "bolsas" | "roupas" | "sapatos"
  preco?: number;
  title?: string;
  subtitle?: string;
  img?: string;
  className?: string;          // opcional para estilizar no card
  withQty?: boolean;           // se true, mostra seletor de quantidade
  defaultQty?: number;         // quantidade inicial (default 1)
  onAdded?: () => void;        // callback opcional após adicionar
};

function AddToCartButtonBase({
  id,
  tipo,
  preco,
  title,
  subtitle,
  img,
  className,
  withQty = false,
  defaultQty = 1,
  onAdded,
}: Props) {
  const dispatch = useDispatch();
  const [qty, setQty] = useState<number>(Math.max(1, defaultQty));

  const handleAdd = () => {
    dispatch(
      addCartItem({
        id,
        tipo,
        qty,
        title,
        subtitle,
        img,
        preco,
      })
    );
    onAdded?.();
  };

  return (
    <div className={className}>
      {withQty && (
        <div className="mb-2 inline-flex overflow-hidden rounded-md border border-zinc-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-2 py-1 text-sm"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="px-3 py-1 text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-2 py-1 text-sm"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}

export default memo(AddToCartButtonBase);
