"use client";

import { memo, useState, useRef, useEffect, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { add as addCartItem, remove as removeCartItem } from "@/store/cartSlice";
import type { Tipo } from "@/store/wishlistSlice";
import { toast } from "sonner";
import { useAuthUser } from "@/app/login/useAuthUser";
import { openAuthModal } from "@/app/login/openAuthModal";
import { FiShoppingBag } from "react-icons/fi";
import SizeStockModal from "./SizeStockModal";
import { useListarEstoqueProdutoQuery } from "@/hooks/api/produtosApi";

type Props = {
  id: number;
  tipo: Tipo;
  preco?: number;
  title?: string;
  subtitle?: string;
  img?: string;
  onAdded?: (position: { x: number; y: number }) => void;
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
  const [frozenState, setFrozenState] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // ✅ Para forçar re-render
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Verificação de autenticação
  const { isAuthenticated } = useAuthUser();

  // ✅ Listener para atualizar quando autenticação mudar
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[CartButtonCircle] 🔄 Auth changed - forçando re-render');
      forceUpdate(); // Força re-render
    };

    window.addEventListener('luigara:auth:changed', handleAuthChange);
    return () => window.removeEventListener('luigara:auth:changed', handleAuthChange);
  }, []);

  // Buscar estoque do produto
  const { data: estoqueResponse } = useListarEstoqueProdutoQuery(id, {
    skip: !id,
  });

  const estoqueDados = estoqueResponse?.dados || [];
  const tamanhosComEstoque = estoqueDados.map((item) => ({
    id: item.id,
    etiqueta: item.etiqueta || "",
    qtdEstoque: item.qtdEstoque || 0,
  }));

  // Para bolsas, pegar estoque único
  const isBolsa = tipo === "bolsas";
  const estoqueBolsa = isBolsa
    ? estoqueDados.find(
        (e) =>
          !e.etiqueta ||
          e.etiqueta.trim() === "" ||
          e.etiqueta.toLowerCase() === "unico"
      )?.qtdEstoque || 0
    : 0;

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

    // Se já está no carrinho, remove
    if (isInCart) {
      handleRemoveFromCart();
      return;
    }

    // Se não está no carrinho, abre modal para selecionar tamanho/quantidade
    setShowModal(true);
  };

  const handleRemoveFromCart = () => {
    const wasInCart = isInCart;

    // CONGELA o estado visual durante o loading
    setFrozenState(wasInCart);

    // Mostra notificação IMEDIATAMENTE
    toast("Removido do carrinho", { description: title });

    // Marca como loading
    setIsLoading(true);

    const minLoadingTime = 500;
    const startTime = Date.now();

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
        setFrozenState(null);
      }, remaining);
    });
  };

  const handleModalConfirm = (data: {
    tamanhoId?: number;
    tamanhoLabel?: string;
    quantidade: number;
  }) => {
    // Captura posição do botão para animação
    let buttonPosition = { x: 0, y: 0 };
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      buttonPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    // CONGELA o estado
    setFrozenState(false); // Era "não no carrinho"

    // Mostra notificação
    toast.success("Adicionado ao carrinho", { description: title });

    // Loading
    setIsLoading(true);

    const minLoadingTime = 500;
    const startTime = Date.now();

    // Monta subtítulo com tamanho se aplicável
    let finalSubtitle = "";
    
    if (data.tamanhoLabel) {
      // Se tem tamanho selecionado
      if (subtitle && subtitle.trim()) {
        // Se tem descrição, adiciona: "Descrição • Tam: 36"
        finalSubtitle = `${subtitle.trim()} • Tam: ${data.tamanhoLabel}`;
      } else {
        // Se não tem descrição, adiciona apenas: "Tam: 36"
        finalSubtitle = `Tam: ${data.tamanhoLabel}`;
      }
    } else {
      // Se não tem tamanho, usa a descrição original
      finalSubtitle = subtitle || "";
    }

    dispatch(
      addCartItem({
        id,
        tipo,
        qty: data.quantidade,
        title,
        subtitle: finalSubtitle,
        img,
        preco,
        tamanhoId: data.tamanhoId,
      })
    ).finally(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      setTimeout(() => {
        setIsLoading(false);
        setFrozenState(null);

        // Dispara a animação
        onAdded?.(buttonPosition);

        // Evento para animar carrinho
        window.dispatchEvent(new CustomEvent("luigara:cart:add"));
      }, remaining);
    });
  };

  return (
    <>
      <button 
        ref={buttonRef}
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

      {/* Modal de seleção de tamanho/quantidade */}
      <SizeStockModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        produto={{
          id,
          titulo: title || "",
          subtitulo: subtitle,
          preco: preco || 0,
          imagem: img || "",
          tipo,
        }}
        tamanhosComEstoque={tamanhosComEstoque}
        estoqueBolsa={estoqueBolsa}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}

export default memo(CartButtonCircleBase);
