"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiHome, FiShoppingBag } from "react-icons/fi";
import { motion } from "framer-motion";

/** ---------- Confetti: canvas puro (sem libs) ---------- */
function ConfettiBurst({ duration = 2500, count = 120 }: { duration?: number; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const colors = ["#fde047", "#facc15", "#f59e0b", "#eab308", "#f97316"];
    type P = { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vr: number };
    const parts: P[] = Array.from({ length: count }).map(() => ({
      x: w / 2,
      y: h / 3,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 4,
      size: Math.random() * 6 + 4,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    }));

    const start = performance.now(); // <- prefer-const (corrigido)
    let raf = 0;

    const loop = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      // fundo transparente; desenha partículas
      for (const p of parts) {
        // física simples
        p.vy += 0.15; // gravidade
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        // “retângulo” / papelzinho
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * (0.6 + Math.random() * 0.4));
        ctx.restore();
      }

      // para após duração
      if (elapsed < duration) {
        raf = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [count, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  );
}

/** ---------- Estrela SVG com preenchimento parcial (0/50/100%) ---------- */
function Star({
  fillPercent, // 0 | 50 | 100
  size = 28,
  title,
}: {
  fillPercent: 0 | 50 | 100;
  size?: number;
  title?: string;
}) {
  const id = useMemo(() => `grad-${Math.random().toString(36).slice(2)}`, []);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 19.9 7.3 13.4 2.6 8.8l6.5-.9L12 2z"
        fill="none"
        stroke="#d4d4d8"
        strokeWidth="1.25"
      />
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fde047" /> {/* yellow-300 */}
          <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width={`${fillPercent}%`} height="100%" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 19.9 7.3 13.4 2.6 8.8l6.5-.9L12 2z"
          fill={`url(#${id})`}
        />
      </g>
    </svg>
  );
}

/** ---------- Helper de exibição da nota ----------
 * Inteiro: mostra sem .0 (ex.: 4)
 * Decimal: mostra com 1 casa (ex.: 3.5)
 */
function formatRating(v: number): string {
  const isInt = Math.abs(v - Math.round(v)) < 1e-9;
  return isInt ? String(Math.round(v)) : v.toFixed(1);
}

/** ---------- Componente Rating (0..5 em passos de 0.5) ---------- */
function StarRating({
  value,
  onChange,
}: {
  value: number; // 0..5 (passo 0.5)
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  function starFill(index: number): 0 | 50 | 100 {
    const relative = display - index; // 0..1
    if (relative >= 1) return 100;
    if (relative >= 0.5) return 50;
    return 0;
  }

  return (
    <div className="select-none">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = starFill(i);
          const label = `${i + 1} estrela${i ? "s" : ""}`;
          return (
            <div key={i} className="relative" onMouseLeave={() => setHover(null)}>
              {/* Zona esquerda: 0.5 */}
              <button
                type="button"
                aria-label={`${i + 0.5} estrelas`}
                className="absolute left-0 top-0 h-full w-1/2"
                onMouseEnter={() => setHover(i + 0.5)}
                onFocus={() => setHover(i + 0.5)}
                onClick={() => onChange(i + 0.5)}
              />
              {/* Zona direita: inteiro */}
              <button
                type="button"
                aria-label={label}
                className="absolute right-0 top-0 h-full w-1/2"
                onMouseEnter={() => setHover(i + 1)}
                onFocus={() => setHover(i + 1)}
                onClick={() => onChange(i + 1)}
              />
              <Star fillPercent={fill} title={label} />
            </div>
          );
        })}
        <span className="ml-2 text-sm text-zinc-600">{formatRating(display)} / 5</span>
      </div>
    </div>
  );
}

/** ---------- Página ---------- */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    // confete ao montar
    // (renderiza o canvas por ~2.5s)
  }, []);

  const sentiment = useMemo(() => {
    if (rating <= 1) return "Que pena, vamos melhorar!";
    if (rating <= 2) return "Obrigado pelo feedback!";
    if (rating <= 3) return "Bom, mas queremos surpreender!";
    if (rating <= 4) return "Que legal!";
    return "Uau, muito obrigado! ♥";
  }, [rating]);

  function onSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Obrigado pelo seu feedback!");
    setComment("");
  }

  return (
    <main className="min-h-[80vh] bg-white text-black relative overflow-hidden">
      {/* Confetti overlay */}
      <ConfettiBurst />

      {/* HERO */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-black text-white shadow-lg"
            >
              <FiShoppingBag className="text-2xl" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Obrigado por testar a nossa página!
            </h1>
            <p className="mt-4 text-zinc-600 leading-relaxed">
              Este projeto foi construído com muito carinho e dedicação, inspirado na experiência
              da Farfetch e seguindo boas práticas de UI/UX Design. Esperamos que você tenha gostado — sua opinião faz toda a diferença.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                <span className="inline-flex items-center gap-2">
                  <FiHome /> Voltar para a Home
                </span>
              </button>
              <button
                onClick={() => router.push("/produtos/marcas")}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                Continuar explorando
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Como foi a sua experiência?</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Avalie de 0 a 5.
          </p>

          <div className="mt-5">
            <StarRating value={rating} onChange={setRating} />
            <p className="mt-2 text-sm text-zinc-700">{sentiment}</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmitFeedback}>
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-700">Deixe um comentário (opcional)</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Conte pra gente o que você mais gostou e o que podemos melhorar."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </label>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Sua avaliação: <strong>{formatRating(rating)}</strong>/5
              </span>
              <button
                type="submit"
                className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-900"
                title="Enviar feedback"
              >
                Enviar feedback
              </button>
            </div>
          </form>
        </motion.div>

        <p className="mt-10 text-center text-xs text-zinc-500">
          Feito com ♥ pela equipe LUIGARAH — obrigado por experimentar!
        </p>
      </section>
    </main>
  );
}
