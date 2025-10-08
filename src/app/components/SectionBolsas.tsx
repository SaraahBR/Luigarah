"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetBolsasQuery } from "@/store/productsApi";

type Props = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  maxItems?: number; 
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function SectionBolsas({
  title,
  subtitle,
  ctaText = "Ver todas",
  ctaHref = "/produtos/bolsas",
  maxItems = 4,
}: Props) {
  const { data: produtos = [], isLoading } = useGetBolsasQuery();
  
  const produtosFiltrados = produtos.slice(0, maxItems);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: maxItems }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="aspect-[4/5] rounded-xl bg-zinc-200"></div>
              <div className="mt-4 space-y-2">
                <div className="h-4 rounded bg-zinc-200"></div>
                <div className="h-4 w-3/4 rounded bg-zinc-200"></div>
                <div className="h-4 w-1/2 rounded bg-zinc-200"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  } 

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
        </div>
        <Link
          href={ctaHref}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          {ctaText}
        </Link>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {produtosFiltrados.map((p, idx) => (
          <article key={p.id} className="group">
            <Link href={`/produtos/bolsas/detalhes/${p.id}`} className="block focus:outline-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={p.imagem ?? ""}
                  alt={`${p.titulo} — ${p.descricao ?? ""}`}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                  priority={idx < 2}
                  loading={idx < 2 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                />
                <Image
                  src={p.imagemHover ?? p.imagem ?? ""}
                  alt={`${p.titulo} — ${p.descricao ?? ""} (detalhe)`}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">{p.titulo}</h3>
                <p className="mt-1 text-zinc-700">{p.descricao ?? ""}</p>
                <p className="mt-4 text-zinc-900">{formatBRL(p.preco ?? 0)}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
