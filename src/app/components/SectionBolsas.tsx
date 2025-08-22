"use client";

import Image from "next/image";
import HeartButton from "../components/HeartButton";
import bolsasData from "../../data/bolsas.json";

type Produto = {
  id: number;
  title: string;       // marca
  subtitle: string;    // categoria (Tiracolo, Transversal, Tote, etc.)
  author: string;      // designer/estilista
  description: string; // nome do produto
  preco: number;
  img: string;         // imagem principal
  imgHover?: string;   // imagem ao passar o mouse (fallback: img)
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function SectionBolsas({
  title = "Bolsas de Luxo – Luigara",
  subtitle = "Ícones e novidades em tiracolo, transversal e tote.",
  ctaText = "Ver todas",
  ctaHref = "/produtos/bolsas",
}: {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  const produtos = (bolsasData as { produtos: Produto[] }).produtos;
  const produtosOrdenados = [...produtos].sort((a, b) => a.id - b.id);

  return (
    <section className="min-h-[60vh] bg-white text-zinc-900 py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-zinc-600">{subtitle}</p>
          </div>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 transition"
          >
            {ctaText}
          </a>
        </div>

        {/* Grid de produtos */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtosOrdenados.map((p, idx) => (
            <article key={p.id} className="group">
              {/* Imagens: hover-swap */}
              <div className="relative overflow-hidden rounded-xl bg-zinc-100 aspect-[4/5]">
                <Image
                  src={p.img}
                  alt={`${p.title} — ${p.description}`}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                  priority={idx === 0}
                />
                <Image
                  src={p.imgHover ?? p.img}
                  alt={`${p.title} — ${p.description} (detalhe)`}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                />

                {/* Coração funcional */}
                <HeartButton id={p.id} label={`${p.title} ${p.subtitle}`} />
              </div>

              {/* Texto */}
              <div className="mt-4">
                <h3 className="font-semibold">{p.title}</h3>
                {/* <p className="text-xs text-zinc-500">{p.subtitle} • {p.author}</p> */}
                <p className="mt-1 text-zinc-700">{p.description}</p>
                <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
