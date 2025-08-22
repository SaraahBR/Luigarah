"use client";

import { useWishlist } from "./use-wishlist";

type Props = {
  id: number;
  label: string;
  className?: string;
};

export default function HeartButton({ id, label, className }: Props) {
  const { isFav, toggle } = useWishlist();
  const active = isFav(id); // favoritado (persistido)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${label} da lista de desejos`
          : `Adicionar ${label} à lista de desejos`
      }
      title={active ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
      className={
        // Sem fundo/shape por padrão; aparece só no hover/active
        `absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center
         rounded-md bg-transparent transition
         hover:bg-zinc-100 active:bg-zinc-200
         hover:shadow-sm active:shadow-sm
         ring-0 hover:ring-1 hover:ring-zinc-200 active:ring-zinc-300
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300
         ${className ?? ""}`
      }
    >
      {/* Outline padrão; preenche no active OU quando já está favoritado */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
        {/* contorno (mostra quando não está favoritado e não está pressionado) */}
        <path
          className={`${active ? "hidden" : "block active:hidden"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.132-4.312 2.737-.715-1.605-2.377-2.737-4.313-2.737C5.1 3.75 3 5.765 3 8.25c0 7.22 8.25 11.25 8.25 11.25S21 15.47 21 8.25Z"
        />
        {/* preenchido (mostra no active OU se já favoritado) */}
        <path
          className={`${active ? "block" : "hidden active:block"}`}
          fill="currentColor"
          d="M12 6.487C11.162 4.93 9.56 3.75 7.688 3.75 5.1 3.75 3 5.765 3 8.25c0 7.22 9 11.25 9 11.25s9-4.03 9-11.25c0-2.485-2.099-4.5-4.688-4.5-1.872 0-3.474 1.18-4.312 2.737Z"
        />
      </svg>
    </button>
  );
}
