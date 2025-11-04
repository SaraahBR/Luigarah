"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  increment,
  decrement,
  remove,
  clear,
  changeCartItemSize,
  type CartItem,
} from "@/store/cartSlice";
import type { AppDispatch } from "@/store";
import type { Tipo } from "@/store/wishlistSlice";
import { useRouter } from "next/navigation";
import { useListarEstoqueProdutoQuery } from "@/hooks/api/produtosApi";
import type { ProdutoTamanhoDTO } from "@/hooks/api/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Loader2 } from "lucide-react";
import SimpleLoader from "../components/SimpleLoader";

// Auth + gatilho do modal
import { useAuthUser } from "@/app/login/useAuthUser";
import { requestLogin } from "@/app/login/loginModal";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

function keyToIdTipo(key: string): { id: number; tipo: Tipo; tamanhoId?: number } | null {
  const parts = key.split(":");
  // Agora aceita tanto 2 partes ("tipo:id") quanto 3 partes ("tipo:id:tamanhoId")
  if (parts.length < 2 || parts.length > 3) return null;
  const tipo = parts[0] as Tipo;
  const id = Number(parts[1]);
  if (!Number.isFinite(id)) return null;
  
  // Se tiver 3 partes, extrai o tamanhoId
  const tamanhoId = parts[2] ? Number(parts[2]) : undefined;
  
  return { id, tipo, tamanhoId };
}

export default function CarrinhoPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthUser();

  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const [cupom, setCupom] = useState<string>("");
  
  // Estados de loading
  const [isClearingCart, setIsClearingCart] = useState(false);

  // Migração do localStorage legado (luigara:cart) na 1ª carga
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("luigara:cart");
      if (raw) {
        // Remove localStorage legado (migração foi feita em versão anterior)
        localStorage.removeItem("luigara:cart");
      }
    } catch {
      // silencia erros de parse
    }
  }, []);

  const desconto = useMemo<number>(() => {
    // cupom simples: LUX10 -> 10% de desconto
    if (cupom.trim().toUpperCase() === "LUX10") {
      return subtotal * 0.1;
    }
    return 0;
  }, [cupom, subtotal]);

  const frete = subtotal > 0 ? 29 : 0;
  const total = Math.max(0, subtotal - desconto) + (subtotal > 0 ? frete : 0);

  const finalizarCompra = () => {
    if (!isAuthenticated) {
      requestLogin("É necessário estar logado para finalizar a compra.");
      return;
    }
    router.push("/checkout/sucesso");
  };

  return (
    <section className="bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold">Seu carrinho</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-zinc-200 p-6">
            <p className="text-zinc-600">Seu carrinho está vazio.</p>
            <div className="mt-4 flex gap-3">
              <Link href="/produtos/bolsas" className="rounded-md bg-zinc-900 px-4 py-2 text-white text-sm">
                Ver bolsas
              </Link>
              <Link href="/produtos/roupas" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
                Ver roupas
              </Link>
              <Link href="/produtos/sapatos" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
                Ver sapatos
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Lista */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((it) => (
                <LinhaCarrinho key={it.key} item={it} />
              ))}

              <div className="flex justify-between">
                <button
                  onClick={async () => {
                    setIsClearingCart(true);
                    try {
                      await dispatch(clear()).unwrap();
                    } finally {
                      setIsClearingCart(false);
                    }
                  }}
                  disabled={isClearingCart}
                  className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isClearingCart && <Loader2 className="w-3 h-3 animate-spin" />}
                  Limpar carrinho
                </button>
              </div>
            </div>

            {/* Resumo */}
            <aside className="lg:col-span-4">
              <div className="rounded-lg border border-zinc-200 p-4">
                <h2 className="text-lg font-medium">Resumo</h2>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="cupom" className="text-zinc-700">Cupom</label>
                    <input
                      id="cupom"
                      value={cupom}
                      onChange={(e) => setCupom(e.target.value)}
                      placeholder="LUX10"
                      className="w-40 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex justify-between">
                    <span>Desconto</span>
                    <span className={desconto > 0 ? "text-green-700" : "text-zinc-700"}>
                      -{formatBRL(desconto)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>{formatBRL(frete)}</span>
                  </div>

                  <hr className="my-2" />

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                </div>

                <button
                  className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-white text-sm font-medium hover:bg-black"
                  onClick={finalizarCompra}
                >
                  Finalizar compra
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Pedidos postados em até 2 dias úteis. Prazos simulados no próximo passo.
              </p>
            </aside>
          </div>
        )}
      </div>
      
      {/* Loading ao limpar carrinho */}
      <SimpleLoader isLoading={isClearingCart} />
    </section>
  );
}

function LinhaCarrinho({ item }: { item: CartItem }) {
  const dispatch = useDispatch<AppDispatch>();
  const meta = keyToIdTipo(item.key);
  
  // Estados de loading específicos deste item
  const [isChangingSize, setIsChangingSize] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Estado para controlar o popover de tamanhos
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Busca tamanhos disponíveis apenas se for roupa/sapato
  const shouldFetchSizes = meta && (meta.tipo === 'roupas' || meta.tipo === 'sapatos');
  const { data: estoqueResponse } = useListarEstoqueProdutoQuery(
    shouldFetchSizes ? item.id : 0,
    { skip: !shouldFetchSizes }
  );

  // Converte para formato esperado
  const estoqueDados = estoqueResponse?.dados || [];
  const tamanhosDisponiveis = estoqueDados.map((t: ProdutoTamanhoDTO) => ({
    id: t.id,
    etiqueta: t.etiqueta || "",
    qtdEstoque: t.qtdEstoque || 0,
  }));

  // Função para mudar tamanho
  const handleSelectSize = async (novoTamanhoId: number, novaEtiqueta: string) => {
    if (!meta || !item.backendId || isChangingSize) return;
    
    // Fecha o popover IMEDIATAMENTE
    setIsPopoverOpen(false);
    
    setIsChangingSize(true);
    try {
      await dispatch(changeCartItemSize({
        id: meta.id,
        tipo: meta.tipo,
        backendId: item.backendId,
        quantidade: item.qty, // Mantém a quantidade atual
        novoTamanhoId: novoTamanhoId,
        novoTamanhoEtiqueta: novaEtiqueta,
      })).unwrap();
    } catch (error) {
      console.error('Erro ao alterar tamanho:', error);
    } finally {
      setIsChangingSize(false);
    }
  };
  
  // Função para remover item
  const handleRemove = async () => {
    if (!meta || isRemoving) return;
    
    setIsRemoving(true);
    try {
      await dispatch(remove({ 
        id: meta.id, 
        tipo: meta.tipo, 
        backendId: item.backendId 
      })).unwrap();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setIsRemoving(false); // Só reseta em caso de erro
    }
  };

  return (
    <>
      <div className="relative flex items-center gap-4 rounded-lg border border-zinc-200 p-3">
        {/* Overlay de loading */}
        {(isChangingSize || isRemoving) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <p className="text-xs text-zinc-600 font-medium">
                {isChangingSize ? 'Alterando tamanho...' : 'Removendo...'}
              </p>
            </div>
          </div>
        )}
        
        {/* thumb */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
          {item.img ? (
            <Image 
              src={item.img} 
              alt={item.title ?? "Produto"} 
              fill
              sizes="80px"
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">sem foto</div>
          )}
        </div>

        {/* infos */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.title ?? `#${item.id}`}</p>
              
              {/* Descrição do produto */}
              {item.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
              
              {/* Tamanho com popover para roupas/sapatos */}
              {shouldFetchSizes && item.subtitle ? (
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button 
                      disabled={isChangingSize || isRemoving}
                      className="flex items-center gap-1 text-xs text-zinc-600 mt-0.5 font-medium hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Tamanho: {item.subtitle}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-zinc-500 px-2 py-1">Selecione o tamanho:</p>
                      <div className="grid grid-cols-4 gap-1">
                        {tamanhosDisponiveis.map((tamanho) => {
                          const isCurrent = tamanho.id === item.tamanhoId;
                          const isOutOfStock = tamanho.qtdEstoque <= 0;
                          
                          return (
                            <button
                              key={tamanho.id}
                              onClick={() => !isOutOfStock && handleSelectSize(tamanho.id, tamanho.etiqueta)}
                              disabled={isOutOfStock}
                              className={`
                                px-3 py-2 text-xs font-medium rounded-md transition-all
                                ${isCurrent 
                                  ? 'bg-black text-white ring-2 ring-black' 
                                  : isOutOfStock
                                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed line-through'
                                    : 'bg-white border border-zinc-300 hover:border-black hover:bg-zinc-50'
                                }
                              `}
                            >
                              {tamanho.etiqueta}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : item.subtitle ? (
                <p className="text-xs text-zinc-600 mt-0.5 font-medium">{item.subtitle}</p>
              ) : (
                // Para produtos roupas/sapatos sem tamanho (itens antigos), mostrar aviso
                meta && (meta.tipo === 'roupas' || meta.tipo === 'sapatos') && (
                  <p className="text-xs text-amber-600 mt-0.5 font-medium italic">
                    ⚠️ Tamanho não selecionado - adicione novamente
                  </p>
                )
              )}
            </div>
            {typeof item.preco === "number" && (
              <p className="text-sm font-medium flex-shrink-0">
                {(item.preco * item.qty).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                })}
              </p>
            )}
          </div>

          {/* controles */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="inline-flex overflow-hidden rounded-md border border-zinc-300">
              <button
                disabled={isChangingSize || isRemoving}
                className="px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => meta && dispatch(decrement({ 
                  id: meta.id, 
                  tipo: meta.tipo, 
                  qty: Math.max(1, item.qty - 1),
                  backendId: item.backendId 
                }))}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm">{item.qty}</span>
              <button
                disabled={isChangingSize || isRemoving}
                className="px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => meta && dispatch(increment({ 
                  id: meta.id, 
                  tipo: meta.tipo, 
                  qty: item.qty + 1,
                  backendId: item.backendId 
                }))}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <button
              onClick={handleRemove}
              disabled={isChangingSize || isRemoving}
              className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
