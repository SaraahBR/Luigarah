"use client";

import { use as useUnwrap, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductGallery from "./ProductGallery";

import { useDispatch, useSelector } from "react-redux";
import { selectIsInWishlist, toggleWishlist } from "@/store/wishlistSlice";
import { addToCart } from "@/store/cartSlice";
import type { AppDispatch } from "@/store";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCatalogo } from "@/i18n/useCatalogo";

// Auth + gatilho do modal
import { useAuthUser } from "@/app/login/useAuthUser";
import { requestLogin } from "@/app/login/loginModal";

// Importar hooks do banco de dados
import { useProdutoCompleto } from "@/hooks/useProdutoCompleto";
import SimpleLoader from "@/app/components/SimpleLoader";
import { parseArrayField } from "@/lib/arrayUtils";


export default function DetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = useUnwrap(params);
  const t = useTranslations("produtoDetalhe");
  const cat = useCatalogo();
  const formatBRL = cat.preco;

  const { isAuthenticated } = useAuthUser();

  // Usar hook para buscar produto completo do banco (com tamanhos e estoque)
  const { 
    produto, 
    tamanhosComEstoque, 
    isLoading, 
    error,
    estoqueError,
    hasStock 
  } = useProdutoCompleto(Number(id));

  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const pid = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const isInWishlist = useSelector(selectIsInWishlist(pid, "roupas"));

  // Função para validar se é uma URL válida
  const isValidUrl = (url: string): boolean => {
    try {
      // Verifica se é uma URL completa
      new URL(url);
      return true;
    } catch {
      // Se não for uma URL absoluta, verifica se é um caminho relativo válido
      return url.startsWith('/') && url.length > 1 && !url.endsWith('/') &&
             url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null;
    }
  };

  // Parse destaques para garantir que seja sempre um array
  const destaquesParsed = useMemo(() => {
    return produto?.destaques ? parseArrayField(produto.destaques) : [];
  }, [produto?.destaques]);

  // Parse imagens para garantir que seja um array
  const imagensParsed = useMemo(() => {
    return produto?.imagens ? parseArrayField(produto.imagens) : [];
  }, [produto?.imagens]);

  // Cria galeria de imagens filtrando apenas URLs válidas
  const galleryImages = useMemo(() => {
    if (!produto) return [];
    
    return [
      produto.imagem,
      produto.imagemHover,
      ...imagensParsed
    ].filter((img): img is string => 
      Boolean(img) && 
      typeof img === 'string' && 
      img.trim() !== '' && 
      img !== '/' && 
      isValidUrl(img)
    );
  }, [produto, imagensParsed]);

  // Remove duplicatas e limita a 7 imagens
  const gallery = useMemo(() => {
    return Array.from(new Set(galleryImages)).slice(0, 7);
  }, [galleryImages]);

  // Verificar estados de loading e erro
  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  if (error || !produto) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">{t("notFound")}</p>
      </section>
    );
  }

  // Encontra o estoque do tamanho selecionado
  const selectedTamanho = tamanhosComEstoque?.find(t => t.etiqueta === size);
  const stockAvailable = selectedTamanho?.qtdEstoque || 0;
  
  const canBuy = Boolean(size) && stockAvailable > 0;

  const handleComprar = () => {
    if (!isAuthenticated) {
      requestLogin(t("loginToBuy"), "cart");
      return;
    }
    if (!size) {
      toast.error(t("selectSize"));
      return;
    }
    
    if (stockAvailable <= 0) {
      toast.error(t("sizeOutOfStock"));
      return;
    }

    if (qty > stockAvailable) {
      toast.error(t("maxQty", { count: stockAvailable }));
      return;
    }

    dispatch(
      addToCart({
        id: produto.id!,
        tipo: "roupas",
        qty,
        title: `${produto.titulo} ${cat.tipo(produto)}`,
        subtitle: `${cat.tipo(produto)} • ${t("sizeShort")}: ${size}`,
        img: produto.imagem,
        preco: produto.preco,
        tamanhoId: selectedTamanho?.id, // ✅ Adiciona o ID do tamanho
      })
    );
    router.push("/carrinho");
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      requestLogin(t("loginToWishlist"), "wishlist");
      return;
    }
    if (isInWishlist) {
      toast(t("removedWishlist"), { description: `${produto.titulo} ${cat.tipo(produto)}` });
    } else {
      toast.success(t("addedWishlist"), { description: `${produto.titulo} ${cat.tipo(produto)}` });
    }
    dispatch(
      toggleWishlist({
        id: produto.id!,
        tipo: "roupas",
        title: `${produto.titulo} ${cat.tipo(produto)}`,
        img: produto.imagem,
      })
    );
  };

  return (
    <section className="bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Galeria */}
          <div className="order-1 lg:order-1 lg:col-span-5">
            <ProductGallery images={gallery} className="min-h-[200px] sm:h-[400px] lg:h-[460px] flex items-end" />
          </div>

          {/* Coluna compra */}
          <aside className="order-2 lg:order-2 lg:col-span-4">
            <h2 className="text-xl font-semibold">{produto.titulo}</h2>
            <p className="text-sm text-zinc-500">
              {cat.tipo(produto)} • {produto.autor}
            </p>
            <p className="mt-2 text-zinc-700">{produto.descricao}</p>
            <p className="mt-4 text-2xl font-medium">{formatBRL(produto.preco || 0)}</p>

            {produto.composicao && (
              <div className="mt-4 text-sm text-zinc-700">
                <span className="font-semibold">{t("composition")}: </span>
                {produto.composicao}
              </div>
            )}

            <div className="mt-6">
              {estoqueError && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs text-amber-800">
                     {t("stockError")}
                  </p>
                </div>
              )}
              <label className="mb-2 block text-sm text-zinc-700">
                {t("size")} {!hasStock && <span className="text-red-500">({t("noStock")})</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {tamanhosComEstoque && tamanhosComEstoque.length > 0 ? (
                  tamanhosComEstoque.map((tamanho, index) => (
                    <button
                      key={`${tamanho.etiqueta}-${index}`}
                      disabled={tamanho.qtdEstoque === 0}
                      onClick={() => setSize(tamanho.etiqueta)}
                    className={[
                      "rounded-md border px-3 py-2 text-sm transition-colors duration-200 relative",
                      size === tamanho.etiqueta
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : tamanho.qtdEstoque > 0
                        ? "border-zinc-300 hover:bg-zinc-50"
                        : "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed",
                    ].join(" ")}
                    aria-pressed={size === tamanho.etiqueta}
                    title={
                      tamanho.qtdEstoque > 0 
                        ? `${tamanho.etiqueta} - ${t("inStock", { count: tamanho.qtdEstoque })}`
                        : `${tamanho.etiqueta} - ${t("noStock")}`
                    }
                  >
                    {tamanho.etiqueta}
                  </button>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">{t("sizesUnavailable")}</p>
                )}
              </div>
              {!size && hasStock && (
                <p className="mt-2 text-xs text-red-600">
                  * {t("selectSizeBefore")}
                </p>
              )}
              {!hasStock && (
                <p className="mt-2 text-xs text-red-600">
                  * {t("productOutOfStock")}
                </p>
              )}
              {size && selectedTamanho && (
                <p className="mt-2 text-xs text-zinc-500">
                  {t("selected", { size })} • {selectedTamanho.qtdEstoque > 0 
                    ? t("unitsAvailable", { count: selectedTamanho.qtdEstoque }) 
                    : t("noStock")}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="qty" className="mb-2 block text-sm text-zinc-700">
                {t("quantity")}
                {size && stockAvailable > 0 && (
                  <span className="text-xs text-zinc-500 ml-1">
                    ({t("max", { count: stockAvailable })})
                  </span>
                )}
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                max={stockAvailable > 0 ? stockAvailable : 1}
                value={qty}
                onChange={(e) => {
                  const value = parseInt(e.target.value || "1", 10);
                  const maxQty = stockAvailable > 0 ? stockAvailable : 1;
                  setQty(Math.max(1, Math.min(value, maxQty)));
                }}
                className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                disabled={!size || stockAvailable === 0}
              />
              {size && stockAvailable > 0 && qty > stockAvailable && (
                <p className="mt-1 text-xs text-red-600">
                  {t("maxAvailable", { count: stockAvailable })}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={canBuy ? handleComprar : undefined}
                disabled={!canBuy}
                aria-disabled={!canBuy}
                title={
                  !hasStock 
                    ? t("productOutOfStockShort") 
                    : !size 
                    ? t("selectSizeShort") 
                    : stockAvailable <= 0
                    ? t("sizeOutOfStockShort")
                    : t("addToCart")
                }
                className={[
                  "flex-1 rounded-md px-5 py-3 text-sm font-medium",
                  canBuy
                    ? "bg-zinc-900 text-white hover:bg-black"
                    : "bg-zinc-300 text-zinc-500 cursor-not-allowed",
                ].join(" ")}
              >
                {!hasStock ? t("soldOut") : t("buy")}
              </button>

              <button
                onClick={handleWishlist}
                aria-pressed={isInWishlist}
                className={[
                  "inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-medium",
                  isInWishlist
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "border-zinc-300 hover:bg-zinc-50 text-zinc-900",
                ].join(" ")}
              >
                <FiHeart className={isInWishlist ? "text-white" : "text-zinc-900"} />
                {t("wishlist")}
              </button>
            </div>

            {/* Destaques - Mobile (visível apenas em telas pequenas) */}
            {destaquesParsed.length > 0 && (
              <div className="mt-6 lg:hidden">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700">{t("highlights")}</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {destaquesParsed.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previsão de entrega - Mobile */}
            <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm lg:hidden">
              <p className="font-medium">{t("deliveryEstimate")}</p>
              <p className="text-zinc-600">{t("deliveryDates")}</p>
            </div>

            {/* Seção de modelo comentada temporariamente - não implementada no backend ainda */}
            {/*produto.model && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700">
                  Medidas do(a) modelo
                </h3>
                <dl className="grid grid-cols-2 gap-2 text-sm text-zinc-700">
                  <div>
                    <dt className="text-zinc-500">Altura</dt>
                    <dd>{(produto.model.height_cm / 100).toFixed(2)} m</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Busto/peito</dt>
                    <dd>{produto.model.bust_cm} cm</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Cintura</dt>
                    <dd>{produto.model.waist_cm} cm</dd>
                  </div>
                  <button
                    type="submit"
                    className="w-full lg:w-auto rounded-md bg-black px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    {t("subscribe")}
                  </button>
                  O(a) modelo usa tamanho {produto.model.wears}.
                </p>
              </div>
            )*/}
          </aside>

          {/* Coluna Destaques e Previsão - Desktop (visível apenas em telas grandes) */}
          <aside className="order-2 hidden lg:block lg:order-3 lg:col-span-3">
            {destaquesParsed.length > 0 && (
              <div className="rounded-lg border border-zinc-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-zinc-700">{t("highlights")}</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  {destaquesParsed.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previsão de entrega - Desktop */}
            <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm">
              <p className="font-medium">{t("deliveryEstimate")}</p>
              <p className="text-zinc-600">{t("deliveryDates")}</p>
            </div>
          </aside>
        </div>

        {/* Newsletter (full-width, abaixo do grid) */}
        <div className="mt-8 rounded-2xl border border-zinc-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">{t("newsletterTitle")}</h3>
              <p className="mt-2 max-w-prose text-sm text-zinc-600">
                {t("newsletterText")}
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(t("newsletterSuccess"));
              }}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              <div className="w-full">
                <label htmlFor="newsletter-email" className="mb-2 block text-sm">
                  {t("email")}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  {t("newsletterConsent")}
                </p>
              </div>
              <button
                type="submit"
                className="min-w-[160px] sm:w-auto whitespace-nowrap rounded-md bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-black flex-shrink-0"
              >
                {t("subscribe")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
