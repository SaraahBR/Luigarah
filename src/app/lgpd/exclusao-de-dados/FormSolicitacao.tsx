"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function FormSolicitacao() {
  const t = useTranslations("lgpd.form");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"dados" | "conta">("dados");
  const [detalhes, setDetalhes] = useState("");

  // O e-mail sai no idioma em que a pessoa está navegando
  function enviarSolicitacao() {
    const assunto = tipo === "conta" ? t("subjectAccount") : t("subjectData");

    const corpo = [
      t("mail.greeting"),
      ``,
      tipo === "conta" ? t("mail.requestAccount") : t("mail.requestData"),
      ``,
      `${t("mail.name")}: ${nome}`,
      `${t("mail.email")}: ${email}`,
      `${t("mail.details")}: ${detalhes || t("mail.noDetails")}`,
      ``,
      t("mail.declaration"),
      ``,
      t("mail.thanks"),
    ]
      .map((linha) => encodeURIComponent(linha))
      .join("%0D%0A");

    const mailto = `mailto:vihernandesbr@gmail.com?subject=${encodeURIComponent(
      assunto
    )}&body=${corpo}`;
    window.location.href = mailto;
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">{t("title")}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-sm">
          {t("fullName")}
          <input
            className="mt-1 rounded-md border px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
          />
        </label>

        <label className="flex flex-col text-sm">
          {t("registeredEmail")}
          <input
            type="email"
            className="mt-1 rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
          />
        </label>

        <label className="flex flex-col text-sm">
          {t("requestType")}
          <select
            className="mt-1 rounded-md border px-3 py-2"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "dados" | "conta")}
          >
            <option value="dados">{t("deleteData")}</option>
            <option value="conta">{t("deleteAccount")}</option>
          </select>
        </label>

        <label className="flex flex-col text-sm sm:col-span-2">
          {t("details")}
          <textarea
            className="mt-1 min-h-[120px] rounded-md border px-3 py-2"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            placeholder={t("detailsPlaceholder")}
          />
        </label>
      </div>

      <button
        onClick={enviarSolicitacao}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-white hover:opacity-90"
      >
        {t("submit")}
      </button>

      <p className="mt-3 text-xs text-zinc-500">
        {t.rich("alternative", {
          email: () => (
            <a className="underline" href="mailto:vihernandesbr@gmail.com">
              vihernandesbr@gmail.com
            </a>
          ),
        })}
      </p>
    </div>
  );
}
