"use client";

import { use as useUnwrap, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import bolsasData from "../../../../../data/bolsas.json";
import ProductGallery from "./ProductGallery";

import { useDispatch, useSelector } from "react-redux";
import { selectIsInWishlist, toggle } from "@/store/wishlistSlice";
import { add as addCartItem } from "@/store/cartSlice";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";

// 🔐 Auth + gatilho do modal
import { useAuthUser } from "@/app/login/useAuthUser";
import { requestLogin } from "@/app/login/loginModal";

type Produto = {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  preco: number;
  dimension?: "Grande" | "Média" | "Pequena" | "Mini";
  img: string;
  imgHover?: string;
  images?: string[];
  composition?: string;
  highlights?: string[];
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function DetalhesBolsaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = useUnwrap(params);

  const { isAuthenticated } = useAuthUser(); // << checa login

  const produtos = (bolsasData as { produtos: Produto[] }).produtos;
  const produto = useMemo(() => produtos.find((p) => String(p.id) === id), [produtos, id]);

  const [qty, setQty] = useState<number>(1);

  const pid = Number(id);
  const dispatch = useDispatch();
  const isInWishlist = useSelector(selectIsInWishlist(pid, "bolsas"));

  if (!produto) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-zinc-700">Produto não encontrado.</p>
      </section>
    );
  }

  const gallery = Array.from(
    new Set([produto.img, produto.imgHover ?? produto.img, ...(produto.images ?? [])])
  ).slice(0, 7);

  const handleComprar = () => {
    // 🔐 exige login
    if (!isAuthenticated) {
      requestLogin("É necessário estar logado para comprar.", "cart");
      return;
    }
    dispatch(
      addCartItem({
        id: produto.id,
        tipo: "bolsas",
        qty,
        title: `${produto.title} ${produto.subtitle}`,
        subtitle: produto.subtitle,
        img: produto.img,
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
      toast("Removido da Wishlist", { description: `${produto.title} ${produto.subtitle}` });
    } else {
      toast.success("Adicionado à Wishlist", { description: `${produto.title} ${produto.subtitle}` });
    }
    dispatch(
      toggle({
        id: produto.id,
        tipo: "bolsas",
        title: `${produto.title} ${produto.subtitle}`,
        img: produto.img,
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
            <h2 className="text-xl font-semibold">{produto.title}</h2>
            <p className="text-sm text-zinc-500">
              {produto.subtitle} • {produto.author}
            </p>
            <p className="mt-2 text-zinc-700">{produto.description}</p>
            <p className="mt-1 text-xs text-zinc-500">Tamanho único disponível</p>
            <p className="mt-4 text-2xl font-medium">{formatBRL(produto.preco)}</p>

            {produto.composition && (
              <div className="mt-4 text-sm text-zinc-700">
                <span className="font-semibold">Composição: </span>
                {produto.composition}
              </div>
            )}

            {/* Quantidade */}
            <div className="mt-4">
              <label htmlFor="qty" className="mb-2 block text-sm text-zinc-700">
                Quantidade
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value || "1", 10)))
                }
                className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            {/* Ações */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleComprar}
                className="flex-1 rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-black"
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
            {produto.highlights && produto.highlights.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700">Destaques</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {produto.highlights.map((h, i) => (
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
