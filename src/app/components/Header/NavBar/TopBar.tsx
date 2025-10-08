"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiGlobe, FiHeart, FiMenu, FiX, FiShoppingBag, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectWishlistCount } from "@/store/wishlistSlice";
import { selectCartBadgeCount } from "@/store/cartSlice";

import BottomBar from "./BottomBar";
import AuthModal from "../../../login/AuthModal";
import UserMenu from "../../../login/UserMenu";
import { useAuthUser } from "../../../login/useAuthUser";
import Categorias from "./Categorias/Categorias";

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);         // menu lateral mobile
  const [isAuthOpen, setIsAuthOpen] = useState(false); // modal de autenticação
  const [mounted, setMounted] = useState(false);       // controle de hidratação

  // Profile do usuário (NextAuth/Upload)
  const { user, profile, onAuthSuccess, logout, isAuthenticated } = useAuthUser();

  // Contadores (Redux Persist) - só mostrar quando autenticado
  const wishlistCount = useSelector(selectWishlistCount);
  const cartCount = useSelector(selectCartBadgeCount);

  // Evita erro de hidratação SSR/CSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // >>> Ouve um evento global para abrir o AuthModal de qualquer lugar do app
  useEffect(() => {
    const onOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener("luigara:auth:open", onOpenAuth as EventListener);
    return () => window.removeEventListener("luigara:auth:open", onOpenAuth as EventListener);
  }, []);

  return (
    <div className="bg-white border-b relative">
      {/* faixa superior com links principais + logo + ícones */}
      <div className="container mx-auto flex justify-between items-center px-4 py-3 md:gap-4">
        {/* Menu mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-2xl text-black mr-2"
          aria-label="Abrir menu"
        >
          <FiMenu />
        </button>

        {/* Links principais (desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/mulher" className="text-black hover:text-gray-600 transition-colors tracking-wide">
            Mulher
          </Link>
          <Link href="/homem" className="text-black hover:text-gray-600 transition-colors tracking-wide">
            Homem
          </Link>
        </div>

        {/* Logo central */}
        <div className="flex-1 text-center md:absolute md:left-1/2 md:-translate-x-1/2 md:px-4">
          <Link 
            href="/" 
            className="text-2xl text-black font-bold tracking-wider inline-block"
            style={{
              fontFamily: "'Playfair Display', 'Times New Roman', serif",
              letterSpacing: '0.15em',
            }}
          >
            LUIGARAH
          </Link>
        </div>

        {/* Ícones à direita */}
        <div className="relative flex items-center gap-3 md:gap-5 text-xl flex-shrink-0">
          {/* Idioma - apenas desktop */}
          <button
            className="hidden md:block text-black hover:text-gray-600 transition-colors"
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
            {mounted && isAuthenticated && wishlistCount > 0 && (
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
            {mounted && isAuthenticated && cartCount > 0 && (
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
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="text-lg font-semibold text-black">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-black" aria-label="Fechar menu">
            <FiX />
          </button>
        </div>

        {/* Links principais */}
        <nav className="px-4 py-4 space-y-4 text-black font-medium border-b">
          <Link href="/mulher" onClick={() => setIsOpen(false)} className="block hover:text-gray-600 tracking-wide">Mulher</Link>
          <Link href="/homem" onClick={() => setIsOpen(false)} className="block hover:text-gray-600 tracking-wide">Homem</Link>
        </nav>

        {/* Categorias */}
        <div className="px-4 py-4 border-b">
          <h3 className="text-lg font-semibold text-black mb-4">Categorias</h3>
          <Categorias mobile onItemClick={() => setIsOpen(false)} />
        </div>

        {/* Links adicionais */}
        <nav className="px-4 py-4 space-y-4 text-black font-medium">
          <button 
            onClick={() => setIsOpen(false)} 
            className="flex items-center gap-2 hover:text-gray-600 tracking-wide"
          >
            <FiGlobe />
            Idioma
          </button>
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
