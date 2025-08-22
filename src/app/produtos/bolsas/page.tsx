import BolsasLayout from "./tailwind";

export default function Page() {
  return (
    <BolsasLayout>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Tote Palermo</h2>
        <p className="mt-2 text-sm text-neutral-300">Couro italiano.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Clutch Noite</h2>
        <p className="mt-2 text-sm text-neutral-300">Brilho discreto.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-medium">Shoulder Icon</h2>
        <p className="mt-2 text-sm text-neutral-300">Metal escovado.</p>
      </article>
    </BolsasLayout>
  );
}
