// src/app/components/Hero.tsx
import Image from "next/image";

type Props = {
  /** título ao lado da imagem */
  title?: string;
  /** bio curta do site de compras */
  subtitle?: string;
  /** texto do botão */
  ctaText?: string;
  /** link do botão */
  ctaHref?: string;
  /** caminho da imagem no /public */
  imgSrc?: string;
  /** alt da imagem */
  imgAlt?: string;
};

export default function Hero({
  title = "O Poder da Moda",
  subtitle = "A moda surge no encontro entre necessidade e desejo. Protege contra o frio, mas também afirma quem somos. Nasce como ritual de pertencimento, mas cresce como espaço de liberdade individual. Ela pode ser efêmera, mas seu significado é eterno: a moda é memória, identidade e futuro condensados em tecido e forma.",
  ctaText = "Compre agora",
  ctaHref = "/colecao",
  imgSrc = "/Hero_1.png",
  imgAlt = "Coleção de luxo Luigara"
}: Props) {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Imagem à esquerda */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden">
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              priority
              sizes="(min-width:1280px) 50vw, (min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Texto à direita */}
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {title}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-prose">
              {subtitle}
            </p>

            <a
              href={ctaHref}
              className="mt-6 inline-flex items-center justify-center rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-900 hover:text-white transition"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
