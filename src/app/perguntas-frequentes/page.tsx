import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("paginas.faq");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PerguntasFrequentesPage() {
  const t = await getTranslations("paginas");
  const p = await getTranslations("paginas.faq");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">{p("title")}</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        {t.rich("aviso", { b: (c) => <strong>{c}</strong>, u: (c) => <u>{c}</u> })}
      </div>

      <section className="space-y-6">
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">{p("q1")}</summary>
          <p className="mt-2 text-sm text-zinc-700">{p("a1")}</p>
        </details>
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">{p("q2")}</summary>
          <p className="mt-2 text-sm text-zinc-700">{p("a2")}</p>
        </details>
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">{p("q3")}</summary>
          <p className="mt-2 text-sm text-zinc-700">{p("a3")}</p>
        </details>
      </section>
    </main>
  );
}
