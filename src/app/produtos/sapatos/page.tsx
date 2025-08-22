import SapatosLayout from "./tailwind";

export default function Page() {
  return (
    <SapatosLayout>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Stiletto Dourado</h2>
        <p className="mt-2 text-sm text-zinc-300">Luxo atemporal.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Loafer em Couro</h2>
        <p className="mt-2 text-sm text-zinc-300">Elegância casual.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Sandália Minimal</h2>
        <p className="mt-2 text-sm text-zinc-300">Design clean.</p>
      </article>
    </SapatosLayout>
  );
}
