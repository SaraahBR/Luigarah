"use client";

import { use as useUnwrap, useState } from "react";
import { useRouter } from "next/navigation";
import ProductGallery from "./ProductGallery";

import { useDispatch, useSelector } from "react-redux";
import { selectIsInWishlist, toggle } from "@/store/wishlistSlice";
import { add as addCartItem } from "@/store/cartSlice";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";

// 🔐 Auth + gatilho do modal
import { useAuthUser } from "@/app/login/useAuthUser";
import { requestLogin } from "@/app/login/loginModal";

// Importar hooks do banco de dados
import { useProdutoCompleto } from "@/hooks/useProdutoCompleto";
import SimpleLoader from "@/app/components/SimpleLoader";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function DetalhesBolsaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = useUnwrap(params);

  const { isAuthenticated } = useAuthUser(); // << checa login

  // Usar hook para buscar produto completo do banco (com estoque para bolsas)
  const { 
    produto, 
    estoqueBolsa,
    isLoading, 
    error, 
    hasStock 
  } = useProdutoCompleto(Number(id));

  const [qty, setQty] = useState<number>(1);

  const pid = Number(id);
  const dispatch = useDispatch();
  const isInWishlist = useSelector(selectIsInWishlist(pid, "bolsas"));

  // Verificar estados de loading e erro
  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  if (error || !produto) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Produto não encontrado.</p>
      </section>
    );
  }

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

  // Cria galeria de imagens filtrando apenas URLs válidas
  const galleryImages = [
    produto.imagem,
    produto.imagemHover,
    ...(Array.isArray(produto.imagens) ? produto.imagens : [])
  ].filter((img): img is string => 
    Boolean(img) && 
    typeof img === 'string' && 
    img.trim() !== '' && 
    img !== '/' && 
    isValidUrl(img)
  );

  // Remove duplicatas e limita a 7 imagens
  const gallery = Array.from(new Set(galleryImages)).slice(0, 7);

  // Para bolsas, usar estoque do produto
  const stockAvailable = estoqueBolsa || 0;
  const canBuy = hasStock;

  const handleComprar = () => {
    // 🔐 exige login
    if (!isAuthenticated) {
      requestLogin("É necessário estar logado para comprar.", "cart");
      return;
    }
    
    // Verificar estoque
    if (stockAvailable <= 0) {
      toast.error("Produto sem estoque disponível.");
      return;
    }

    // Verificar quantidade solicitada
    if (qty > stockAvailable) {
      toast.error(`Quantidade solicitada (${qty}) excede o estoque disponível (${stockAvailable}).`);
      return;
    }
    
    dispatch(
      addCartItem({
        id: produto.id!,
        tipo: "bolsas",
        qty,
        title: `${produto.titulo} ${produto.subtitulo}`,
        subtitle: produto.subtitulo,
        img: produto.imagem,
        preco: produto.preco,
      })
    );
    router.push("/carrinho");
  };

  const handleWishlist = () => {
    // 🔐 exige login
    if (!isAuthenticated) {
      requestLogin("É necessário estar logado para adicionar à Wishlist.", "wishlist");
      return;
    }
    if (isInWishlist) {
      toast("Removido da Wishlist", { description: `${produto.titulo} ${produto.subtitulo}` });
    } else {
      toast.success("Adicionado à Wishlist", { description: `${produto.titulo} ${produto.subtitulo}` });
    }
    dispatch(
      toggle({
        id: produto.id!,
        tipo: "bolsas",
        title: `${produto.titulo} ${produto.subtitulo}`,
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
              {produto.subtitulo} • {produto.autor}
            </p>
            <p className="mt-2 text-zinc-700">{produto.descricao}</p>
            <p className="mt-4 text-2xl font-medium">{formatBRL(produto.preco || 0)}</p>

            {produto.composicao && (
              <div className="mt-4 text-sm text-zinc-700">
                <span className="font-semibold">Composição: </span>
                {produto.composicao}
              </div>
            )}

            {/* Quantidade */}
            <div className="mt-6">
              <label htmlFor="qty" className="mb-2 block text-sm text-zinc-700">
                Quantidade
                {stockAvailable > 0 && (
                  <span className="text-xs text-zinc-500 ml-1">
                    (máx: {stockAvailable})
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
                disabled={stockAvailable === 0}
              />
              {stockAvailable > 0 && qty > stockAvailable && (
                <p className="mt-1 text-xs text-red-600">
                  Quantidade máxima disponível: {stockAvailable}
                </p>
              )}
              {stockAvailable > 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  {stockAvailable} unidade(s) disponível(is)
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={canBuy ? handleComprar : undefined}
                disabled={!canBuy}
                aria-disabled={!canBuy}
                title={
                  stockAvailable <= 0 
                    ? "Produto sem estoque" 
                    : "Adicionar ao carrinho"
                }
                className={[
                  "flex-1 rounded-md px-5 py-3 text-sm font-medium",
                  canBuy
                    ? "bg-zinc-900 text-white hover:bg-black"
                    : "bg-zinc-300 text-zinc-500 cursor-not-allowed",
                ].join(" ")}
              >
                {!hasStock ? "Produto Esgotado" : "Comprar"}
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
                Wishlist
              </button>
            </div>

            {/* Destaques - Mobile (visível apenas em telas pequenas) */}
            {produto.destaques && Array.isArray(produto.destaques) && produto.destaques.length > 0 && (
              <div className="mt-6 lg:hidden">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700">Destaques</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {produto.destaques.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previsão de entrega - Mobile */}
            <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm lg:hidden">
              <p className="font-medium">Previsão de entrega</p>
              <p className="text-zinc-600">1 de set. – 5 de set.</p>
            </div>
          </aside>

          {/* Coluna Destaques e Previsão - Desktop (visível apenas em telas grandes) */}
          <aside className="order-2 hidden lg:block lg:order-3 lg:col-span-3">
            {produto.destaques && Array.isArray(produto.destaques) && produto.destaques.length > 0 && (
              <div className="rounded-lg border border-zinc-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-zinc-700">Destaques</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  {produto.destaques.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previsão de entrega - Desktop */}
            <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm">
              <p className="font-medium">Previsão de entrega</p>
              <p className="text-zinc-600">1 de set. – 5 de set.</p>
            </div>
          </aside>
        </div>

        {/* Newsletter (full-width, abaixo do grid) */}
        <div className="mt-8 rounded-2xl border border-zinc-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Fique por dentro das novidades</h3>
              <p className="mt-2 max-w-prose text-sm text-zinc-600">
                Cadastre-se para receber: novidades, promoções, atualizações de estoque e muito
                mais.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Inscrição realizada com sucesso!");
              }}
                className="mt-8 flex flex-col lg:flex-row gap-3 items-end lg:items-center"
            >
              <div className="w-full">
                <label htmlFor="newsletter-email" className="mb-2 block text-sm">
                  E-mail
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Ao se cadastrar, você concorda com nossa Política de privacidade.
                </p>
              </div>
                <button
                  type="submit"
                  className="min-w-[160px] lg:w-auto whitespace-nowrap rounded-md bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-black flex-shrink-0"
                >
                  Cadastre-se
                </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
