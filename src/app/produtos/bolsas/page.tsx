"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import FlyToCartAnimation from "../../components/FlyToCartAnimation";
import FlyToWishlistAnimation from "../../components/FlyToWishlistAnimation";
import BolsasLayout from "./tailwind";
import HeartButton from "./../../components/HeartButton";
import CartButtonCircle from "@/app/components/cart/CartButtonCircle";
import FiltersSidebar from "./FiltersSidebar";
import SimpleLoader from "@/app/components/SimpleLoader";
import { useImageLoader, countAllProductImages } from "../../../hooks/useImageLoader";
import { useBolsas, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
import { useTamanhosEDimensoes } from "@/hooks/useTamanhosEDimensoes";
import Pagination from "@/app/components/Pagination";

type Produto = {
  id: number;
  titulo: string;      // marca (vem como 'titulo' da API)
  subtitulo: string;   // categoria (Tiracolo, Transversal, etc.)
  autor: string;       // designer/estilista
  descricao: string;   // nome do produto
  preco: number;
  imagem: string;      // mudou de 'img' para 'imagem'
  imagemHover?: string; // mudou de 'imgHover' para 'imagemHover'
  dimensao?: "Grande" | "Média" | "Pequena" | "Mini";
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const PAGE_TITLE = "Bolsas de Luxo";
const PAGE_SUBTITLE =
  "A LUIGARAH oferece uma seleção excepcional de bolsas de grife, desde modelos clássicos até estilos icônicos. Explore totes, tiracolos, minibags e clutches das melhores marcas.";

type SortKey = "nossa" | "novidades" | "maior" | "menor";

// Normalizar dimensões para o padrão: Grande, Médio, Pequeno
function normalizarDimensao(dim: string): "Grande" | "Médio" | "Pequeno" {
  const dimLower = dim.toLowerCase();
  if (dimLower.includes('grand')) return 'Grande';
  if (dimLower.includes('médi') || dimLower.includes('medi')) return 'Médio';
  if (dimLower.includes('peque') || dimLower.includes('mini')) return 'Pequeno';
  return 'Médio'; // padrão
}

function BolsasPage() {
  const searchParams = useSearchParams();
  const identidade = searchParams.get("identidade")?.toLowerCase();

  // Buscar produtos por identidade ou todas as bolsas
  const { bolsas: bolsasApi, isLoading: loadingBolsas } = useBolsas(0, 100);
  const { produtos: produtosMulher = [], isLoading: loadingMulher } = useProdutosMulher(0, 1000);
  const { produtos: produtosHomem = [], isLoading: loadingHomem } = useProdutosHomem(0, 1000);
  const { produtos: produtosUnissex = [], isLoading: loadingUnissex } = useProdutosUnissex(0, 1000);
  const { produtos: produtosKids = [], isLoading: loadingKids } = useProdutosKids(0, 1000);

  const loadingApi = identidade 
    ? (identidade === "mulher" && loadingMulher) || 
      (identidade === "homem" && loadingHomem) || 
      (identidade === "unissex" && loadingUnissex) || 
      (identidade === "kids" && loadingKids)
    : loadingBolsas;
  
  // Mapear dados da API para o formato esperado pelo componente
  const produtos: Produto[] = useMemo(() => {
    let produtosBase = bolsasApi || [];
    
    if (identidade) {
      // Filtrar bolsas da identidade específica
      let produtosIdentidade: typeof produtosMulher = [];
      switch (identidade) {
        case "mulher":
          produtosIdentidade = produtosMulher;
          break;
        case "homem":
          produtosIdentidade = produtosHomem;
          break;
        case "unissex":
          produtosIdentidade = produtosUnissex;
          break;
        case "kids":
          produtosIdentidade = produtosKids;
          break;
      }
      
      // Filtrar apenas bolsas
      produtosBase = produtosIdentidade.filter(p => 
        p.categoria?.toLowerCase().includes("bolsa")
      );
    }
    
    // Filtrar produtos unissex se estiver em identidade mulher ou homem
    if (identidade === "mulher" || identidade === "homem") {
      produtosBase = produtosBase.filter((produto) => {
        const identidadeCodigo = produto.identidade?.codigo?.toLowerCase();
        return identidadeCodigo !== 'unissex';
      });
    }
    
    return produtosBase.map(produto => {
      // Normalizar imagens e destaques para garantir que sejam sempre arrays
      const imagensNormalizadas = Array.isArray(produto.imagens) 
        ? produto.imagens 
        : produto.imagens 
          ? [produto.imagens] 
          : undefined;
          
      const destaquesNormalizados = Array.isArray(produto.destaques)
        ? produto.destaques
        : produto.destaques
          ? [produto.destaques]
          : undefined;

      return {
        id: produto.id!,
        titulo: produto.titulo,
        subtitulo: produto.subtitulo || "",
        autor: produto.autor || "",
        descricao: produto.descricao || "",
        preco: produto.preco || 0,
        imagem: produto.imagem || "",
        imagemHover: produto.imagemHover,
        dimensao: produto.dimensao as "Grande" | "Média" | "Pequena" | "Mini" || undefined,
        imagens: imagensNormalizadas,
        destaques: destaquesNormalizados
      };
    });
  }, [identidade, bolsasApi, produtosMulher, produtosHomem, produtosUnissex, produtosKids]);

  const CATEGORIAS = Array.from(new Set(produtos.map((p) => p.subtitulo))).filter(Boolean);
  const MARCAS = Array.from(new Set(produtos.map((p) => p.titulo))).filter(Boolean);

  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [pillsStartIndex, setPillsStartIndex] = useState(0);
  const MAX_VISIBLE_PILLS = 8;
  
  // Estados para animação do carrinho
  const [flyAnimation, setFlyAnimation] = useState({
    isActive: false,
    productImage: '',
    productTitle: '',
    startPosition: { x: 0, y: 0 }
  });

  // Estados para animação da wishlist
  const [flyWishlistAnimation, setFlyWishlistAnimation] = useState({
    isActive: false,
    productImage: '',
    productTitle: '',
    startPosition: { x: 0, y: 0 }
  });
  
  // Estados para loading inicial
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Efeito para controlar loading inicial
  useEffect(() => {
    if (!loadingApi) {
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
    }
  }, [loadingApi]);

  const topPills = [
    ...CATEGORIAS.map((c) => ({ kind: "categoria" as const, label: c })),
    ...MARCAS.slice(0, 3).map((m) => ({ kind: "marca" as const, label: m })),
  ];

  const toggleCategoria = (c: string) =>
    setSelectedCategorias((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleMarca = (m: string) =>
    setSelectedMarcas((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const toggleDimension = (d: string) =>
    setSelectedDimensions((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const clearAll = () => {
    setSelectedCategorias([]);
    setSelectedMarcas([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let todosProdutos: Produto[] = [...produtos];

    // Aplicar filtros de dimensão
    if (selectedDimensions.length > 0) {
      todosProdutos = todosProdutos.filter((p) => p.dimensao && selectedDimensions.includes(normalizarDimensao(p.dimensao)));
    }

    // Aplicar filtros de categoria e marca
    if (selectedCategorias.length > 0) {
      todosProdutos = todosProdutos.filter((p) => selectedCategorias.includes(p.subtitulo));
    }
    if (selectedMarcas.length > 0) {
      todosProdutos = todosProdutos.filter((p) => selectedMarcas.includes(p.titulo));
    }

    // Aplicar ordenação
    switch (sortBy) {
      case "novidades": todosProdutos.sort((a, b) => b.id - a.id); break;
      case "maior": todosProdutos.sort((a, b) => b.preco - a.preco); break;
      case "menor": todosProdutos.sort((a, b) => a.preco - b.preco); break;
      case "nossa":
      default: todosProdutos.sort((a, b) => a.id - b.id);
    }
    
    return todosProdutos;
  }, [produtos, selectedCategorias, selectedMarcas, selectedDimensions, sortBy]);

  // Buscar dimensões disponíveis do banco de dados (bolsas não usam tamanhos)
  const produtosParaDimensoes = useMemo(() => {
    return produtos.map(p => ({
      id: p.id,
      titulo: p.titulo,
      subtitulo: p.subtitulo,
      autor: p.autor,
      descricao: p.descricao,
      preco: p.preco,
      dimensao: p.dimensao,
      imagem: p.imagem,
      categoria: 'bolsas' as const,
    }));
  }, [produtos]);

  const {
    dimensoes: dimensoesDisponiveis,
  } = useTamanhosEDimensoes(produtosParaDimensoes);

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

  // Contar TODAS as imagens dos produtos (imagem, imagemHover)
  const totalImages = useMemo(() => {
    // Mapear para o formato esperado pelo countAllProductImages
    const produtosFormatados = paginatedProducts.map(p => ({
      img: p.imagem,
      imgHover: p.imagemHover,
      images: [] // bolsas não têm array de imagens no seu backend
    }));
    return countAllProductImages(produtosFormatados);
  }, [paginatedProducts]);

  // Image loading management
  const { onImageLoad, onImageError } = useImageLoader(totalImages);

  // Mostrar loading inicial durante o pré-carregamento
  if (isInitialLoading || loadingApi) {
    return <SimpleLoader isLoading={true} />;
  }

  return (
    <>
      <BolsasLayout
        title={PAGE_TITLE}
        subtitle={PAGE_SUBTITLE}
        topBar={
        <div className="space-y-2 md:space-y-0">
          {/* Linha 1: Filtros e Pills (responsivo) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 flex-shrink-0"
              aria-label="Abrir filtros"
            >
              Todos os filtros <span className="ml-1 text-xs">▼</span>
            </button>

            {/* Botão de navegação esquerda */}
            {topPills.length > MAX_VISIBLE_PILLS && pillsStartIndex > 0 && (
              <button
                onClick={() => setPillsStartIndex(Math.max(0, pillsStartIndex - 1))}
                className="flex-shrink-0 p-1.5 rounded-full border border-zinc-300 hover:bg-zinc-50 transition-colors"
                aria-label="Ver pills anteriores"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Container das pills com scroll horizontal no mobile */}
            <div className="flex-1 md:flex-none overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2">
                {topPills.slice(pillsStartIndex, pillsStartIndex + MAX_VISIBLE_PILLS).map((pill) => {
                const active =
                  pill.kind === "categoria" ? selectedCategorias.includes(pill.label) : selectedMarcas.includes(pill.label);
                return (
                  <button
                    key={pill.kind + pill.label}
                    onClick={() => (pill.kind === "categoria" ? toggleCategoria(pill.label) : toggleMarca(pill.label))}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0",
                      active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {pill.label}
                  </button>
                );
              })}
              </div>
            </div>

            {/* Botão de navegação direita */}
            {topPills.length > MAX_VISIBLE_PILLS && pillsStartIndex + MAX_VISIBLE_PILLS < topPills.length && (
              <button
                onClick={() => setPillsStartIndex(Math.min(topPills.length - MAX_VISIBLE_PILLS, pillsStartIndex + 1))}
                className="flex-shrink-0 p-1.5 rounded-full border border-zinc-300 hover:bg-zinc-50 transition-colors"
                aria-label="Ver próximas pills"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Ordenar por (inline no desktop, hidden no mobile) */}
            <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
              <label className="text-sm text-zinc-600 whitespace-nowrap">Ordenar por</label>
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

          {/* Linha 2: Ordenar por (apenas mobile) */}
          <div className="flex justify-end md:hidden">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600 whitespace-nowrap">Ordenar por</label>
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
        </div>
      }
      filtersDrawer={
        <FiltersSidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedDimensions={selectedDimensions}
          onToggleDimension={toggleDimension}
          onClearAll={clearAll}
          dimensoesDisponiveis={dimensoesDisponiveis}
        />
      }
    >
      {paginatedProducts.map((p, idx) => (
        <article key={p.id} className="group">
          <Link href={`/produtos/bolsas/detalhes/${p.id}`} className="block focus:outline-none">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-[420px] min-[525px]:h-[520px] sm:h-[540px] min-[723px]:h-[550px] min-[746px]:h-[555px] min-[770px]:h-[560px] md:h-[580px] lg:h-[600px] min-[1200px]:h-[610px] min-[1247px]:h-[615px] xl:h-[620px] flex flex-col">
              <div className="aspect-[4/5] relative bg-gray-100 flex-shrink-0 overflow-hidden">
                {/* Imagem principal */}
                <Image
                  src={p.imagem}
                  alt={`${p.titulo} — ${p.descricao}`}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                  priority={idx < 4}
                  loading={idx < 4 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                  onLoad={onImageLoad}
                  onError={onImageError}
                />
                {/* Imagem hover - só aparece se existir */}
                {p.imagemHover && (
                  <Image
                    src={p.imagemHover}
                    alt={`${p.titulo} — ${p.descricao} (detalhe)`}
                    fill
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                    onLoad={onImageLoad}
                    onError={onImageError}
                  />
                )}
                <HeartButton 
                  id={p.id} 
                  label={`${p.titulo} ${p.subtitulo}`} 
                  img={p.imagem} 
                  tipo="bolsas"
                  onAdded={(position) => {
                    setFlyWishlistAnimation({
                      isActive: true,
                      productImage: p.imagem,
                      productTitle: p.titulo,
                      startPosition: position
                    });
                  }}
                />
              </div>
              
              {/* Linha divisória sutil */}
              <div className="h-px bg-gray-200"></div>

              <div className="p-3 min-[525px]:p-4 sm:p-4 min-[723px]:p-4.5 min-[746px]:p-4.5 min-[770px]:p-4.5 md:p-4.5 lg:p-5 min-[1200px]:p-5 min-[1247px]:p-5 xl:p-5 flex-1 flex flex-col relative">
                {/* Conteúdo superior: tipo, título e descrição */}
                <div className="flex-shrink-0 mb-1.5 min-[525px]:mb-2 sm:mb-2 min-[723px]:mb-2 min-[746px]:mb-2 md:mb-2.5 min-[1200px]:mb-2.5 min-[1247px]:mb-3">
                  <div className="text-xs min-[525px]:text-xs sm:text-xs md:text-[0.7rem] text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                    bolsas
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 group-hover:text-black transition-colors text-sm min-[525px]:text-[0.95rem] sm:text-[0.98rem] min-[723px]:text-[0.99rem] min-[746px]:text-[0.995rem] min-[770px]:text-base md:text-base lg:text-[1.05rem] min-[1200px]:text-[1.08rem] min-[1247px]:text-[1.09rem] line-clamp-2">
                    {p.titulo}
                  </h3>
                  <p className="text-xs min-[525px]:text-[0.8rem] sm:text-[0.82rem] min-[723px]:text-[0.84rem] min-[746px]:text-[0.845rem] min-[770px]:text-[0.85rem] md:text-sm lg:text-[0.9rem] min-[1200px]:text-[0.92rem] min-[1247px]:text-[0.93rem] text-gray-600 line-clamp-2">
                    {p.descricao}
                  </p>
                </div>
                
                {/* Seção inferior: preço e autor com altura mínima garantida */}
                <div className="mt-auto pr-12 min-[525px]:pr-14 sm:pr-14 min-[723px]:pr-15 min-[746px]:pr-15 min-[770px]:pr-15 md:pr-16 min-[1200px]:pr-16 min-[1247px]:pr-16 flex flex-col justify-end pb-2.5 min-[525px]:pb-3 sm:pb-3 md:pb-3.5 min-[1200px]:pb-4 min-[1247px]:pb-4">
                  <div className="space-y-1 min-[525px]:space-y-1.5 sm:space-y-1.5 min-[1200px]:space-y-2 min-[1247px]:space-y-2">
                    <span className="block text-base min-[525px]:text-[1.05rem] sm:text-[1.08rem] min-[723px]:text-[1.1rem] min-[746px]:text-[1.12rem] min-[770px]:text-lg md:text-lg lg:text-[1.15rem] min-[1200px]:text-[1.18rem] min-[1247px]:text-[1.19rem] xl:text-xl font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-black group-hover:via-gray-700 group-hover:to-black transition-all duration-300">
                      {formatBRL(p.preco)}
                    </span>
                    <div className="text-xs min-[525px]:text-[0.75rem] sm:text-[0.78rem] min-[723px]:text-[0.8rem] min-[746px]:text-[0.81rem] md:text-sm min-[1200px]:text-[0.88rem] min-[1247px]:text-[0.89rem] text-gray-500">
                      {p.autor}
                    </div>
                  </div>
                </div>
                
                {/* Botão do carrinho - posicionamento absoluto no canto */}
                <div className="absolute bottom-3 right-3 min-[525px]:bottom-4 min-[525px]:right-4 sm:bottom-4 sm:right-4 min-[723px]:bottom-4 min-[723px]:right-4 min-[746px]:bottom-4 min-[746px]:right-4 md:bottom-4 md:right-4 lg:bottom-5 lg:right-5 min-[1200px]:bottom-5 min-[1200px]:right-5 min-[1247px]:bottom-5 min-[1247px]:right-5">
                  <CartButtonCircle
                    id={p.id}
                    tipo="bolsas"
                    preco={p.preco}
                    title={`${p.titulo} ${p.subtitulo}`}
                    subtitle={p.descricao}
                    img={p.imagem}
                    onAdded={(position) => {
                      setFlyAnimation({
                        isActive: true,
                        productImage: p.imagem,
                        productTitle: p.titulo,
                        startPosition: position
                      });
                    }}
                  />
                </div>
              </div>
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

    {/* Animação do produto voando para o carrinho */}
    <FlyToCartAnimation
      isActive={flyAnimation.isActive}
      productImage={flyAnimation.productImage}
      productTitle={flyAnimation.productTitle}
      startPosition={flyAnimation.startPosition}
      onComplete={() => setFlyAnimation(prev => ({ ...prev, isActive: false }))}
    />

    {/* Animação do produto voando para a wishlist */}
    <FlyToWishlistAnimation
      isActive={flyWishlistAnimation.isActive}
      productImage={flyWishlistAnimation.productImage}
      productTitle={flyWishlistAnimation.productTitle}
      startPosition={flyWishlistAnimation.startPosition}
      onComplete={() => setFlyWishlistAnimation(prev => ({ ...prev, isActive: false }))}
    />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SimpleLoader isLoading={true} />}>
      <BolsasPage />
    </Suspense>
  );
}
