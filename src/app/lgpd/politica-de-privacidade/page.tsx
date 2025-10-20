import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Luigarah",
  description:
    "Como a Luigarah coleta, utiliza, compartilha e protege seus dados pessoais, em conformidade com a LGPD.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/lgpd/politica-de-privacidade" },
};

export default function PoliticaDePrivacidadePage() {
  const lastUpdated = "23/08/2025";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-zinc-800">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Política de Privacidade</h1>
        <p className="text-sm text-zinc-500">
          Última atualização: {lastUpdated}
        </p>
      </header>

      <div className="mb-6 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
        <strong>Aviso Importante:</strong> Esta página é um <u>teste</u> criado
        para fins de estágio/atividade acadêmica. Não será utilizada para
        lucros, compras reais ou transações comerciais.
      </div>

      <section className="space-y-6">
        <p>
          A <strong>Luigarah</strong> respeita a sua privacidade e trata dados
          pessoais em conformidade com a{" "}
          <strong>
            Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)
          </strong>
          . Este documento descreve como coletamos, utilizamos, compartilhamos e
          protegemos suas informações ao utilizar nosso site e serviços.
        </p>

        <h2 className="text-xl font-semibold">1. Dados que coletamos</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Dados de conta:</strong> nome, e-mail, telefone (quando
            fornecidos por você).
          </li>
          <li>
            <strong>Dados de navegação:</strong> endereço IP, device/OS, páginas
            acessadas, cookies essenciais e de desempenho.
          </li>
          <li>
            <strong>Dados de compra/entrega:</strong> endereço, preferências e histórico de pedidos.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">2. Base legal e finalidades</h2>
        <p>
          Tratamos dados com base em <em>execução de contrato</em>,{" "}
          <em>cumprimento de obrigação legal</em>, <em>legítimo interesse</em>{" "}
          (com avaliação de impacto) e/ou <em>consentimento</em>
          quando aplicável. Finalidades incluem: autenticação, processamento de
          pedidos, prevenção a fraudes, suporte, melhoria de experiência e
          comunicações transacionais.
        </p>

        <h2 className="text-xl font-semibold">3. Compartilhamento</h2>
        <p>
          Podemos compartilhar dados com provedores
          de hospedagem, logística e ferramentas analíticas, sempre sob
          contratos e medidas de segurança adequadas. Não vendemos dados
          pessoais.
        </p>

        <h2 className="text-xl font-semibold">
          4. Cookies e tecnologias similares
        </h2>
        <p>
          Utilizamos cookies essenciais para funcionamento do site e, se você
          aceitar, cookies de performance/analytics. Você pode gerenciar
          preferências no navegador ou em nosso banner de consentimento (quando
          habilitado).
        </p>

        <h2 className="text-xl font-semibold">5. Seus direitos como titular</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso e correção de dados</li>
          <li>Portabilidade, anonimização e bloqueio</li>
          <li>
            Eliminação de dados desnecessários ou tratados em desconformidade
          </li>
          <li>Informação sobre compartilhamentos e consentimento</li>
          <li>Revogação de consentimento</li>
        </ul>

        <h2 className="text-xl font-semibold">6. Segurança e retenção</h2>
        <p>
          Adotamos medidas técnicas e administrativas para proteger seus dados.
          Guardamos apenas pelo tempo necessário às finalidades informadas e aos
          prazos legais (ex.: obrigações fiscais e antifraude).
        </p>

        <h2 className="text-xl font-semibold">7. Crianças e adolescentes</h2>
        <p>
          Não direcionamos nossos serviços a crianças. Caso identifiquemos
          coleta indevida, iremos excluir os dados e encerrar a conta associada.
        </p>

        <h2 className="text-xl font-semibold">
          8. Contato do Encarregado (DPO)
        </h2>
        <p>
          Para exercer seus direitos ou tirar dúvidas, contate:{" "}
          <a className="underline" href="mailto:vihernandesbr@gmail.com">
            vihernandesbr@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold">9. Alterações desta Política</h2>
        <p>
          Poderemos atualizar esta Política para refletir melhorias ou
          requisitos legais. A versão vigente estará sempre disponível nesta
          página.
        </p>
      </section>
    </main>
  );
}
