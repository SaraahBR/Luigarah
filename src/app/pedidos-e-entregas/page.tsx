import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedidos e Entregas | Luigarah",
  description: "Informações sobre pedidos e entregas (projeto acadêmico).",
};

export default function PedidosEntregasPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Pedidos e entregas</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <p>Este projeto não realiza pedidos ou entregas reais.</p>
        <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
          <li>Confirmação de pedido (fictícia)</li>
          <li>Prazos de entrega (não aplicável neste projeto)</li>
          <li>Rastreamento (não disponível)</li>
        </ul>
      </section>
    </main>
  );
}
