// src/app/LGPD/exclusao-de-dados/FormSolicitacao.tsx
"use client";

import { useState } from "react";

export default function FormSolicitacao() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"dados" | "conta">("dados");
  const [detalhes, setDetalhes] = useState("");

  function enviarSolicitacao() {
    const assunto =
      tipo === "conta"
        ? "Solicitação de exclusão de CONTA - LGPD"
        : "Solicitação de exclusão de DADOS - LGPD";

    const corpo = [
      `Olá, equipe Luigarah,`,
      ``,
      `Solicito a exclusão ${
        tipo === "conta"
          ? "da MINHA CONTA e de todos os dados associados"
          : "dos MEUS DADOS pessoais"
      } conforme a LGPD.`,
      ``,
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Detalhes adicionais: ${detalhes || "(sem detalhes adicionais)"}`,
      ``,
      `Declaro ciência de que a exclusão poderá ser irreversível e que alguns dados podem ser mantidos para cumprimento de obrigações legais (ex.: fiscais/antifraude) dentro dos prazos exigidos por lei.`,
      ``,
      `Obrigado(a).`,
    ].join("%0D%0A");

    const mailto = `mailto:vihernandesbr@gmail.com?subject=${encodeURIComponent(
      assunto
    )}&body=${corpo}`;
    window.location.href = mailto;
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Solicitar exclusão</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-sm">
          Nome completo
          <input
            className="mt-1 rounded-md border px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            required
          />
        </label>

        <label className="flex flex-col text-sm">
          E-mail cadastrado
          <input
            type="email"
            className="mt-1 rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
          />
        </label>

        <label className="flex flex-col text-sm">
          Tipo de solicitação
          <select
            className="mt-1 rounded-md border px-3 py-2"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "dados" | "conta")}
          >
            <option value="dados">Excluir meus dados</option>
            <option value="conta">Excluir minha conta (e dados)</option>
          </select>
        </label>

        <label className="flex flex-col text-sm sm:col-span-2">
          Detalhes adicionais (opcional)
          <textarea
            className="mt-1 min-h-[120px] rounded-md border px-3 py-2"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            placeholder="Ex.: quero excluir endereços salvos, histórico de pedidos, etc."
          />
        </label>
      </div>

      <button
        onClick={enviarSolicitacao}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-white hover:opacity-90"
      >
        Enviar solicitação por e‑mail
      </button>

      <p className="mt-3 text-xs text-zinc-500">
        Alternativamente, envie diretamente um e‑mail para{" "}
        <a className="underline" href="mailto:vihernandesbr@gmail.com">
          vihernandesbr@gmail.com
        </a>{" "}
        com assunto “Exclusão de Dados/Conta – LGPD”, informando nome e e‑mail de cadastro.
      </p>
    </div>
  );
}
