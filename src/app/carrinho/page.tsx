"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  increment,
  decrement,
  remove,
  clear,
  migrateLegacy,
  type CartItem,
} from "@/store/cartSlice";
import type { AppDispatch } from "@/store";
import type { Tipo } from "@/store/wishlistSlice";
import { useRouter } from "next/navigation";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

function keyToIdTipo(key: string): { id: number; tipo: Tipo } | null {
  const parts = key.split(":");
  if (parts.length !== 2) return null;
  const tipo = parts[0] as Tipo;
  const id = Number(parts[1]);
  if (!Number.isFinite(id)) return null;
  return { id, tipo };
}

export default function CarrinhoPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const [cupom, setCupom] = useState<string>("");

  // Migração do localStorage legado (luigara:cart) na 1ª carga
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("luigara:cart");
      if (raw) {
        const legacy: Array<{ id: number; qty: number }> = JSON.parse(raw);
        if (Array.isArray(legacy) && legacy.length > 0) {
          // migra sem saber "tipo" — cai no default "bolsas" no reducer
          dispatch(migrateLegacy(legacy));
        }
        localStorage.removeItem("luigara:cart");
      }
    } catch {
      // silencia erros de parse
    }
  }, [dispatch]);

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
    // aqui você poderia validar estoque, endereço, etc.
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
                  onClick={() => dispatch(clear())}
                  className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
                >
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
    </section>
  );
}

function LinhaCarrinho({ item }: { item: CartItem }) {
  const dispatch = useDispatch<AppDispatch>();
  const meta = keyToIdTipo(item.key);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-200 p-3">
      {/* thumb */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
        {item.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.img} alt={item.title ?? "Produto"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">sem foto</div>
        )}
      </div>

      {/* infos */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">{item.title ?? `#${item.id}`}</p>
          {typeof item.preco === "number" && (
            <p className="text-sm font-medium">
              {(item.preco * item.qty).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              })}
            </p>
          )}
        </div>
        {item.subtitle && <p className="text-xs text-zinc-500">{item.subtitle}</p>}

        {/* controles */}
        <div className="mt-2 flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-zinc-300">
            <button
              className="px-2 py-1 text-sm"
              onClick={() => meta && dispatch(decrement({ id: meta.id, tipo: meta.tipo }))}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm">{item.qty}</span>
            <button
              className="px-2 py-1 text-sm"
              onClick={() => meta && dispatch(increment({ id: meta.id, tipo: meta.tipo }))}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <button
            className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
            onClick={() => meta && dispatch(remove({ id: meta.id, tipo: meta.tipo }))}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
