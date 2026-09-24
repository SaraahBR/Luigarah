"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FiHeart, FiMenu, FiX, FiShoppingBag, FiUser } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { RiDashboardLine } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { selectWishlistCount, syncWishlistFromBackend } from "@/store/wishlistSlice";
import { selectCartBadgeCount, syncCartFromBackend } from "@/store/cartSlice";
import type { AppDispatch } from "@/store";

import BottomBar from "./BottomBar";
import AuthModal from "../../../login/AuthModal";
import UserMenu from "../../../login/UserMenu";
import { useAuthUser } from "../../../login/useAuthUser";
import Categorias from "./Categorias/Categorias";
import AdminDashboardIcon from "./AdminDashboardIcon";
import LanguageSwitcher from "./LanguageSwitcher";

function TopBarContent() {
  const t = useTranslations("nav");
  const tId = useTranslations("identidades");
  const pathname = usePathname();                      // rota atual
  const searchParams = useSearchParams();              // query params
  const identidadeParam = searchParams.get("identidade")?.toLowerCase(); // identidade da URL
  
  const [isOpen, setIsOpen] = useState(false);         // menu lateral mobile
  const [isAuthOpen, setIsAuthOpen] = useState(false); // modal de autenticação
  const [mounted, setMounted] = useState(false);       // controle de hidratação
  const [cartBounce, setCartBounce] = useState(false); // animação do carrinho

  // Bloqueia scroll quando menu mobile está aberto
  useEffect(() => {
    if (isOpen) {
      // Salva posição atual do scroll
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
    } else {
      // Restaura posição do scroll
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [isOpen]);

  // Profile do usuário (NextAuth/Upload)
  const { user, profile, logout, isAuthenticated } = useAuthUser();

  // Redux
  const dispatch = useDispatch<AppDispatch>();

  // Contadores (Redux Persist) - só mostrar quando autenticado
  const wishlistCount = useSelector(selectWishlistCount);
  const cartCount = useSelector(selectCartBadgeCount);

  // Função para verificar se o link de identidade está ativo
  const isIdentityActive = (identidade: string) => {
    // Verifica se está na página da identidade OU se tem o parâmetro identidade na URL
    return pathname === `/${identidade}` || identidadeParam === identidade;
  };

  // Evita erro de hidratação SSR/CSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // >>> Sincroniza carrinho e wishlist quando autenticado
  useEffect(() => {
    if (mounted && isAuthenticated) {
      // Sincroniza em background sem bloquear UI
      dispatch(syncWishlistFromBackend());
      dispatch(syncCartFromBackend());
    }
  }, [mounted, isAuthenticated, dispatch]);

  // >>> Ouve um evento global para abrir o AuthModal de qualquer lugar do app
  useEffect(() => {
    const onOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener("luigara:auth:open", onOpenAuth as EventListener);
    return () => window.removeEventListener("luigara:auth:open", onOpenAuth as EventListener);
  }, []);

  // >>> Animação do carrinho quando item é adicionado
  useEffect(() => {
    const onCartAdd = () => {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    };
    window.addEventListener("luigara:cart:add", onCartAdd as EventListener);
    return () => window.removeEventListener("luigara:cart:add", onCartAdd as EventListener);
  }, []);

  // >>> Força re-render quando autenticação mudar
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[TopBar] 🔄 Forçando re-render após mudança de autenticação');
      // Sincroniza novamente após mudança de autenticação
      if (isAuthenticated) {
        dispatch(syncWishlistFromBackend());
        dispatch(syncCartFromBackend());
      }
    };
    window.addEventListener("luigara:auth:changed", handleAuthChange as EventListener);
    return () => window.removeEventListener("luigara:auth:changed", handleAuthChange as EventListener);
  }, [isAuthenticated, dispatch]);

  return (
    <div className="bg-white border-b relative">
      {/* faixa superior com links principais + logo + ícones */}
      <div className="container mx-auto flex justify-between items-center px-4 py-3 md:gap-4">
        {/* Menu mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-2xl text-black mr-2"
          aria-label={t("openMenu")}
        >
          <FiMenu />
        </button>

        {/* Links principais (desktop) - Identidades */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/mulher" 
            className={`transition-all tracking-wide relative pb-1 ${
              isIdentityActive('mulher') 
                ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' 
                : 'text-black hover:text-gray-600'
            }`}
          >
            {tId("mulher")}
          </Link>
          <Link 
            href="/homem" 
            className={`transition-all tracking-wide relative pb-1 ${
              isIdentityActive('homem') 
                ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' 
                : 'text-black hover:text-gray-600'
            }`}
          >
            {tId("homem")}
          </Link>
          <Link 
            href="/unissex" 
            className={`transition-all tracking-wide relative pb-1 ${
              isIdentityActive('unissex') 
                ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' 
                : 'text-black hover:text-gray-600'
            }`}
          >
            {tId("unissex")}
          </Link>
          <Link 
            href="/kids" 
            className={`transition-all tracking-wide relative pb-1 ${
              isIdentityActive('kids') 
                ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' 
                : 'text-black hover:text-gray-600'
            }`}
          >
            {tId("kids")}
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
          {/* Dashboard Admin - apenas para ADMIN e desktop */}
          {mounted && profile?.role === "ADMIN" && (
            <div className="hidden md:block">
              <AdminDashboardIcon />
            </div>
          )}

          {/* Idioma - apenas desktop */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Usuário: modal ou dropdown */}
          {!user ? (
            <button onClick={() => setIsAuthOpen(true)} aria-label={t("openLogin")}>
              <FiUser className="text-black hover:text-gray-600 transition-colors" />
            </button>
          ) : (
            <UserMenu user={user} avatarUrl={profile?.image ?? null} gender={profile?.gender} onLogout={logout} />
          )}

          {/* Favoritos com contador (-> /produtos/favoritos) */}
          <Link
            href="/produtos/favoritos"
            className="relative text-black hover:text-gray-600 transition-colors"
            aria-label={t("wishlist")}
            data-wishlist-icon
          >
            <FiHeart />
            {mounted && isAuthenticated && wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-2 bg-black text-white text-[10px] leading-[16px] rounded-full min-w-[16px] h-[16px] px-1 text-center"
                aria-label={t("wishlistCount", { count: wishlistCount })}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Carrinho com contador dinâmico (-> /carrinho) */}
          <Link
            href="/carrinho"
            className={`relative text-black hover:text-gray-600 transition-all duration-300 ${
              cartBounce ? 'animate-[bounce_0.6s_ease-in-out_1] bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-1' : ''
            }`}
            aria-label={t("cart")}
            data-cart-icon
          >
            <FiShoppingBag className={`transition-transform duration-300 ${cartBounce ? 'scale-110' : ''}`} />
            {mounted && isAuthenticated && cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-2 bg-black text-white text-[10px] leading-[16px] rounded-full min-w-[16px] h-[16px] px-1 text-center transition-all duration-300 ${
                  cartBounce ? 'scale-125' : ''
                }`}
                aria-label={t("cartCount", { count: cartCount })}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Overlay do menu mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" 
          onClick={() => setIsOpen(false)}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Drawer mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="text-lg font-semibold text-black">{t("menu")}</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-black" aria-label={t("closeMenu")}>
            <FiX />
          </button>
        </div>

        {/* Links principais - Identidades */}
        <nav className="px-4 py-4 space-y-4 text-black font-medium border-b">
          <Link 
            href="/mulher" 
            onClick={() => setIsOpen(false)} 
            className={`block tracking-wide transition-colors ${
              isIdentityActive('mulher') ? 'font-bold text-black border-l-4 border-black pl-2' : 'hover:text-gray-600'
            }`}
          >
            {tId("mulher")}
          </Link>
          <Link 
            href="/homem" 
            onClick={() => setIsOpen(false)} 
            className={`block tracking-wide transition-colors ${
              isIdentityActive('homem') ? 'font-bold text-black border-l-4 border-black pl-2' : 'hover:text-gray-600'
            }`}
          >
            {tId("homem")}
          </Link>
          <Link 
            href="/unissex" 
            onClick={() => setIsOpen(false)} 
            className={`block tracking-wide transition-colors ${
              isIdentityActive('unissex') ? 'font-bold text-black border-l-4 border-black pl-2' : 'hover:text-gray-600'
            }`}
          >
            {tId("unissex")}
          </Link>
          <Link 
            href="/kids" 
            onClick={() => setIsOpen(false)} 
            className={`block tracking-wide transition-colors ${
              isIdentityActive('kids') ? 'font-bold text-black border-l-4 border-black pl-2' : 'hover:text-gray-600'
            }`}
          >
            {tId("kids")}
          </Link>
        </nav>

        {/* Categorias */}
        <div className="px-4 py-4 border-b">
          <h3 className="text-lg font-semibold text-black mb-4">{t("categories")}</h3>
          <Categorias mobile onItemClick={() => setIsOpen(false)} />
        </div>

        {/* Links adicionais */}
        <nav className="px-4 py-4 space-y-4 text-black font-medium">
          {/* Dashboard Admin - apenas para ADMIN */}
          {mounted && profile?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 hover:text-gray-600 tracking-wide group"
            >
              <div className="relative">
                <RiDashboardLine className="text-xl" />
                <div className="absolute inset-0 -m-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-full h-full animate-spin-slow">
                    <svg className="w-full h-full" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeOpacity="0.3"
                        strokeDasharray="60 30"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {t("adminDashboard")}
            </Link>
          )}

          <LanguageSwitcher variant="list" onChange={() => setIsOpen(false)} />
        </nav>
      </div>

      {/* BottomBar original */}
      <BottomBar />

      {/* Modal de autenticação */}
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

const TopBar = () => {
  return (
    <Suspense fallback={
      <div className="bg-white border-b relative">
        <div className="container mx-auto flex justify-between items-center px-4 py-3 md:gap-4">
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    }>
      <TopBarContent />
    </Suspense>
  );
};

export default TopBar;
