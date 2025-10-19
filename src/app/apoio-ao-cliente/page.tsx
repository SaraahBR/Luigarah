import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apoio ao Cliente | Luigarah",
  description: "Central de ajuda e suporte ao cliente Luigarah.",
};

export default function ApoioAoClientePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Apoio ao cliente</h1>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <p>
          Encontre respostas rápidas ou entre em contato com nosso suporte.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Pedidos e entregas</li>
          <li>Devoluções</li>
          <li>Pagamentos</li>
          <li>Conta e segurança</li>
        </ul>
      </section>
    </main>
  );
}
