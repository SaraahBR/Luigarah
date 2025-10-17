"use client";

import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { add as addCartItem, remove as removeCartItem } from "@/store/cartSlice";
import type { Tipo } from "@/store/wishlistSlice";
import { toast } from "sonner";
import { useAuthUser } from "@/app/login/useAuthUser";
import { openAuthModal } from "@/app/login/openAuthModal";
import { FiShoppingBag } from "react-icons/fi";

type Props = {
  id: number;
  tipo: Tipo;
  preco?: number;
  title?: string;
  subtitle?: string;
  img?: string;
  onAdded?: () => void;
};

function CartButtonCircleBase({
  id,
  tipo,
  preco,
  title,
  subtitle,
  img,
  onAdded,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [frozenState, setFrozenState] = useState<boolean | null>(null); // Estado congelado durante loading
  
  // Verificação de autenticação
  const { isAuthenticated } = useAuthUser();

  // Verifica se o produto está no carrinho e pega seus dados
  const cartItem = useSelector((state: RootState) => {
    const key = `${tipo}:${id}`;
    return state.cart.items[key];
  });
  
  const isInCart = !!cartItem;
  
  // Durante loading, usa o estado congelado; caso contrário, usa o estado real
  const displayIsInCart = isLoading && frozenState !== null ? frozenState : isInCart;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // >>> BLOQUEIO quando não está logado
    if (!isAuthenticated) {
      toast.error("É necessário estar logado para adicionar ao carrinho.");
      openAuthModal();
      return;
    }

    // Evita cliques múltiplos durante loading - BLOQUEIA COMPLETAMENTE
    if (isLoading) {
      return;
    }

    // Captura estado ANTES de qualquer modificação
    const wasInCart = isInCart;

    // CONGELA o estado visual durante o loading
    setFrozenState(wasInCart);

    // Mostra notificação IMEDIATAMENTE (antes da operação async)
    if (wasInCart) {
      toast("Removido do carrinho", { description: title });
    } else {
      toast.success("Adicionado ao carrinho", { description: title });
    }

    // Marca como loading apenas visualmente (para o spinner)
    setIsLoading(true);

    // Delay mínimo para garantir que o spinner seja visível
    const minLoadingTime = 500; // 500ms (aumentado para garantir visibilidade)
    const startTime = Date.now();

    // Dispara a ação assíncrona (não aguarda - fire and forget)
    if (wasInCart) {
      // Remove do carrinho (com backendId se existir)
      dispatch(
        removeCartItem({
          id,
          tipo,
          backendId: cartItem?.backendId,
        })
      ).finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        setTimeout(() => {
          setIsLoading(false);
          setFrozenState(null); // Descongela o estado
        }, remaining);
      });
    } else {
      // Adiciona ao carrinho
      dispatch(
        addCartItem({
          id,
          tipo,
          qty: 1,
          title,
          subtitle,
          img,
          preco,
        })
      ).finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        setTimeout(() => {
          setIsLoading(false);
          setFrozenState(null); // Descongela o estado
          onAdded?.();
          // Dispara evento para animação do carrinho
          window.dispatchEvent(new CustomEvent("luigara:cart:add"));
        }, remaining);
      });
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative w-10 h-10 md:w-10 md:h-10 rounded-full 
        flex items-center justify-center 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
        ${displayIsInCart
          ? 'bg-black text-white' 
          : 'bg-gray-200 text-gray-600'
        }
        ${isLoading 
          ? 'cursor-wait opacity-70 pointer-events-none' 
          : 'hover:scale-110 hover:bg-gray-800'
        }
      `}
      aria-label={displayIsInCart ? "Remover do carrinho" : "Adicionar ao carrinho"}
    >
      {/* Anel gradiente girando - fica visível durante loading */}
      {isLoading && (
        <div 
          className="absolute inset-0 rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        >
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: displayIsInCart 
                ? 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.8) 25%, transparent 50%, rgba(255,255,255,0.8) 75%, transparent 100%)'
                : 'conic-gradient(from 0deg, transparent 0%, rgba(0,0,0,0.8) 25%, transparent 50%, rgba(0,0,0,0.8) 75%, transparent 100%)',
              padding: '2.5px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
        </div>
      )}
      
      {/* Ícone */}
      <FiShoppingBag className="w-5 h-5 md:w-5 md:h-5 relative z-10" />
    </button>
  );
}

export default memo(CartButtonCircleBase);
