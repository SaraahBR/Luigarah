"use client";

import Image from "next/image";
import Link from "next/link";
import bolsasData from "../../data/bolsas.json";

type Produto = {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  preco: number;
  img: string;
  imgHover?: string;
};

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
  const produtos = (bolsasData as { produtos: Produto[] }).produtos
    .slice(0, maxItems); 

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
        {produtos.map((p, idx) => (
          <article key={p.id} className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={p.img}
                alt={`${p.title} — ${p.description}`}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                priority={idx === 0}
              />
              <Image
                src={p.imgHover ?? p.img}
                alt={`${p.title} — ${p.description} (detalhe)`}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1 text-zinc-700">{p.description}</p>
              <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
