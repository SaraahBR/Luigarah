"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import type { StoredUser } from "./storage";

type UserMenuProps = {
  user: StoredUser;
  avatarUrl?: string | null;            
  onLogout: () => Promise<void> | void;
};

function Monograma({ name }: { name: string }) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "LH";
  return (
    <div className="h-8 w-8 rounded-full bg-black text-white grid place-items-center text-xs font-semibold select-none">
      {initials}
    </div>
  );
}

export default function UserMenu({ user, avatarUrl, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative">
      {/* Botão do usuário (ícone e seta) */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-black hover:text-gray-600 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu do usuário"
      >
        <FiUser className="text-black hover:text-gray-600" />
        <FiChevronDown className="text-black hover:text-gray-600 text-base" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white text-black shadow-xl border border-gray-200 p-3 z-50"
          role="menu"
        >
          {/* Cabeçalho com avatar no canto superior direito */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Logada como</p>
              <p className="text-base font-semibold text-black truncate">{user.name}</p>
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <Monograma name={user.name} />
              )}
            </div>
          </div>

          {/* Itens */}
          <nav className="py-2">
            <Link
              href="#"
              role="menuitem"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100"
            >
              Pedidos &amp; devoluções
            </Link>
            <Link
              href="#"
              role="menuitem"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100"
            >
              Créditos e reembolsos
            </Link>
            <Link
              href="#"
              role="menuitem"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100"
            >
              Meus interesses
            </Link>
            <Link
              href="/minha-conta"
              role="menuitem"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100"
            >
              Minha Conta
            </Link>
          </nav>

          {/* Botão Sair */}
          <button
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            role="menuitem"
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-black hover:bg-gray-50"
          >
            <FiLogOut />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
