import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço | Luigarah",
  description:
    "Condições de uso do site e serviços Luigarah, incluindo responsabilidades, limitações e regras de conduta.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/lgpd/termos-de-servico" },
};

export default function TermosDeServicoPage() {
  const lastUpdated = "23/08/2025";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Termos de Serviço</h1>
        <p className="text-sm text-zinc-500">Última atualização: {lastUpdated}</p>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <p>
          Estes Termos regem o uso do site e serviços da <strong>Luigarah</strong>. Ao acessar
          nossa plataforma, você concorda com as condições abaixo. Se não concordar, por favor
          não utilize o serviço.
        </p>

        <h2 className="text-xl font-semibold">1. Cadastro e Conta</h2>
        <p>
          Você deve fornecer informações verdadeiras e atualizadas. Mantenha suas credenciais em
          sigilo. Você é responsável por atividades realizadas com sua conta.
        </p>

        <h2 className="text-xl font-semibold">2. Compras, Preços e Pagamentos</h2>
        <p>
          Preços, promoções e disponibilidade podem mudar sem aviso. Pedidos estão sujeitos à
          confirmação e análise antifraude. Pagamentos são fictícios, você não irá expor nenhum dado sensível financeiro.
        </p>

        <h2 className="text-xl font-semibold">3. Propriedade Intelectual</h2>
        <p>
          Marcas, logotipos, textos, imagens e códigos pertencem à Luigarah e suas inspirações Farfetch, Zara e Prada.
          É proibido copiar, modificar ou explorar comercialmente sem autorização.
        </p>

        <h2 className="text-xl font-semibold">4. Conduta e Uso Aceitável</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Não praticar atividades ilícitas ou que violem direitos de terceiros.</li>
          <li>Não tentar explorar vulnerabilidades ou burlar mecanismos de segurança.</li>
          <li>Não publicar conteúdo ofensivo, discriminatório ou ilegal.</li>
        </ul>

        <h2 className="text-xl font-semibold">5. Isenções e Limitações</h2>
        <p>
          O serviço é fornecido “como está”. Na máxima extensão permitida em lei, não garantimos
          disponibilidade ininterrupta e não nos responsabilizamos por perdas indiretas decorrentes
          do uso do site.
        </p>

        <h2 className="text-xl font-semibold">6. Privacidade</h2>
        <p>
          O uso do serviço também é regido pela nossa{" "}
          <a className="underline" href="/lgpd/politica-de-privacidade">
            Política de Privacidade
          </a>
        </p>

        <h2 className="text-xl font-semibold">7. Encerramento</h2>
        <p>
          Podemos suspender ou encerrar contas que violem estes Termos ou a legislação aplicável.
          Você pode solicitar exclusão de conta conforme instruções em{" "}
          <a className="underline" href="/lgpd/exclusao-de-dados">
            Exclusão de Dados/Conta
          </a>
        </p>

        <h2 className="text-xl font-semibold">8. Alterações</h2>
        <p>
          Podemos atualizar estes Termos. As alterações passam a valer após publicação nesta página.
        </p>

        <h2 className="text-xl font-semibold">9. Contato</h2>
        <p>
          Dúvidas? Escreva para{" "}
          <a className="underline" href="mailto:vihernandesbr@gmail.com">
            vihernandesbr@gmail.com
          </a>.
        </p>
      </section>
    </main>
  );
}
