"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import BolsasLayout from "./tailwind";
import bolsasData from "../../../data/bolsas.json";
import HeartButton from "./../../components/HeartButton";
import FiltersSidebar from "./FiltersSidebar"; // agora é somente drawer (mobile/desktop), sem sidebar fixa

type Produto = {
  id: number;
  title: string;       // marca
  subtitle: string;    // categoria (Tiracolo, Transversal, etc.)
  author: string;      // designer/estilista
  description: string; // nome do produto
  preco: number;
  img: string;         // imagem principal
  imgHover?: string;   // imagem ao passar o mouse (fallback: img)
  // Opcional futuro: tamanho?: "XXXS"|"XXS"|"XS"|"S"|"M"|"L"|"XL";
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

// Cabeçalho
const PAGE_TITLE = "Bolsas de Luxo";
const PAGE_SUBTITLE =
  "A LUIGARAH oferece uma seleção excepcional de bolsas de grife, desde os modelos clássicos que transcendem as tendências até os estilos vintage que dominam as listas de desejos. As bolsas MICHAEL Michael Kors ostentam orgulhosamente o icônico logotipo MK em suas criações. Enquanto a Saint Laurent apresenta modelos elegantes com o famoso monograma YSL. Descubra também as bolsas Gucci, que exibem seus designs inconfundíveis. Nossa curadoria de bolsas femininas abrange uma variedade de estilos, incluindo bolsas tote para o dia a dia, bolsas tiracolo que aliam praticidade e elegância, bem como mochilas e pochetes. Explore a nossa seleção e descubra a bolsa icônica que complementará o seu visual.";

const CATEGORIAS: string[] = ["Tiracolo", "Transversal", "Ombro", "Tote", "Mini", "Clutch"];
const MARCAS: string[] = [
  "Gucci",
  "Saint Laurent",
  "Zadig&Voltaire",
  "DeMellier",
  "Prada",
  "Miu Miu",
  "Dolce & Gabbana",
];

type SortKey = "nossa" | "novidades" | "maior" | "menor";

function guessDimension(subtitle: string): "Grande" | "Média" | "Pequena" | "Mini" {
  if (subtitle.toLowerCase() === "mini") return "Mini";
  if (subtitle.toLowerCase() === "tote") return "Grande";
  // Transversal, Tiracolo, Ombro, Clutch, etc...
  return "Média";
}

export default function Page() {
  const produtos = (bolsasData as { produtos: Produto[] }).produtos;

  // Estado de filtros
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]); // 
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]); 
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pílulas do topo
  const topPills = [
    ...CATEGORIAS.map((c) => ({ kind: "categoria" as const, label: c })),
    { kind: "marca" as const, label: "Prada" },
    { kind: "marca" as const, label: "Miu Miu" },
    { kind: "marca" as const, label: "Dolce & Gabbana" },
  ];

  // Toggle helpers (categorias/marcas)
  const toggleCategoria = (c: string) =>
    setSelectedCategorias((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleMarca = (m: string) =>
    setSelectedMarcas((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  // Toggle helpers (drawer)
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

  // Aplicar filtros e ordenação
  const filtrados = useMemo(() => {
    let arr = [...produtos];

    if (selectedCategorias.length > 0) {
      arr = arr.filter((p) => selectedCategorias.includes(p.subtitle));
    }
    if (selectedMarcas.length > 0) {
      arr = arr.filter((p) => selectedMarcas.includes(p.title));
    }
    if (selectedDimensions.length > 0) {
      arr = arr.filter((p) => selectedDimensions.includes(guessDimension(p.subtitle)));
    }
    if (selectedSizes.length > 0) {
      arr = arr.filter((p: any) => p?.tamanho && selectedSizes.includes(p.tamanho));
    }

    switch (sortBy) {
      case "novidades":
        arr.sort((a, b) => b.id - a.id);
        break;
      case "maior":
        arr.sort((a, b) => b.preco - a.preco);
        break;
      case "menor":
        arr.sort((a, b) => a.preco - b.preco);
        break;
      case "nossa":
      default:
        arr.sort((a, b) => a.id - b.id);
    }

    return arr;
  }, [produtos, selectedCategorias, selectedMarcas, selectedDimensions, selectedSizes, sortBy]);

  return (
    <BolsasLayout
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      topBar={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
            aria-label="Abrir filtros"
          >
            Todos os filtros <span className="ml-1 text-xs">▼</span>
          </button>

          {/* Pílulas topo (Categorias + Marcas selecionadas) */}
          {topPills.map((pill) => {
            const active =
              pill.kind === "categoria"
                ? selectedCategorias.includes(pill.label)
                : selectedMarcas.includes(pill.label);

            return (
              <button
                key={pill.kind + pill.label}
                onClick={() =>
                  pill.kind === "categoria" ? toggleCategoria(pill.label) : toggleMarca(pill.label)
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:bg-zinc-50",
                ].join(" ")}
              >
                {pill.label}
              </button>
            );
          })}

          {/* Ordenar por */}
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

            <HeartButton id={p.id} label={`${p.title} ${p.subtitle}`} />
          </div>

          {/* Texto */}
          <div className="mt-4">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-xs text-zinc-500">
              {p.subtitle} • {p.author}
            </p>
            <p className="mt-1 text-zinc-700">{p.description}</p>
            <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
          </div>
        </article>
      ))}
    </BolsasLayout>
  );
}
