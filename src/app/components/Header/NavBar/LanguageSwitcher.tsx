"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheck } from "react-icons/fi";
import { BR, ES, FR, US } from "country-flag-icons/react/3x2";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { MOEDA_POR_IDIOMA } from "@/i18n/moeda";
import { setClientLocale } from "@/i18n/client";

type Props = {
  /** "icon": bandeira com menu suspenso (desktop); "list": lista aberta (menu mobile) */
  variant?: "icon" | "list";
  onChange?: () => void;
};

/**
 * Bandeira do país de cada idioma (a mesma da moeda usada nos preços).
 * SVG em vez de emoji: no Windows o emoji de bandeira aparece só como "BR", "US".
 */
const BANDEIRAS: Record<Locale, typeof BR> = {
  pt: BR,
  en: US,
  es: ES,
  fr: FR,
};

function Bandeira({ locale, className = "" }: { locale: Locale; className?: string }) {
  const Svg = BANDEIRAS[locale];
  return (
    <Svg
      aria-hidden="true"
      className={`inline-block h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
    />
  );
}

export default function LanguageSwitcher({ variant = "icon", onChange }: Readonly<Props>) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const escolher = (novo: Locale) => {
    setOpen(false);
    onChange?.();
    if (novo !== locale) setClientLocale(novo);
  };

  const opcoes = LOCALES.map((l) => (
    <button
      key={l}
      type="button"
      role="menuitemradio"
      aria-checked={l === locale}
      lang={l}
      onClick={() => escolher(l)}
      className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 ${
        l === locale ? "font-semibold text-black" : "text-gray-700"
      }`}
    >
      <Bandeira locale={l} />
      <span className="flex-1">{LOCALE_LABELS[l]}</span>
      {/* moeda em que os preços aparecem nesse idioma */}
      <span className="text-[11px] font-normal text-gray-400">{MOEDA_POR_IDIOMA[l]}</span>
      <FiCheck className={`text-base ${l === locale ? "" : "invisible"}`} />
    </button>
  ));

  if (variant === "list") {
    return (
      <div>
        <div className="flex items-center gap-2 tracking-wide mb-2">
          <Bandeira locale={locale} />
          {t("language")}
        </div>
        <div role="menu" aria-label={t("changeLanguage")} className="-mx-3">
          {opcoes}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-black hover:opacity-70 transition-opacity"
        aria-label={`${t("changeLanguage")}: ${LOCALE_LABELS[locale]}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bandeira locale={locale} />
        <span className="text-xs font-medium uppercase">{locale}</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("changeLanguage")}
          className="absolute right-0 top-full mt-2 w-52 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50"
        >
          {opcoes}
        </div>
      )}
    </div>
  );
}
