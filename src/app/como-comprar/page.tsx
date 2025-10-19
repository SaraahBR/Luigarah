import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Comprar | Luigarah",
  description: "Guia de como comprar (projeto acadêmico).",
};

export default function ComoComprarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Como comprar</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700">
          <li>Explore as coleções</li>
          <li>Adicione produtos ao carrinho</li>
          <li>Finalize (simulação) — nenhum pagamento é processado</li>
        </ol>
      </section>
    </main>
  );
}
