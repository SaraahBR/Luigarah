import type { Metadata } from "next";
import FormSolicitacao from "./FormSolicitacao";

export const metadata: Metadata = {
  title: "Exclusão de Dados e Conta | Luigarah",
  description:
    "Como solicitar a exclusão de dados pessoais e a remoção definitiva de conta na Luigarah (LGPD).",
  robots: { index: true, follow: true },
  alternates: { canonical: "/lgpd/exclusao-de-dados" },
};

export default function ExclusaoDeDadosPage() {
  const lastUpdated = "23/08/2025";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Exclusão de Dados / Conta</h1>
        <p className="text-sm text-zinc-500">
          Última atualização: {lastUpdated}
        </p>
      </header>

      {/* Aviso de página teste (estágio/atividade acadêmica) */}
      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado para
        fins de estágio/atividade acadêmica. Não será utilizada para lucros,
        compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Como funciona</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>Envie uma solicitação pelo formulário abaixo (gera um e‑mail).</li>
          <li>
            Validaremos sua identidade e iniciaremos o processo em até{" "}
            <strong>7 dias</strong>, salvo prazos menores exigidos por lei.
          </li>
          <li>
            Alguns dados podem ser mantidos pelo período legal mínimo para
            <em> cumprimento de obrigações legais</em> e <em> prevenção a fraudes</em>.
          </li>
        </ol>

        {/* Formulário client-side */}
        <FormSolicitacao />

        <h2 className="text-xl font-semibold">Dúvidas</h2>
        <p>
          Fale com nossa DPO:{" "}
          <a className="underline" href="mailto:vihernandesbr@gmail.com">
            vihernandesbr@gmail.com
          </a>.
        </p>
      </section>
    </main>
  );
}
