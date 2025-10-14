"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { add } from "@/store/cartSlice";
import FlyToCartAnimation from "../../components/FlyToCartAnimation";
import SapatosLayout from "./tailwind";
import HeartButton from "./../../components/HeartButton";
import FiltersSidebar from "./FiltersSidebar";
import SimpleLoader from "../../components/SimpleLoader";
import { useImageLoader, countAllProductImages } from "../../../hooks/useImageLoader";
import { useSapatos } from "@/hooks/api/useProdutos";

type Produto = {
  id: number;
  titulo: string;        // marca (vem como 'titulo' da API)
  subtitulo: string;     // categoria (Scarpin, Sandália, Bota...)
  autor: string;         // designer/estilista
  descricao: string;     // nome do produto
  preco: number;
  imagem: string;        // mudou de 'img' para 'imagem'
  imagemHover?: string;  // mudou de 'imgHover' para 'imagemHover'
  tamanho?: string;      // numeração 
  dimensao?: "Pequeno" | "Médio" | "Grande" | "Mini";
  imagens?: string[];    // mudou de 'images' para 'imagens'
  composicao?: string;   // mudou de 'composition' para 'composicao'
  destaques?: string[];  // mudou de 'highlights' para 'destaques'
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

const PAGE_TITLE = "Sapatos de Luxo";
const PAGE_SUBTITLE =
  "Os sapatos são uma peça fundamental no guarda-roupa de qualquer mulher. De flats ao sapato de salto, anabelas, salto fino, meia pata, a LUIGARAH traz todos os estilos em uma seleção surpreendente com o melhor em calçados femininos de marca. Explore coleções como a dos sapatos Amina Muaddi e os sapatos Balenciaga.";

type SortKey = "nossa" | "novidades" | "maior" | "menor";

export default function Page() {
  // Redux dispatch para carrinho
  const dispatch = useDispatch();
  
  // Seletor para verificar itens no carrinho
  const cartItems = useSelector((state: { cart: { items: Record<string, unknown> } }) => state.cart?.items || {});
  
  // Função para verificar se um produto está no carrinho
  const isProductInCart = (productId: number) => {
    const key = `sapatos:${productId}`;
    return !!cartItems[key];
  };
  
  // Usar hook atualizado da nova API
  const { sapatos: produtosApi, isLoading: loadingApi, error } = useSapatos(0, 100); // carregar todos
  
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
      tamanho: produto.dimensao, // sapatos usam tamanho/numeração
      dimensao: produto.dimensao as "Pequeno" | "Médio" | "Grande" | "Mini" || undefined,
      imagens: produto.imagens,
      composicao: produto.composicao,
      destaques: produto.destaques
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
  
  // Estados para animação do carrinho
  const [flyAnimation, setFlyAnimation] = useState({
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

  // Função para adicionar ao carrinho com animação
  const addToCartWithAnimation = (produto: Produto, buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    
    // Iniciar animação
    setFlyAnimation({
      isActive: true,
      productImage: produto.imagem,
      productTitle: produto.titulo,
      startPosition: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    });

    // Adicionar ao carrinho após um pequeno delay para sincronizar com a animação
    setTimeout(() => {
      dispatch(add({
        id: produto.id,
        tipo: "sapatos",
        title: produto.titulo,
        subtitle: produto.subtitulo,
        img: produto.imagem,
        preco: produto.preco
      }));
      
      // Disparar evento para animar o carrinho na TopBar
      window.dispatchEvent(new CustomEvent("luigara:cart:add"));
    }, 100);
  };

  const toggleCategoria = (c: string) =>
    setSelectedCategorias((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  const toggleMarca = (m: string) =>
    setSelectedMarcas((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
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
    setSelectedCategorias([]);
    setSelectedMarcas([]);
    setSelectedSizes([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let arr = [...produtos];

    // Aplicar filtros
    if (selectedSizes.length > 0) arr = arr.filter((p) => p.tamanho && selectedSizes.includes(p.tamanho));
    if (selectedCategorias.length > 0) arr = arr.filter((p) => selectedCategorias.includes(p.subtitulo));
    if (selectedMarcas.length > 0) arr = arr.filter((p) => selectedMarcas.includes(p.titulo));
    if (selectedDimensions.length > 0) arr = arr.filter((p) => p.dimensao && selectedDimensions.includes(p.dimensao));

    switch (sortBy) {
      case "novidades": arr.sort((a, b) => b.id - a.id); break;
      case "maior": arr.sort((a, b) => b.preco - a.preco); break;
      case "menor": arr.sort((a, b) => a.preco - b.preco); break;
      case "nossa":
      default: arr.sort((a, b) => a.id - b.id);
    }

    return arr;
  }, [produtos, selectedCategorias, selectedMarcas, selectedDimensions, selectedSizes, sortBy]);

  // Contar TODAS as imagens dos produtos (imagem, imagemHover, imagens[])
  const totalImages = useMemo(() => {
    // Mapear para o formato esperado pelo countAllProductImages
    const produtosFormatados = filtrados.map(p => ({
      img: p.imagem,
      imgHover: p.imagemHover,
      images: p.imagens || [] // sapatos podem ter array de imagens
    }));
    return countAllProductImages(produtosFormatados);
  }, [filtrados]);
  const { isLoading, onImageLoad, onImageError } = useImageLoader(totalImages);

  // Mostrar loading inicial durante o pré-carregamento
  if (isInitialLoading || loadingApi) {
    return <SimpleLoader isLoading={true} />;
  }

  // Mostrar erro se falhou ao carregar da API
  if (error) {
    return <div className="p-8 text-center">Erro ao carregar sapatos. Tente novamente.</div>;
  }

  return (
    <>
      <SimpleLoader isLoading={isLoading} />
      
      <SapatosLayout
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
              pill.kind === "categoria"
                ? selectedCategorias.includes(pill.label)
                : selectedMarcas.includes(pill.label);
            return (
              <button
                key={pill.kind + pill.label}
                onClick={() =>
                  pill.kind === "categoria"
                    ? toggleCategoria(pill.label)
                    : toggleMarca(pill.label)
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 hover:bg-zinc-50",
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
          tamanhosDisponiveis={[]}
        />
      }
    >
      {filtrados.map((p, idx) => (
        <article key={p.id} className="group">
          <Link href={`/produtos/sapatos/detalhes/${p.id}`} className="block focus:outline-none">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-[420px] md:h-[540px] flex flex-col">
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
                <HeartButton id={p.id} label={`${p.titulo} ${p.subtitulo}`} img={p.imagem} tipo="sapatos" />
              </div>
              
              {/* Linha divisória sutil */}
              <div className="h-px bg-gray-200"></div>

              <div className="p-3 flex-1 flex flex-col relative">
                {/* Conteúdo superior: tipo, título e descrição */}
                <div className="flex-shrink-0 mb-1.5">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                    sapatos
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black transition-colors text-sm md:text-base line-clamp-2">
                    {p.titulo}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {p.descricao}
                  </p>
                </div>
                
                {/* Seção inferior: preço e autor com altura mínima garantida */}
                <div className="mt-auto pr-12 flex flex-col justify-end pb-2.5">
                  <div className="space-y-1">
                    <span className="block text-base md:text-lg font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-black group-hover:via-gray-700 group-hover:to-black transition-all duration-300">
                      {formatBRL(p.preco)}
                    </span>
                    <div className="text-xs text-gray-500">
                      {p.autor}
                    </div>
                  </div>
                </div>
                
                {/* Botão do carrinho - posicionamento absoluto no canto */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCartWithAnimation(p, e.currentTarget);
                  }}
                  className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                    isProductInCart(p.id)
                      ? 'bg-black hover:bg-gray-800 text-white' // Produto no carrinho - preto
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600' // Produto não está no carrinho - cinza claro
                  }`}
                  aria-label="Adicionar ao carrinho"
                >
                  <FiShoppingBag className="w-5 h-5 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </SapatosLayout>

    {/* Animação do produto voando para o carrinho */}
    <FlyToCartAnimation
      isActive={flyAnimation.isActive}
      productImage={flyAnimation.productImage}
      productTitle={flyAnimation.productTitle}
      startPosition={flyAnimation.startPosition}
      onComplete={() => setFlyAnimation(prev => ({ ...prev, isActive: false }))}
    />
    </>
  );
}
