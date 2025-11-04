"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { clear, remove, selectWishlistItems } from "@/store/wishlistSlice";
import { Loader2, Heart, ShoppingBag } from "lucide-react";
import SimpleLoader from "@/app/components/SimpleLoader";
import listaDesejoApi, { ListaDesejoItemDTO } from "@/hooks/api/listaDesejoApi";
import authApi from "@/hooks/api/authApi";

type Tipo = "roupas" | "bolsas" | "sapatos";

const formatBRL = (price: number) =>
  price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }) || "R$ 0";

export default function FavoritosPage() {
  const items = useSelector(selectWishlistItems);
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [backendItems, setBackendItems] = useState<ListaDesejoItemDTO[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // Buscar dados completos do backend
  useEffect(() => {
    const fetchBackendData = async () => {
      if (!authApi.isAuthenticated()) {
        setIsLoadingBackend(false);
        return;
      }

      try {
        const data = await listaDesejoApi.listarItens();
        setBackendItems(data);
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      } finally {
        setIsLoadingBackend(false);
      }
    };

    fetchBackendData();
  }, [items.length]); // Recarrega quando a quantidade de itens mudar

  const detailsHref = (tipo: Tipo, id: number) => {
    return `/produtos/${tipo}/detalhes/${id}`;
  };
  
  const handleRemoveItem = async (id: number, tipo: Tipo, backendId?: number) => {
    const key = `${tipo}:${id}`;
    setRemovingItems(prev => new Set(prev).add(key));
    
    try {
      await dispatch(remove({ id, tipo, backendId })).unwrap();
      // Remove do estado local também
      setBackendItems(prev => prev.filter(item => item.produto.id !== id));
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };
  
  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      await dispatch(clear()).unwrap();
      setBackendItems([]);
    } finally {
      setIsClearingAll(false);
    }
  };

  if (isLoadingBackend) {
    return <SimpleLoader isLoading={true} />;
  }

  return (
    <main className="bg-white text-zinc-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Minha Wishlist</h1>
            <p className="text-sm text-gray-600 mt-1">
              {backendItems.length} {backendItems.length === 1 ? 'item' : 'itens'} salvos
            </p>
          </div>
          {backendItems.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isClearingAll && <Loader2 className="w-4 h-4 animate-spin" />}
              Limpar tudo
            </button>
          )}
        </div>

        {backendItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Sua Wishlist está vazia</h2>
            <p className="text-gray-600 mb-6">
              Explore nossas coleções e adicione seus produtos favoritos
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                href="/produtos/roupas" 
                className="rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Ver Roupas
              </Link>
              <Link 
                href="/produtos/bolsas" 
                className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Ver Bolsas
              </Link>
              <Link 
                href="/produtos/sapatos" 
                className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Ver Sapatos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 min-[525px]:gap-4 sm:gap-4 min-[723px]:gap-4.5 min-[770px]:gap-5 md:gap-5 lg:gap-6 min-[1200px]:gap-7 min-[1247px]:gap-7.5 xl:gap-8 min-[525px]:grid-cols-2 sm:grid-cols-2 min-[723px]:grid-cols-2 min-[770px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {backendItems.map((item) => {
              const produto = item.produto;
              const tipo: Tipo = (produto.categoria?.toLowerCase() as Tipo) || "roupas";
              const key = `${tipo}:${produto.id}`;
              const href = detailsHref(tipo, produto.id);
              const isRemoving = removingItems.has(key);

              return (
                <article key={key} className="group relative">
                  {/* Overlay de loading */}
                  {isRemoving && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
                        <p className="text-xs text-gray-600 font-medium">Removendo...</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <Link href={href} className="block focus:outline-none">
                      {/* Imagem do produto */}
                      <div className="aspect-[4/5] relative bg-gray-100 flex-shrink-0 overflow-hidden">
                        {produto.imagem && (
                          <>
                            {/* Imagem principal */}
                            <Image
                              src={produto.imagem}
                              alt={`${produto.titulo} — ${produto.descricao}`}
                              fill
                              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                            />
                            {/* Imagem hover */}
                            {produto.imagemHover && (
                              <Image
                                src={produto.imagemHover}
                                alt={`${produto.titulo} — ${produto.descricao} (detalhe)`}
                                fill
                                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                              />
                            )}
                          </>
                        )}

                        {/* Botão de remover favorito - PRETO */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveItem(produto.id, tipo, item.id);
                          }}
                          disabled={isRemoving}
                          className="absolute top-3 right-3 z-[1] p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remover dos favoritos"
                        >
                          <Heart className="w-5 h-5 fill-black text-black" />
                        </button>
                      </div>
                    </Link>

                    {/* Linha divisória */}
                    <div className="h-px bg-gray-200"></div>

                    {/* Informações do produto */}
                    <div className="p-3 min-[525px]:p-4 sm:p-4 min-[723px]:p-4.5 min-[746px]:p-4.5 min-[770px]:p-4.5 md:p-4.5 lg:p-5 min-[1200px]:p-5 min-[1247px]:p-5 xl:p-5 flex-1 flex flex-col">
                      <Link href={href} className="flex-1">
                        {/* Tipo/Categoria */}
                        <div className="text-xs min-[525px]:text-xs sm:text-xs md:text-[0.7rem] text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                          {tipo}
                        </div>
                        
                        {/* Título (Marca) */}
                        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 group-hover:text-black transition-colors text-sm min-[525px]:text-[0.95rem] sm:text-[0.98rem] min-[723px]:text-[0.99rem] min-[746px]:text-[0.995rem] min-[770px]:text-base md:text-base lg:text-[1.05rem] min-[1200px]:text-[1.08rem] min-[1247px]:text-[1.09rem] line-clamp-2">
                          {produto.titulo}
                        </h3>
                        
                        {/* Descrição */}
                        <p className="text-xs min-[525px]:text-[0.8rem] sm:text-[0.82rem] min-[723px]:text-[0.84rem] min-[746px]:text-[0.845rem] min-[770px]:text-[0.85rem] md:text-sm lg:text-[0.9rem] min-[1200px]:text-[0.92rem] min-[1247px]:text-[0.93rem] text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                          {produto.descricao}
                        </p>
                        
                        {/* Preço e Autor */}
                        <div className="space-y-1 min-[525px]:space-y-1.5 sm:space-y-1.5 min-[1200px]:space-y-2 min-[1247px]:space-y-2 mt-auto">
                          <span className="block text-base min-[525px]:text-[1.05rem] sm:text-[1.08rem] min-[723px]:text-[1.1rem] min-[746px]:text-[1.12rem] min-[770px]:text-lg md:text-lg lg:text-[1.15rem] min-[1200px]:text-[1.18rem] min-[1247px]:text-[1.19rem] xl:text-xl font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-black group-hover:via-gray-700 group-hover:to-black transition-all duration-300">
                            {formatBRL(produto.preco)}
                          </span>
                          {produto.autor && (
                            <div className="text-xs min-[525px]:text-[0.75rem] sm:text-[0.78rem] min-[723px]:text-[0.8rem] min-[746px]:text-[0.81rem] md:text-sm min-[1200px]:text-[0.88rem] min-[1247px]:text-[0.89rem] text-gray-500">
                              {produto.autor}
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Botão de ver detalhes */}
                      <Link
                        href={href}
                        className="mt-3 min-[525px]:mt-4 sm:mt-4 flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 min-[525px]:py-2.5 sm:py-2.5 text-xs min-[525px]:text-sm sm:text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 min-[525px]:w-4 min-[525px]:h-4 sm:w-4 sm:h-4" />
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Loading ao limpar todos */}
      <SimpleLoader isLoading={isClearingAll} />
    </main>
  );
}
