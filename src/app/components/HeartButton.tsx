"use client";

import { useState, useRef, useEffect, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsInWishlist, toggleWishlist, Tipo } from "@/store/wishlistSlice";
import { toast } from "sonner";
import { useAuthUser } from "@/app/login/useAuthUser";
import { openAuthModal } from "@/app/login/openAuthModal";
import type { AppDispatch } from "@/store";

type Props = {
  id: number;
  label: string;
  tipo: Tipo;        // "roupas" | "bolsas" | "sapatos"
  img?: string;
  className?: string;
  onAdded?: (position: { x: number; y: number }) => void;
};

export default function HeartButton({ id, label, tipo, img, className, onAdded }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const active = useSelector(selectIsInWishlist(id, tipo));
  const [isLoading, setIsLoading] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // ✅ Para forçar re-render
  const buttonRef = useRef<HTMLButtonElement>(null);

  // estado de autenticação atual (NextAuth + mock)
  const { isAuthenticated } = useAuthUser();

  // ✅ Listener para atualizar quando autenticação mudar
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[HeartButton] 🔄 Auth changed - forçando re-render');
      forceUpdate(); // Força re-render
    };

    window.addEventListener('luigara:auth:changed', handleAuthChange);
    return () => window.removeEventListener('luigara:auth:changed', handleAuthChange);
  }, []);

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // >>> BLOQUEIO quando não está logado: abre modal e notifica
    if (!isAuthenticated) {
      toast.error("É necessário estar logado para adicionar à Wishlist.");
      openAuthModal();
      return;
    }

    // Evita cliques múltiplos
    if (isLoading) return;

    // Captura o estado ANTES de qualquer modificação
    const wasInWishlist = active;

    // CAPTURA A POSIÇÃO DO BOTÃO IMEDIATAMENTE
    let buttonPosition = { x: 0, y: 0 };
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      buttonPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    // feedback instantâneo, sem navegação
    if (active) {
      toast("Removido da Wishlist", { description: label });
    } else {
      toast.success("Adicionado à Wishlist", { description: label });
    }

    // Dispara a ação assíncrona (não aguarda a resposta)
    setIsLoading(true);
    dispatch(toggleWishlist({ 
      id, 
      tipo, 
      title: label, 
      img,
      wasInWishlist // Passa o estado ANTERIOR
    }))
      .finally(() => {
        setIsLoading(false);
        
        // Dispara a animação apenas quando ADICIONA à wishlist
        if (!wasInWishlist) {
          onAdded?.(buttonPosition);
        }
      });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${label} da Wishlist`
          : `Adicionar ${label} à Wishlist`
      }
      title={active ? "Remover da Wishlist" : "Adicionar à Wishlist"}
      className={[
        // posição e empilhamento
        "absolute right-3 top-3 z-20 inline-flex h-10 w-10 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
        // disco branco suave quando inativo; preto quando ativo
        active
          ? "bg-zinc-900 text-white ring-1 ring-zinc-900 hover:bg-zinc-700 hover:ring-zinc-700"
          : "bg-white/90 text-black ring-1 ring-black/5 hover:bg-gray-200 hover:text-black",
        // acessibilidade e leve sombra
        "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300",
        // estado de loading
        isLoading ? "opacity-60 cursor-wait" : "",
        className ?? "",
      ].join(" ")}
    >
      {isLoading ? (
        // Spinner de loading
        <svg
          className="animate-spin h-5 w-5"
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
      ) : (
        <>
          {/* Outline quando não favoritado, preenchido quando favoritado */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-5 md:w-5"
            viewBox="0 0 24 24"
            aria-hidden="true"
            shapeRendering="geometricPrecision"
          >
            <path
              className={active ? "hidden" : "block active:hidden"}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.132-4.312 2.737-.715-1.605-2.377-2.737-4.313-2.737C5.1 3.75 3 5.765 3 8.25c0 7.22 8.25 11.25 8.25 11.25S21 15.47 21 8.25Z"
            />
            <path
              className={active ? "block" : "hidden active:block"}
              fill="currentColor"
              d="M12 6.487C11.162 4.93 9.56 3.75 7.688 3.75 5.1 3.75 3 5.765 3 8.25c0 7.22 9 11.25 9 11.25s9-4.03 9-11.25c0-2.485-2.099-4.5-4.688-4.5-1.872 0-3.474 1.18-4.312 2.737Z"
            />
          </svg>
        </>
      )}
    </button>
  );
}
