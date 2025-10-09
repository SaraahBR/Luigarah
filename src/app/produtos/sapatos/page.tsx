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
import { useGetSapatosQuery, useGetTamanhosPorCategoriaQuery, useGetProdutosPorCategoriaETamanhoQuery } from "@/store/productsApi";

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
  
  // Usar hook do RTK Query em vez de dados JSON
  const { data: produtosApi, isLoading: loadingApi, error } = useGetSapatosQuery(); // carregar todos
  
  // Buscar tamanhos disponíveis para sapatos
  const { data: tamanhosSapatos = [] } = useGetTamanhosPorCategoriaQuery("sapatos");
  
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
  
  // Estados para cache
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [cachedProductsBySize, setCachedProductsBySize] = useState<{
    [key: string]: Produto[]
  }>({});

  // Hooks individuais para cada tamanho - pré-carregamento (32 ao 46)
  const sapatos32 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '32' });
  const sapatos33 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '33' });
  const sapatos34 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '34' });
  const sapatos35 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '35' });
  const sapatos36 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '36' });
  const sapatos37 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '37' });
  const sapatos38 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '38' });
  const sapatos39 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '39' });
  const sapatos40 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '40' });
  const sapatos41 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '41' });
  const sapatos42 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '42' });
  const sapatos43 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '43' });
  const sapatos44 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '44' });
  const sapatos45 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '45' });
  const sapatos46 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '46' });

  // Efeito para cachear os dados pré-carregados
  useEffect(() => {
    const newCache: { [key: string]: Produto[] } = {};
    let allLoaded = true;

    const queries = [
      { key: 'sapatos-32', query: sapatos32 },
      { key: 'sapatos-33', query: sapatos33 },
      { key: 'sapatos-34', query: sapatos34 },
      { key: 'sapatos-35', query: sapatos35 },
      { key: 'sapatos-36', query: sapatos36 },
      { key: 'sapatos-37', query: sapatos37 },
      { key: 'sapatos-38', query: sapatos38 },
      { key: 'sapatos-39', query: sapatos39 },
      { key: 'sapatos-40', query: sapatos40 },
      { key: 'sapatos-41', query: sapatos41 },
      { key: 'sapatos-42', query: sapatos42 },
      { key: 'sapatos-43', query: sapatos43 },
      { key: 'sapatos-44', query: sapatos44 },
      { key: 'sapatos-45', query: sapatos45 },
      { key: 'sapatos-46', query: sapatos46 },
    ];

    queries.forEach(({ key, query }) => {
      if (query.isLoading) {
        allLoaded = false;
        return;
      }

      if (query.data) {
        newCache[key] = query.data.map(p => {
          // Validar dimensao
          const validDimensions = ["Pequeno", "Médio", "Grande", "Mini"] as const;
          const dimensao = validDimensions.includes(p.dimensao as typeof validDimensions[number]) ? 
            p.dimensao as "Pequeno" | "Médio" | "Grande" | "Mini" : undefined;
            
          return {
            id: p.id!,
            titulo: p.titulo || "",
            subtitulo: p.subtitulo || "",
            autor: p.autor || "",
            descricao: p.descricao || "",
            preco: p.preco || 0,
            imagem: p.imagem || "",
            imagemHover: p.imagemHover,
            tamanho: p.dimensao,
            dimensao,
            imagens: p.imagens,
            composicao: p.composicao,
            destaques: p.destaques
          };
        });
      }
    });

    setCachedProductsBySize(newCache);
    
    if (allLoaded && isInitialLoading && !loadingApi) {
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
    }
  }, [
    sapatos32.data, sapatos33.data, sapatos34.data, sapatos35.data, sapatos36.data, sapatos37.data, sapatos38.data, sapatos39.data, sapatos40.data, sapatos41.data, sapatos42.data, sapatos43.data, sapatos44.data, sapatos45.data, sapatos46.data,
    sapatos32.isLoading, sapatos33.isLoading, sapatos34.isLoading, sapatos35.isLoading, sapatos36.isLoading, sapatos37.isLoading, sapatos38.isLoading, sapatos39.isLoading, sapatos40.isLoading, sapatos41.isLoading, sapatos42.isLoading, sapatos43.isLoading, sapatos44.isLoading, sapatos45.isLoading, sapatos46.isLoading,
    isInitialLoading, loadingApi, sapatos32, sapatos33, sapatos34, sapatos35, sapatos36, sapatos37, sapatos38, sapatos39, sapatos40, sapatos41, sapatos42, sapatos43, sapatos44, sapatos45, sapatos46
  ]);

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

    // Se há filtros de tamanho, usar dados do cache
    if (selectedSizes.length > 0) {
      const produtosComTamanho: Produto[] = [];
      
      selectedSizes.forEach(tamanho => {
        const sapatosKey = `sapatos-${tamanho}`;
        const sapatosCached = cachedProductsBySize[sapatosKey];
        if (sapatosCached) {
          produtosComTamanho.push(...sapatosCached);
        }
      });
      
      // Se encontrou produtos com tamanho, usar eles
      if (produtosComTamanho.length > 0) {
        // Remover duplicatas baseado no ID
        const uniqueProducts = produtosComTamanho.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        arr = uniqueProducts;
      } else {
        // Se não encontrou produtos com o tamanho no cache, mostrar array vazio
        arr = [];
      }
    }

    // Aplicar outros filtros
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
  }, [produtos, cachedProductsBySize, selectedCategorias, selectedMarcas, selectedDimensions, selectedSizes, sortBy]);

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
          tamanhosDisponiveis={tamanhosSapatos}
        />
      }
    >
      {filtrados.map((p, idx) => (
        <article key={p.id} className="group">
          <Link href={`/produtos/sapatos/detalhes/${p.id}`} className="block focus:outline-none">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-auto md:h-[520px] flex flex-col">
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
              <div className="h-px bg-gray-800/10"></div>

              <div className="p-3 md:p-4 flex-1 flex flex-col justify-between min-h-0 relative">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    sapatos
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black transition-colors text-sm md:text-base">
                    {p.titulo}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-3 md:line-clamp-2">
                    {p.descricao}
                  </p>
                </div>
                
                <div className="flex items-start justify-start mt-auto pt-2 pr-12">
                  <div>
                    <span className="text-base md:text-lg font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-black group-hover:via-gray-700 group-hover:to-black transition-all duration-300">
                      {formatBRL(p.preco)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
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
                  className={`absolute bottom-3 right-3 w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
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
