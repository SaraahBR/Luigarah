import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import FormSolicitacao from "./FormSolicitacao";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lgpd.exclusao");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: { canonical: "/lgpd/exclusao-de-dados" },
  };
}

export default async function ExclusaoDeDadosPage() {
  const t = await getTranslations("lgpd");
  const p = await getTranslations("lgpd.exclusao");
  const format = await getFormatter();
  const lastUpdated = format.dateTime(new Date(2025, 7, 23), { dateStyle: "short" });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">{p("title")}</h1>
        <p className="text-sm text-zinc-500">
          {t("lastUpdated", { data: lastUpdated })}
        </p>
      </header>

      {/* Aviso de página teste (estágio/atividade acadêmica) */}
      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        {t.rich("aviso", { b: (c) => <strong>{c}</strong>, u: (c) => <u>{c}</u> })}
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">{p("howTitle")}</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>{p("step1")}</li>
          <li>{p.rich("step2", { b: (c) => <strong>{c}</strong> })}</li>
          <li>{p.rich("step3", { i: (c) => <em>{c}</em> })}</li>
        </ol>

        {/* Formulário client-side */}
        <FormSolicitacao />

        <h2 className="text-xl font-semibold">{p("questions")}</h2>
        <p>
          {p("dpo")}{" "}
          <a className="underline" href="mailto:vihernandesbr@gmail.com">
            vihernandesbr@gmail.com
          </a>.
        </p>
      </section>
    </main>
  );
}
