import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lgpd.privacidade");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: { canonical: "/lgpd/politica-de-privacidade" },
  };
}

const b = (c: React.ReactNode) => <strong>{c}</strong>;
const i = (c: React.ReactNode) => <em>{c}</em>;

export default async function PoliticaDePrivacidadePage() {
  const t = await getTranslations("lgpd");
  const p = await getTranslations("lgpd.privacidade");
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

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        {t.rich("aviso", { b, u: (c) => <u>{c}</u> })}
      </div>

      <section className="space-y-6">
        <p>{p.rich("intro", { b })}</p>

        <h2 className="text-xl font-semibold">{p("s1.title")}</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>{p.rich("s1.account", { b })}</li>
          <li>{p.rich("s1.browsing", { b })}</li>
          <li>{p.rich("s1.purchase", { b })}</li>
        </ul>

        <h2 className="text-xl font-semibold">{p("s2.title")}</h2>
        <p>{p.rich("s2.text", { i })}</p>

        <h2 className="text-xl font-semibold">{p("s3.title")}</h2>
        <p>{p("s3.text")}</p>

        <h2 className="text-xl font-semibold">{p("s4.title")}</h2>
        <p>{p("s4.text")}</p>

        <h2 className="text-xl font-semibold">{p("s5.title")}</h2>
        <ul className="list-inside list-disc space-y-2">
          {(["r1", "r2", "r3", "r4", "r5", "r6"] as const).map((r) => (
            <li key={r}>{p(`s5.${r}`)}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold">{p("s6.title")}</h2>
        <p>{p("s6.text")}</p>

        <h2 className="text-xl font-semibold">{p("s7.title")}</h2>
        <p>{p("s7.text")}</p>

        <h2 className="text-xl font-semibold">{p("s8.title")}</h2>
        <p>
          {p("s8.text")}{" "}
          <a className="underline" href="mailto:vihernandesbr@gmail.com">
            vihernandesbr@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold">{p("s9.title")}</h2>
        <p>{p("s9.text")}</p>
      </section>
    </main>
  );
}
