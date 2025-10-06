"use client";

import Link from "next/link";
import { useState } from "react";
import { FiGlobe, FiHeart, FiMenu, FiX, FiShoppingBag, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectWishlistCount } from "@/store/wishlistSlice";
import { selectCartBadgeCount } from "@/store/cartSlice";

import BottomBar from "./BottomBar";
import AuthModal from "../../../login/AuthModal";
import UserMenu from "../../../login/UserMenu";
import { useAuthUser } from "../../../login/useAuthUser";

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);         // menu lateral mobile
  const [isAuthOpen, setIsAuthOpen] = useState(false); // modal de autenticação

  // Profile do usuário (NextAuth/Upload)
  const { user, profile, onAuthSuccess, logout } = useAuthUser();

  // Contadores (Redux Persist)
  const wishlistCount = useSelector(selectWishlistCount);
  const cartCount = useSelector(selectCartBadgeCount);

  return (
    <div className="bg-white border-b relative">
      {/* faixa superior com links principais + logo + ícones */}
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Menu mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-2xl text-black"
          aria-label="Abrir menu"
        >
          <FiMenu />
        </button>

        {/* Links principais (desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/mulher" className="text-black hover:text-gray-600 transition-colors">
            Mulher
          </Link>
          <Link href="/homem" className="text-black hover:text-gray-600 transition-colors">
            Homem
          </Link>
        </div>

        {/* Logo central */}
        <div className="flex-1 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link href="/" className="text-2xl text-black font-bold tracking-wider">
            LUIGARAH
          </Link>
        </div>

        {/* Ícones à direita */}
        <div className="relative flex items-center gap-5 text-xl">
          {/* Idioma */}
          <button
            className="text-black hover:text-gray-600 transition-colors"
            aria-label="Mudar idioma"
          >
            <FiGlobe />
          </button>

          {/* Usuário: modal ou dropdown */}
          {!user ? (
            <button onClick={() => setIsAuthOpen(true)} aria-label="Abrir entrar/cadastrar">
              <FiUser className="text-black hover:text-gray-600 transition-colors" />
            </button>
          ) : (
            <UserMenu user={user} avatarUrl={profile?.image ?? null} onLogout={logout} />
          )}

          {/* Favoritos com contador (-> /produtos/favoritos) */}
          <Link
            href="/produtos/favoritos"
            className="relative text-black hover:text-gray-600 transition-colors"
            aria-label="Favoritos"
          >
            <FiHeart />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-2 bg-black text-white text-[10px] leading-[16px] rounded-full min-w-[16px] h-[16px] px-1 text-center"
                aria-label={`${wishlistCount} itens na wishlist`}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Carrinho com contador dinâmico (-> /carrinho) */}
          <Link
            href="/carrinho"
            className="relative text-black hover:text-gray-600 transition-colors"
            aria-label="Carrinho"
          >
            <FiShoppingBag />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-2 bg-black text-white text-[10px] leading-[16px] rounded-full min-w-[16px] h-[16px] px-1 text-center"
                aria-label={`${cartCount} itens no carrinho`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Overlay do menu mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Drawer mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="text-lg font-semibold text-black">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-black" aria-label="Fechar menu">
            <FiX />
          </button>
        </div>
        <nav className="flex flex-col px-4 py-4 space-y-4 text-black font-semibold">
          <Link href="/mulher" onClick={() => setIsOpen(false)}>Mulher</Link>
          <Link href="/homem" onClick={() => setIsOpen(false)}>Homem</Link>
        </nav>
      </div>

      {/* BottomBar original */}
      <BottomBar />

      {/* Modal de autenticação */}
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={onAuthSuccess} />
    </div>
  );
};

export default TopBar;
