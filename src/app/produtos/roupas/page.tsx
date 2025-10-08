"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RoupasLayout from "./tailwind";
import HeartButton from "./../../components/HeartButton";
import FiltersSidebar from "./FiltersSidebar";
import LuxuryLoader from "../../components/LuxuryLoader";
import { useImageLoader, countAllProductImages } from "../../../hooks/useImageLoader";
import { useGetRoupasQuery } from "@/store/productsApi";

type Produto = {
  id: number;
  titulo: string;      // marca (vem como 'titulo' da API)
  subtitulo: string;   // categoria (Vestido, Casaco, etc.)
  autor: string;       // designer/estilista
  descricao: string;   // nome do produto
  preco: number;
  imagem: string;      // mudou de 'img' para 'imagem'
  imagemHover?: string; // mudou de 'imgHover' para 'imagemHover'
  tamanho?: string;
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const PAGE_TITLE = "Roupas de Luxo";
const PAGE_SUBTITLE =
  "O melhor em roupas femininas da moda mundial reunidas em uma seleção online LUIGARAH. Descubra o estilo e alto padrão de peças que transmitem talento criativo e conceito inovador de marcas de roupa nacionais e importadas que movimentam a moda internacional. Uma coleção surpreendente que traz desde roupas Dolce Gabbana até a elegância cosmopolita das peças Stella McCartney e a sofisticação de Givenchy. A LUIGARAH traz todas as tendências da moda atual e dos melhores designers do mundo. ";

type SortKey = "nossa" | "novidades" | "maior" | "menor";

function guessDimension(subtitulo: string): "Grande" | "Média" | "Pequena" | "Mini" {
  const s = subtitulo.toLowerCase();
  if (s.includes("mini")) return "Mini";
  if (s.includes("maxi") || s.includes("trench") || s.includes("jaqueta") || s.includes("casaco")) return "Grande";
  return "Média";
}

export default function Page() {
  // Usar hook do RTK Query em vez de dados JSON
  const { data: produtosApi, isLoading: loadingApi, error } = useGetRoupasQuery(); // carregar todos
  
  // Mapear dados da API para o formato esperado pelo componente
  const produtos: Produto[] = useMemo(() => {
    if (!produtosApi) return [];
    return produtosApi.map(produto => ({
      id: produto.id!,
      titulo: produto.titulo,
      subtitulo: produto.subtitulo || "",
      autor: produto.autor || "",
      descricao: produto.descricao || "",
      preco: produto.preco || 0, // valor padrão se preço for undefined
      imagem: produto.imagem || "",
      imagemHover: produto.imagemHover,
      tamanho: produto.dimensao // roupas usam tamanho
    }));
  }, [produtosApi]);

  const CATEGORIAS = Array.from(new Set(produtos.map((p) => p.subtitulo))).filter(Boolean);
  const MARCAS = Array.from(new Set(produtos.map((p) => p.titulo))).filter(Boolean);

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

    if (selectedCategorias.length > 0) arr = arr.filter((p) => selectedCategorias.includes(p.subtitulo));
    if (selectedMarcas.length > 0) arr = arr.filter((p) => selectedMarcas.includes(p.titulo));
    if (selectedDimensions.length > 0) arr = arr.filter((p) => selectedDimensions.includes(guessDimension(p.subtitulo)));
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

  // Contar TODAS as imagens dos produtos (imagem, imagemHover)
  const totalImages = useMemo(() => {
    // Mapear para o formato esperado pelo countAllProductImages
    const produtosFormatados = filtrados.map(p => ({
      img: p.imagem,
      imgHover: p.imagemHover,
      images: [] // roupas não têm array de imagens no seu backend
    }));
    return countAllProductImages(produtosFormatados);
  }, [filtrados]);
  const { isLoading, progress, onImageLoad, onImageError, loadedImages } = useImageLoader(totalImages);

  // Mostrar loading se ainda carregando da API
  if (loadingApi) {
    return <LuxuryLoader isLoading={true} progress={0} loadedImages={0} totalImages={1} />;
  }

  // Mostrar erro se falhou ao carregar da API
  if (error) {
    return <div className="p-8 text-center">Erro ao carregar roupas. Tente novamente.</div>;
  }

  return (
    <>
      <LuxuryLoader 
        isLoading={isLoading} 
        progress={progress} 
        loadedImages={loadedImages}
        totalImages={totalImages}
      />
      
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
                src={p.imagem}
                alt={`${p.titulo} — ${p.descricao}`}
                fill
                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                priority={idx < 4}
                loading={idx < 4 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                onLoad={onImageLoad}
                onError={onImageError}
              />
              <Image
                src={p.imagemHover ?? p.imagem}
                alt={`${p.titulo} — ${p.descricao} (detalhe)`}
                fill
                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                onLoad={onImageLoad}
                onError={onImageError}
              />
              <HeartButton id={p.id} label={`${p.titulo} ${p.subtitulo}`} img={p.imagem} tipo="roupas" />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">{p.titulo}</h3>
              <p className="text-xs text-zinc-500">{p.subtitulo} • {p.autor}</p>
              <p className="mt-1 text-zinc-700">{p.descricao}</p>
              <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
            </div>
          </Link>
        </article>
      ))}
    </RoupasLayout>
    </>
  );
}
