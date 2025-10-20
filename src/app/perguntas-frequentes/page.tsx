import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes | Luigarah",
  description: "Tire suas dúvidas sobre compras, entregas e devoluções.",
};

export default function PerguntasFrequentesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Perguntas frequentes</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">Quais formas de pagamento vocês aceitam?</summary>
          <p className="mt-2 text-sm text-zinc-700">Este é um projeto fictício, pagamentos não são processados.</p>
        </details>
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">Qual é o prazo de entrega?</summary>
          <p className="mt-2 text-sm text-zinc-700">Entregas são fictícias e não realizadas neste projeto.</p>
        </details>
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">Como funcionam as devoluções?</summary>
          <p className="mt-2 text-sm text-zinc-700">Consulte a página de Devoluções para detalhes deste projeto acadêmico.</p>
        </details>
      </section>
    </main>
  );
}
