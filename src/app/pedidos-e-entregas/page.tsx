import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("paginas.pedidosEntregas");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PedidosEntregasPage() {
  const t = await getTranslations("paginas");
  const p = await getTranslations("paginas.pedidosEntregas");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">{p("title")}</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        {t.rich("aviso", { b: (c) => <strong>{c}</strong>, u: (c) => <u>{c}</u> })}
      </div>

      <section className="space-y-6">
        <p>{p("intro")}</p>
        <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
          <li>{p("i1")}</li>
          <li>{p("i2")}</li>
          <li>{p("i3")}</li>
        </ul>
      </section>
    </main>
  );
}
