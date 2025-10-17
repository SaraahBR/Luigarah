"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FlyToCartAnimation from "../../components/FlyToCartAnimation";
import { slugify } from "@/lib/slug";
import MarcasLayout from "./tailwind";
import FiltersSidebar from "./FiltersSidebar";
import HeartButton from "../../components/HeartButton";
import CartButtonCircle from "@/app/components/cart/CartButtonCircle";
import { 
  useGetProdutosPorCategoriaETamanhoQuery
} from "@/store/productsApi";
import SimpleLoader from "../../components/SimpleLoader";

type SortKey = "nossa" | "novidades" | "maior" | "menor";

type Produto = {
  id?: number;
  titulo?: string;      // marca
  subtitulo?: string;   // categoria  
  autor?: string;
  descricao?: string;
  preco?: number;
  imagem?: string;
  imagemHover?: string;
  tamanho?: string;
  dimensao?: string;
  imagens?: string[];
  composicao?: string;
  destaques?: string[];
  __tipo?: "bolsas" | "roupas" | "sapatos";
  __tamanhos?: string[]; // Tamanhos disponíveis para este produto
};

export default function ClientMarcasIndex({
  titulo,
  produtos,
  marcas,
  categorias,
  tamanhosDisponiveis = [],
}: {
  titulo: string;
  produtos: Produto[];
  marcas: string[];
  categorias: string[];
  tamanhosDisponiveis?: string[];
}) {
  const search = useSearchParams();
  const categoriaQuery = (search.get("categoria") || "").toLowerCase();

  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("nossa");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [cachedProductsBySize, setCachedProductsBySize] = useState<{
    [key: string]: Produto[]
  }>({});

  // Estados para animação do carrinho
  const [flyAnimation, setFlyAnimation] = useState({
    isActive: false,
    productImage: '',
    productTitle: '',
    startPosition: { x: 0, y: 0 }
  });

  // Hooks individuais para cada tamanho - isso é necessário para cumprir as regras dos React Hooks
  const roupasXXXS = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'XXXS' });
  const roupasXXS = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'XXS' });
  const roupasXS = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'XS' });
  const roupasS = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'S' });
  const roupasM = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'M' });
  const roupasL = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'L' });
  const roupasXL = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'roupas', tamanho: 'XL' });
  
  const sapatos34 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '34' });
  const sapatos35 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '35' });
  const sapatos36 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '36' });
  const sapatos37 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '37' });
  const sapatos38 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '38' });
  const sapatos39 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '39' });
  const sapatos40 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '40' });
  const sapatos41 = useGetProdutosPorCategoriaETamanhoQuery({ categoria: 'sapatos', tamanho: '41' });

  // Mapear os queries para facilitar o acesso - usando useMemo para otimização
  const allQueries = useMemo(() => ({
    'roupas-XXXS': roupasXXXS,
    'roupas-XXS': roupasXXS,
    'roupas-XS': roupasXS,
    'roupas-S': roupasS,
    'roupas-M': roupasM,
    'roupas-L': roupasL,
    'roupas-XL': roupasXL,
    'sapatos-34': sapatos34,
    'sapatos-35': sapatos35,
    'sapatos-36': sapatos36,
    'sapatos-37': sapatos37,
    'sapatos-38': sapatos38,
    'sapatos-39': sapatos39,
    'sapatos-40': sapatos40,
    'sapatos-41': sapatos41,
  }), [
    roupasXXXS, roupasXXS, roupasXS, roupasS, roupasM, roupasL, roupasXL,
    sapatos34, sapatos35, sapatos36, sapatos37, sapatos38, sapatos39, sapatos40, sapatos41
  ]);

  // Efeito para cachear os dados pré-carregados
  useEffect(() => {
    const newCache: { [key: string]: Produto[] } = {};
    let allLoaded = true;

    // Verificar se todos os queries terminaram de carregar
    Object.entries(allQueries).forEach(([key, query]) => {
      if (query.isLoading) {
        allLoaded = false;
        return;
      }

      if (query.data) {
        const [categoria] = key.split('-');
        newCache[key] = query.data.map(p => ({ 
          ...p, 
          __tipo: categoria as 'roupas' | 'sapatos'
        }));
      }
    });

    setCachedProductsBySize(newCache);
    
    if (allLoaded && isInitialLoading) {
      // Aguardar um pouco para garantir que tudo foi carregado
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
    }
  }, [
    roupasXXXS.data, roupasXXS.data, roupasXS.data, roupasS.data, roupasM.data, roupasL.data, roupasXL.data,
    sapatos34.data, sapatos35.data, sapatos36.data, sapatos37.data, sapatos38.data, sapatos39.data, sapatos40.data, sapatos41.data,
    roupasXXXS.isLoading, roupasXXS.isLoading, roupasXS.isLoading, roupasS.isLoading, roupasM.isLoading, roupasL.isLoading, roupasXL.isLoading,
    sapatos34.isLoading, sapatos35.isLoading, sapatos36.isLoading, sapatos37.isLoading, sapatos38.isLoading, sapatos39.isLoading, sapatos40.isLoading, sapatos41.isLoading,
    isInitialLoading, allQueries
  ]);

  // aplica categoria igual desfile vinda da URL
  useEffect(() => {
    if (!categoriaQuery) return;
    const slug = slugify(categoriaQuery);
    setSelectedCategorias((prev) =>
      prev.includes(slug) ? prev : [...prev, slug]
    );
  }, [categoriaQuery]);

  const topPills: Array<{
    kind: "marca" | "tipo" | "categoria";
    label: string;
    value: string;
  }> = [
    { kind: "tipo", label: "Bolsas", value: "bolsas" },
    { kind: "tipo", label: "Roupas", value: "roupas" },
    { kind: "tipo", label: "Sapatos", value: "sapatos" },
    ...marcas
      .slice(0, 6)
      .map((m) => ({ kind: "marca" as const, label: m, value: slugify(m) })),
    ...categorias.slice(0, 3).map((c) => ({
      kind: "categoria" as const,
      label: c,
      value: slugify(c),
    })),
  ];

  const toggleMarca = (slug: string) =>
    setSelectedMarcas((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );
  const toggleTipo = (t: string) =>
    setSelectedTipos((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const toggleCategoria = (slug: string) =>
    setSelectedCategorias((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
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
    setSelectedMarcas([]);
    setSelectedTipos([]);
    setSelectedCategorias([]);
    setSelectedSizes([]);
    setSelectedDimensions([]);
    setSortBy("nossa");
  };

  const filtrados = useMemo(() => {
    let arr = [...produtos];

    // Se há filtros de tamanho, usar dados do cache
    if (selectedSizes.length > 0) {
      const produtosComTamanho: Produto[] = [];
      
      console.log('Tamanhos selecionados:', selectedSizes);
      console.log('Cache disponível:', Object.keys(cachedProductsBySize));
      
      selectedSizes.forEach(tamanho => {
        // Buscar roupas no cache se o tipo não está filtrado ou inclui roupas
        if (selectedTipos.length === 0 || selectedTipos.includes('roupas')) {
          const roupasKey = `roupas-${tamanho}`;
          const roupasCached = cachedProductsBySize[roupasKey];
          if (roupasCached) {
            console.log(`Adicionando ${roupasCached.length} roupas do tamanho ${tamanho}`);
            produtosComTamanho.push(...roupasCached);
          }
        }
        
        // Buscar sapatos no cache se o tipo não está filtrado ou inclui sapatos
        if (selectedTipos.length === 0 || selectedTipos.includes('sapatos')) {
          const sapatosKey = `sapatos-${tamanho}`;
          const sapatosCached = cachedProductsBySize[sapatosKey];
          if (sapatosCached) {
            console.log(`Adicionando ${sapatosCached.length} sapatos do tamanho ${tamanho}`);
            produtosComTamanho.push(...sapatosCached);
          }
        }
      });
      
      console.log('Total de produtos encontrados:', produtosComTamanho.length);
      
      // Se encontramos produtos com tamanho, usar eles
      if (produtosComTamanho.length > 0) {
        // Remover duplicatas baseado no ID
        const uniqueProducts = produtosComTamanho.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        console.log('Produtos únicos:', uniqueProducts.length);
        arr = uniqueProducts;
      } else {
        // Se não encontrou produtos com o tamanho no cache, mostrar array vazio
        arr = [];
      }
    }

    // Aplicar outros filtros
    if (selectedMarcas.length > 0) {
      arr = arr.filter((p) => selectedMarcas.includes(slugify(p.titulo ?? "")));
    }
    if (selectedTipos.length > 0 && selectedSizes.length === 0) {
      // Só aplicar filtro de tipo se não há filtro de tamanho (que já filtrou por tipo)
      arr = arr.filter((p) => p.__tipo && selectedTipos.includes(p.__tipo));
    }
    if (selectedCategorias.length > 0) {
      arr = arr.filter((p) =>
        selectedCategorias.includes(slugify(p.subtitulo ?? ""))
      );
    }
    if (selectedDimensions.length > 0) {
      arr = arr.filter(
        (p) => p.dimensao && selectedDimensions.includes(p.dimensao)
      );
    }

    // Aplicar ordenação
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
    cachedProductsBySize,
    selectedMarcas,
    selectedTipos,
    selectedCategorias,
    selectedSizes,
    selectedDimensions,
    sortBy,
  ]);

  // Mostrar loading simples durante o carregamento inicial
  if (isInitialLoading) {
    return <SimpleLoader isLoading={true} />;
  }

  return (
    <>
      <SimpleLoader isLoading={isInitialLoading} />
      
      <MarcasLayout
      title={titulo}
      subtitle="Explore todos os produtos de todas as marcas."
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
              pill.kind === "marca"
                ? selectedMarcas.includes(pill.value)
                : pill.kind === "tipo"
                ? selectedTipos.includes(pill.value)
                : selectedCategorias.includes(pill.value);

            return (
              <button
                key={pill.kind + pill.value}
                onClick={() =>
                  pill.kind === "marca"
                    ? toggleMarca(pill.value)
                    : pill.kind === "tipo"
                    ? toggleTipo(pill.value)
                    : toggleCategoria(pill.value)
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
          tamanhosDisponiveis={tamanhosDisponiveis}
        />
      }
    >
      {filtrados.map((p, idx) => (
        <article key={`${p.__tipo}-${p.id ?? idx}`} className="group">
          <Link
            href={`/produtos/${p.__tipo}/detalhes/${p.id ?? ""}`}
            className="block focus:outline-none"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-[420px] min-[525px]:h-[520px] sm:h-[540px] min-[723px]:h-[550px] min-[746px]:h-[555px] min-[770px]:h-[560px] md:h-[580px] lg:h-[600px] min-[1200px]:h-[610px] min-[1247px]:h-[615px] xl:h-[620px] flex flex-col">
              <div className="aspect-[4/5] relative bg-gray-100 flex-shrink-0 overflow-hidden">
                {/* Imagem principal */}
                <Image
                  src={p.imagem ?? ""}
                  alt={`${p.titulo ?? ""} — ${p.descricao ?? ""}`}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                  priority={idx < 4}
                  loading={idx < 4 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                />
                {/* Imagem hover - só aparece se existir */}
                {p.imagemHover && (
                  <Image
                    src={p.imagemHover}
                    alt={`${p.titulo ?? ""} — ${p.descricao ?? ""} (detalhe)`}
                    fill
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                  />
                )}
                <HeartButton
                  id={p.id ?? 0}
                  label={`${p.titulo ?? ""} ${p.subtitulo ?? ""}`}
                  img={p.imagem ?? ""}
                  tipo={p.__tipo ?? "bolsas"}
                />
              </div>
              
              {/* Linha divisória sutil */}
              <div className="h-px bg-gray-200"></div>

              <div className="p-3 min-[525px]:p-4 sm:p-4 min-[723px]:p-4.5 min-[746px]:p-4.5 min-[770px]:p-4.5 md:p-4.5 lg:p-5 min-[1200px]:p-5 min-[1247px]:p-5 xl:p-5 flex-1 flex flex-col relative">
                {/* Conteúdo superior: tipo, título e descrição */}
                <div className="flex-shrink-0 mb-1.5 min-[525px]:mb-2 sm:mb-2 min-[723px]:mb-2 min-[746px]:mb-2 md:mb-2.5 min-[1200px]:mb-2.5 min-[1247px]:mb-3">
                  <div className="text-xs min-[525px]:text-xs sm:text-xs md:text-[0.7rem] text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                    {p.__tipo ?? "produto"}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 group-hover:text-black transition-colors text-sm min-[525px]:text-[0.95rem] sm:text-[0.98rem] min-[723px]:text-[0.99rem] min-[746px]:text-[0.995rem] min-[770px]:text-base md:text-base lg:text-[1.05rem] min-[1200px]:text-[1.08rem] min-[1247px]:text-[1.09rem] line-clamp-2">
                    {p.titulo ?? ""}
                  </h3>
                  <p className="text-xs min-[525px]:text-[0.8rem] sm:text-[0.82rem] min-[723px]:text-[0.84rem] min-[746px]:text-[0.845rem] min-[770px]:text-[0.85rem] md:text-sm lg:text-[0.9rem] min-[1200px]:text-[0.92rem] min-[1247px]:text-[0.93rem] text-gray-600 line-clamp-2">
                    {p.descricao ?? ""}
                  </p>
                </div>
                
                {/* Seção inferior: preço e autor com altura mínima garantida */}
                <div className="mt-auto pr-12 min-[525px]:pr-14 sm:pr-14 min-[723px]:pr-15 min-[746px]:pr-15 min-[770px]:pr-15 md:pr-16 min-[1200px]:pr-16 min-[1247px]:pr-16 flex flex-col justify-end pb-2.5 min-[525px]:pb-3 sm:pb-3 md:pb-3.5 min-[1200px]:pb-4 min-[1247px]:pb-4">
                  <div className="space-y-1 min-[525px]:space-y-1.5 sm:space-y-1.5 min-[1200px]:space-y-2 min-[1247px]:space-y-2">
                    <span className="block text-base min-[525px]:text-[1.05rem] sm:text-[1.08rem] min-[723px]:text-[1.1rem] min-[746px]:text-[1.12rem] min-[770px]:text-lg md:text-lg lg:text-[1.15rem] min-[1200px]:text-[1.18rem] min-[1247px]:text-[1.19rem] xl:text-xl font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-black group-hover:via-gray-700 group-hover:to-black transition-all duration-300">
                      {(p.preco ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                      })}
                    </span>
                    <div className="text-xs min-[525px]:text-[0.75rem] sm:text-[0.78rem] min-[723px]:text-[0.8rem] min-[746px]:text-[0.81rem] md:text-sm min-[1200px]:text-[0.88rem] min-[1247px]:text-[0.89rem] text-gray-500">
                      {p.autor ?? ""}
                    </div>
                  </div>
                </div>
                
                {/* Botão do carrinho - posicionamento absoluto no canto */}
                <div className="absolute bottom-3 right-3 min-[525px]:bottom-4 min-[525px]:right-4 sm:bottom-4 sm:right-4 min-[723px]:bottom-4 min-[723px]:right-4 min-[746px]:bottom-4 min-[746px]:right-4 md:bottom-4 md:right-4 lg:bottom-5 lg:right-5 min-[1200px]:bottom-5 min-[1200px]:right-5 min-[1247px]:bottom-5 min-[1247px]:right-5">
                  <CartButtonCircle
                    id={p.id ?? 0}
                    tipo={p.__tipo ?? "roupas"}
                    preco={p.preco ?? 0}
                    title={`${p.titulo ?? ""} ${p.subtitulo ?? ""}`}
                    subtitle={p.descricao ?? ""}
                    img={p.imagem ?? ""}
                    onAdded={() => {
                      setFlyAnimation({
                        isActive: true,
                        productImage: p.imagem ?? "",
                        productTitle: p.titulo ?? "",
                        startPosition: { x: 0, y: 0 }
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </MarcasLayout>

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
