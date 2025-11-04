"use client";

import { memo, useState, useEffect, useReducer } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { add as addCartItem } from "@/store/cartSlice";
import type { Tipo } from "@/store/wishlistSlice";
import { toast } from "sonner";
import { useAuthUser } from "@/app/login/useAuthUser";
import { openAuthModal } from "@/app/login/openAuthModal";

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
  const dispatch = useDispatch<AppDispatch>();
  const [qty, setQty] = useState<number>(Math.max(1, defaultQty));
  const [isLoading, setIsLoading] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // ✅ Para forçar re-render
  
  // Verificação de autenticação
  const { isAuthenticated } = useAuthUser();

  // ✅ Listener para atualizar quando autenticação mudar
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[AddToCartButton] 🔄 Auth changed - forçando re-render');
      forceUpdate(); // Força re-render
    };

    window.addEventListener('luigara:auth:changed', handleAuthChange);
    return () => window.removeEventListener('luigara:auth:changed', handleAuthChange);
  }, []);

  const handleAdd = async () => {
    // >>> BLOQUEIO quando não está logado
    if (!isAuthenticated) {
      toast.error("É necessário estar logado para adicionar ao carrinho.");
      openAuthModal();
      return;
    }

    // Evita cliques múltiplos
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      await dispatch(
        addCartItem({
          id,
          tipo,
          qty,
          title,
          subtitle,
          img,
          preco,
        })
      ).unwrap();
      
      toast.success("Adicionado ao carrinho", { description: title });
      onAdded?.();
      
      // Dispara evento para animação do carrinho
      window.dispatchEvent(new CustomEvent("luigara:cart:add"));
    } catch (error) {
      toast.error("Erro ao adicionar ao carrinho");
      console.error('[AddToCartButton] Erro:', error);
    } finally {
      setIsLoading(false);
    }
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
        disabled={isLoading}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Adicionando...</span>
          </>
        ) : (
          "Adicionar ao carrinho"
        )}
      </button>
    </div>
  );
}

export default memo(AddToCartButtonBase);
