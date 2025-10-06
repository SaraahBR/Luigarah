"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { clear, remove, selectWishlistItems } from "@/store/wishlistSlice";

type Tipo = "roupas" | "bolsas" | "sapatos";
type ItemView = {
  id: number;
  tipo?: Tipo;
  title?: string;
  img?: string;
};

export default function FavoritosPage() {
  const items = useSelector(selectWishlistItems);
  const dispatch = useDispatch();

  const detailsHref = (it: { id: number; tipo?: Tipo }) => {
    const tipo = it.tipo ?? "roupas"; 
    return `/produtos/${tipo}/detalhes/${it.id}`;
  };

  return (
    <main className="bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Minha Wishlist</h1>
          {items.length > 0 && (
            <button
              onClick={() => dispatch(clear())}
              className="ml-auto rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Limpar tudo
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-zinc-600">
            Sua lista de desejos está vazia. Explore as{" "}
            <Link className="underline" href="/produtos/roupas">Roupas</Link>,{" "}
            <Link className="underline" href="/produtos/bolsas">Bolsas</Link>{" "}
            e{" "}
            <Link className="underline" href="/produtos/sapatos">Sapatos</Link>.
          </p>
        ) : (
          <>
            {/* Atalhos para continuar comprando */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/produtos/roupas" className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
                Ver Roupas
              </Link>
              <Link href="/produtos/bolsas" className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
                Ver Bolsas
              </Link>
              <Link href="/produtos/sapatos" className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
                Ver Sapatos
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((itRaw) => {
                const it = itRaw as ItemView; 
                const tipo: Tipo = it.tipo ?? "roupas"; 
                const key = `${tipo}:${it.id}`;         
                const href = detailsHref({ id: it.id, tipo });

                return (
                  <article key={key} className="group rounded-xl border border-zinc-200 p-3">
                    <Link href={href} className="block">
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-100">
                        {it.img && (
                          <Image
                            src={it.img}
                            alt={it.title ?? `Produto ${it.id}`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium">{it.title ?? `Produto #${it.id}`}</h3>
                        <span className="shrink-0 rounded-full border border-zinc-300 px-2 py-[2px] text-[10px] text-zinc-600">
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </span>
                      </div>
                    </Link>

                    <div className="mt-3 flex gap-2">
                      <Link
                        href={href}
                        className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white text-center hover:bg-black"
                      >
                        Ver detalhes
                      </Link>
                      <button
                        onClick={() => dispatch(remove({ id: it.id, tipo }))}
                        className="rounded-md border border-zinc-300 px-3 py-2 text-xs hover:bg-zinc-50"
                        aria-label="Remover"
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
