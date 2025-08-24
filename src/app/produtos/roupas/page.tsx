"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RoupasLayout from "./tailwind";
import roupasData from "../../../data/roupas.json";
import HeartButton from "./../../components/HeartButton";
import FiltersSidebar from "./FiltersSidebar";

type Produto = {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  preco: number;
  img: string;
  imgHover?: string;
  tamanho?: string;
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const PAGE_TITLE = "Roupas de Luxo";
const PAGE_SUBTITLE =
  "O melhor em roupas femininas da moda mundial reunidas em uma seleção online LUIGARAH. Descubra o estilo e alto padrão de peças que transmitem talento criativo e conceito inovador de marcas de roupa nacionais e importadas que movimentam a moda internacional. Uma coleção surpreendente que traz desde roupas Dolce Gabbana até a elegância cosmopolita das peças Stella McCartney e a sofisticação de Givenchy. A LUIGARAH traz todas as tendências da moda atual e dos melhores designers do mundo. ";

type SortKey = "nossa" | "novidades" | "maior" | "menor";

function guessDimension(subtitle: string): "Grande" | "Média" | "Pequena" | "Mini" {
  const s = subtitle.toLowerCase();
  if (s.includes("mini")) return "Mini";
  if (s.includes("maxi") || s.includes("trench") || s.includes("jaqueta") || s.includes("casaco")) return "Grande";
  return "Média";
}

export default function Page() {
  const produtos = (roupasData as { produtos: Produto[] }).produtos;

  const CATEGORIAS = Array.from(new Set(produtos.map((p) => p.subtitle))).filter(Boolean);
  const MARCAS = Array.from(new Set(produtos.map((p) => p.title))).filter(Boolean);

  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topPills = [
    ...CATEGORIAS.map((c) => ({ kind: "categoria" as const, label: c })),
    ...MARCAS.slice(0, 3).map((m) => ({ kind: "marca" as const, label: m })),
  ];

  const toggleCategoria = (c: string) =>
    setSelectedCategorias((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleMarca = (m: string) =>
    setSelectedMarcas((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleDimension = (d: string) =>
    setSelectedDimensions((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const clearAll = () => {
    setSelectedCategorias([]);
    setSelectedMarcas([]);
    setSelectedSizes([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let arr = [...produtos];

    if (selectedCategorias.length > 0) arr = arr.filter((p) => selectedCategorias.includes(p.subtitle));
    if (selectedMarcas.length > 0) arr = arr.filter((p) => selectedMarcas.includes(p.title));
    if (selectedDimensions.length > 0) arr = arr.filter((p) => selectedDimensions.includes(guessDimension(p.subtitle)));
    if (selectedSizes.length > 0) arr = arr.filter((p) => p.tamanho && selectedSizes.includes(p.tamanho));

    switch (sortBy) {
      case "novidades": arr.sort((a, b) => b.id - a.id); break;
      case "maior": arr.sort((a, b) => b.preco - a.preco); break;
      case "menor": arr.sort((a, b) => a.preco - b.preco); break;
      case "nossa":
      default: arr.sort((a, b) => a.id - b.id);
    }

    return arr;
  }, [produtos, selectedCategorias, selectedMarcas, selectedDimensions, selectedSizes, sortBy]);

  return (
    <RoupasLayout
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      topBar={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Todos os filtros <span className="ml-1 text-xs">▼</span>
          </button>

          {topPills.map((pill) => {
            const active =
              pill.kind === "categoria" ? selectedCategorias.includes(pill.label) : selectedMarcas.includes(pill.label);
            return (
              <button
                key={pill.kind + pill.label}
                onClick={() => (pill.kind === "categoria" ? toggleCategoria(pill.label) : toggleMarca(pill.label))}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:bg-zinc-50",
                ].join(" ")}
              >
                {pill.label}
              </button>
            );
          })}

          <div className="ml-auto">
            <label className="mr-2 text-sm text-zinc-600">Ordenar por</label>
            <select
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="nossa">Nossa seleção</option>
              <option value="novidades">Novidades</option>
              <option value="maior">Maior preço</option>
              <option value="menor">Menor preço</option>
            </select>
          </div>
        </div>
      }
      filtersDrawer={
        <FiltersSidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedSizes={selectedSizes}
          selectedDimensions={selectedDimensions}
          onToggleSize={toggleSize}
          onToggleDimension={toggleDimension}
          onClearAll={clearAll}
        />
      }
    >
      {filtrados.map((p, idx) => (
        <article key={p.id} className="group">
          <Link href={`/produtos/roupas/detalhes/${p.id}`} className="block focus:outline-none">
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
              <HeartButton id={p.id} label={`${p.title} ${p.subtitle}`} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-xs text-zinc-500">{p.subtitle} • {p.author}</p>
              <p className="mt-1 text-zinc-700">{p.description}</p>
              <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
            </div>
          </Link>
        </article>
      ))}
    </RoupasLayout>
  );
}
