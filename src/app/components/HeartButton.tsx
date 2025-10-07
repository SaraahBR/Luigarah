"use client";

import { useDispatch, useSelector } from "react-redux";
import { selectIsInWishlist, toggle, Tipo } from "@/store/wishlistSlice";
import { toast } from "sonner";
import { useAuthUser } from "@/app/login/useAuthUser";
import { openAuthModal } from "@/app/login/openAuthModal";

type Props = {
  id: number;
  label: string;
  tipo: Tipo;        // "roupas" | "bolsas" | "sapatos"
  img?: string;
  className?: string;
};

export default function HeartButton({ id, label, tipo, img, className }: Props) {
  const dispatch = useDispatch();
  const active = useSelector(selectIsInWishlist(id, tipo));

  // estado de autenticação atual (NextAuth + mock)
  const { isAuthenticated } = useAuthUser();

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // >>> BLOQUEIO quando não está logado: abre modal e notifica
    if (!isAuthenticated) {
      toast.error("É necessário estar logado para adicionar à Wishlist.");
      openAuthModal();
      return;
    }

    // feedback instantâneo, sem navegação
    if (active) {
      toast("Removido da Wishlist", { description: label });
    } else {
      toast.success("Adicionado à Wishlist", { description: label });
    }

    dispatch(toggle({ id, tipo, title: label, img }));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${label} da Wishlist`
          : `Adicionar ${label} à Wishlist`
      }
      title={active ? "Remover da Wishlist" : "Adicionar à Wishlist"}
      className={[
        // posição e empilhamento
        "absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full transition",
        // disco branco suave quando inativo; preto quando ativo
        active
          ? "bg-zinc-900 text-white ring-1 ring-zinc-900"
          : "bg-white/90 text-black ring-1 ring-black/5 hover:bg-white",
        // acessibilidade e leve sombra
        "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300",
        className ?? "",
      ].join(" ")}
    >
      {/* Outline quando não favoritado, preenchido quando favoritado */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-[18px] w-[18px]"
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
    </button>
  );
}
