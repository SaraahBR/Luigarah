import Image from "next/image";
import RoupasLayout from "./tailwind";
import roupasData from "../../../data/roupas.json";
import HeartButton from "./../../components/HeartButton";

type Produto = {
  id: number;
  title: string;       // marca
  subtitle: string;    // categoria (Colete, Saia, etc.)
  author: string;      // designer/estilista
  description: string; // nome do produto
  preco: number;
  img: string;         // imagem principal
  imgHover?: string;   // imagem ao passar o mouse (fallback: img)
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

// Cabeçalho apenas para UI (não é SEO global)
const PAGE_TITLE = "Roupas de Luxo – Luigara";
const PAGE_SUBTITLE = "Vista-se para o seu festival favorito com o espírito livre de Isabel Marant e mais";

export default function Page() {
  const produtos = (roupasData as { produtos: Produto[] }).produtos;

  // garante a ordem por id (1,2,3,4...)
  const produtosOrdenados = [...produtos].sort((a, b) => a.id - b.id);

  return (
    <RoupasLayout title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {produtosOrdenados.map((p, idx) => (
        <article key={p.id} className="group">
          {/* Imagens: hover-swap */}
          <div className="relative overflow-hidden rounded-xl bg-zinc-100 aspect-[4/5]">
            <Image
              src={p.img}
              alt={`${p.title} — ${p.description}`}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
              priority={idx === 0}
            />
            <Image
              src={p.imgHover ?? p.img}
              alt={`${p.title} — ${p.description} (detalhe)`}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            />

            {/* Coração funcional */}
            <HeartButton id={p.id} label={`${p.title} ${p.subtitle}`} />
          </div>

          {/* Texto */}
          <div className="mt-4">
            <h3 className="font-semibold">{p.title}</h3>
            {/* <p className="text-xs text-zinc-500">{p.subtitle} • {p.author}</p> */}
            <p className="mt-1 text-zinc-700">{p.description}</p>
            <p className="mt-4 text-zinc-900">{formatBRL(p.preco)}</p>
          </div>
        </article>
      ))}
    </RoupasLayout>
  );
}
