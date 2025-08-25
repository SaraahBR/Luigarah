"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import SapatosLayout from "../tailwind";
import FiltersSidebar from "../FiltersSidebar";
import HeartButton from "../../../components/HeartButton";

type Produto = {
  id: number;
  title?: string; // marca
  subtitle?: string; // categoria
  author?: string; // designer
  description?: string; // nome do produto
  preco?: number;
  img?: string;
  imgHover?: string;
  tamanho?: string; // ex.: 32..41
  dimension?: "Pequeno" | "Médio" | "Grande" | "Mini";
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

export default function ClientSapatosCategoria({
  titulo,
  produtos,
  itensIniciais,
  categorias,
  marcas,
}: ClientProps) {
  const initialCategorySlug = itensIniciais[0]?.subtitle
    ? slugify(itensIniciais[0].subtitle!)
    : "";

  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialCategorySlug ? [initialCategorySlug] : []
  );
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // pills: label e valor slug
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

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleDimension = (d: string) =>
    setSelectedDimensions((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const clearAll = () => {
    setSelectedCategorias(initialCategorySlug ? [initialCategorySlug] : []);
    setSelectedMarcas([]);
    setSelectedSizes([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let arr = [...produtos];

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

    if (selectedSizes.length > 0) {
      arr = arr.filter((p) => p.tamanho && selectedSizes.includes(p.tamanho));
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
    selectedSizes,
    sortBy,
    initialCategorySlug,
  ]);

  return (
    <SapatosLayout
      title={titulo}
      subtitle="Os sapatos são uma peça fundamental no guarda-roupa de qualquer mulher. De flats ao sapato de salto, anabelas, salto fino, meia pata, a LUIGARAH traz todos os estilos em uma seleção surpreendente com o melhor em calçados femininos de marca. Explore coleções como a dos sapatos Amina Muaddi e os sapatos Balenciaga."
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
          selectedSizes={selectedSizes}
          selectedDimensions={selectedDimensions}
          onToggleSize={toggleSize}
          onToggleDimension={toggleDimension}
          onClearAll={clearAll}
        />
      }
    >
      {filtrados.map((p, idx) => (
        <article key={p.id ?? idx} className="group">
          <Link
            href={`/produtos/sapatos/detalhes/${p.id ?? ""}`}
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
                tipo="sapatos"
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
    </SapatosLayout>
  );
}
