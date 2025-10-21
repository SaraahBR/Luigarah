"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import BolsasLayout from "../tailwind";
import FiltersSidebar from "../FiltersSidebar";
import HeartButton from "../../../components/HeartButton";
import Pagination from "@/app/components/Pagination";

type Produto = {
  id: number;
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  preco?: number;
  img?: string;
  imgHover?: string;
  dimension?: "Grande" | "Média" | "Pequena" | "Mini";
  images?: string[];
  composition?: string;
  highlights?: string[];
};

type SortKey = "nossa" | "novidades" | "maior" | "menor";

type ClientProps = {
  titulo: string;
  produtos: Produto[];
  itensIniciais: Produto[];
  categorias: string[];
  marcas: string[];
};

const formatBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

export default function ClientBolsasCategoria({
  titulo,
  produtos,
  itensIniciais,
  categorias,
  marcas,
}: ClientProps) {
  // slug inicial vindo da URL
  const initialCategorySlug = itensIniciais[0]?.subtitle
    ? slugify(itensIniciais[0].subtitle!)
    : "";

  // estados guardando SLUGS
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialCategorySlug ? [initialCategorySlug] : []
  );
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // pills com rótulo (UI) e tbm valor slug (comparação)
  const topPills: Array<{
    kind: "categoria" | "marca";
    label: string;
    value: string;
  }> = [
    ...categorias.map((c) => ({
      kind: "categoria" as const,
      label: c,
      value: slugify(c),
    })),
    ...marcas
      .slice(0, 3)
      .map((m) => ({ kind: "marca" as const, label: m, value: slugify(m) })),
  ];

  const toggleCategoria = (valueSlug: string) =>
    setSelectedCategorias((prev) =>
      prev.includes(valueSlug)
        ? prev.filter((x) => x !== valueSlug)
        : [...prev, valueSlug]
    );

  const toggleMarca = (valueSlug: string) =>
    setSelectedMarcas((prev) =>
      prev.includes(valueSlug)
        ? prev.filter((x) => x !== valueSlug)
        : [...prev, valueSlug]
    );

  const toggleDimension = (d: string) =>
    setSelectedDimensions((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const clearAll = () => {
    setSelectedCategorias(initialCategorySlug ? [initialCategorySlug] : []);
    setSelectedMarcas([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let arr = [...produtos];

    // categorias ativas, ou seja seleção OU slug inicial
    const categoriasAtivas =
      selectedCategorias.length > 0
        ? selectedCategorias
        : initialCategorySlug
        ? [initialCategorySlug]
        : [];

    if (categoriasAtivas.length > 0) {
      arr = arr.filter((p) =>
        categoriasAtivas.includes(slugify(p.subtitle ?? ""))
      );
    }

    if (selectedMarcas.length > 0) {
      arr = arr.filter((p) => selectedMarcas.includes(slugify(p.title ?? "")));
    }

    if (selectedDimensions.length > 0) {
      arr = arr.filter(
        (p) => p.dimension && selectedDimensions.includes(p.dimension)
      );
    }

    switch (sortBy) {
      case "novidades":
        arr.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "maior":
        arr.sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
        break;
      case "menor":
        arr.sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
        break;
      default:
        arr.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }
    return arr;
  }, [
    produtos,
    selectedCategorias,
    selectedMarcas,
    selectedDimensions,
    sortBy,
    initialCategorySlug,
  ]);

  // Resetar página quando filtros ou ordenação mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorias, selectedMarcas, selectedDimensions, sortBy]);

  // Calcular produtos paginados
  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtrados.slice(startIndex, endIndex);
  }, [filtrados, currentPage]);

  return (
    <BolsasLayout
      title={titulo}
      subtitle="A LUIGARAH oferece uma seleção excepcional de bolsas de grife, desde modelos clássicos até estilos icônicos. Explore totes, tiracolos, minibags e clutches das melhores marcas."
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
              pill.kind === "categoria"
                ? selectedCategorias.includes(pill.value)
                : selectedMarcas.includes(pill.value);

            return (
              <button
                key={pill.kind + pill.value}
                onClick={() =>
                  pill.kind === "categoria"
                    ? toggleCategoria(pill.value)
                    : toggleMarca(pill.value)
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 hover:bg-zinc-50",
                ].join(" ")}
                aria-pressed={active}
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
          selectedDimensions={selectedDimensions}
          onToggleDimension={toggleDimension}
          onClearAll={clearAll}
        />
      }
    >
      {paginatedProducts.map((p, idx) => (
        <article key={p.id ?? idx} className="group">
          <Link
            href={`/produtos/bolsas/detalhes/${p.id ?? ""}`}
            className="block focus:outline-none"
          >
            <div className="relative overflow-hidden rounded-xl bg-zinc-100 aspect-[4/5]">
              <Image
                src={p.img ?? ""}
                alt={`${p.title ?? ""} — ${p.description ?? ""}`}
                fill
                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                priority={idx === 0}
              />
              <Image
                src={p.imgHover ?? p.img ?? ""}
                alt={`${p.title ?? ""} — ${p.description ?? ""} (detalhe)`}
                fill
                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              />
              <HeartButton
                id={p.id ?? 0}
                label={`${p.title ?? ""} ${p.subtitle ?? ""}`}
                img={p.img ?? ""}
                tipo="bolsas"
              />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">{p.title ?? ""}</h3>
              <p className="text-xs text-zinc-500">
                {p.subtitle ?? ""}
                {p.author ? ` • ${p.author}` : ""}
              </p>
              <p className="mt-1 text-zinc-700">{p.description ?? ""}</p>
              <p className="mt-4 text-zinc-900">{formatBRL(p.preco ?? 0)}</p>
            </div>
          </Link>
        </article>
      ))}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="col-span-full mt-12 mb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </BolsasLayout>
  );
}
