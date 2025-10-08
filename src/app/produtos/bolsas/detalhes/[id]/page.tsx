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

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function DetalhesBolsaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = useUnwrap(params);

  const { isAuthenticated } = useAuthUser(); // << checa login

  // Usar hook para buscar produto completo do banco (com tamanhos e estoque)
  const { 
    produto, 
    tamanhosComEstoque, 
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
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Carregando produto...</p>
      </section>
    );
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

  // Para bolsas, não há tamanhos - usar stock padrão
  const stockAvailable = 1; // Assumindo que bolsas têm estoque padrão de 1
  const canBuy = true; // Bolsas podem ser compradas diretamente

  const handleComprar = () => {
    // 🔐 exige login
    if (!isAuthenticated) {
      requestLogin("É necessário estar logado para comprar.", "cart");
      return;
    }
    
    // Para bolsas não há verificação de tamanho ou estoque específico
    
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Galeria */}
          <div className="order-1 lg:order-1 lg:col-span-8">
            <ProductGallery images={gallery} />
          </div>

          {/* Coluna de compra */}
          <aside className="order-3 lg:order-2 lg:col-span-4">
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
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                  const value = parseInt(e.target.value || "1", 10);
                  setQty(Math.max(1, value));
                }}
                className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            {/* Ações */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleComprar}
                className="flex-1 rounded-md px-5 py-3 text-sm font-medium bg-zinc-900 text-white hover:bg-black"
              >
                Comprar
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

            {/* Entrega */}
            <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm">
              <p className="font-medium">Previsão de entrega</p>
              <p className="text-zinc-600">1 de set. – 5 de set.</p>
            </div>

            {/* Destaques */}
            {produto.destaques && Array.isArray(produto.destaques) && produto.destaques.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700">Destaques</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {produto.destaques.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Newsletter */}
        <div className="mt-16 rounded-2xl border border-zinc-200 p-6 sm:p-8">
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
              className="flex items-end gap-3"
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
                className="whitespace-nowrap rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
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
