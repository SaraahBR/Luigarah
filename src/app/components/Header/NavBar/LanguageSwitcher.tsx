"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheck, FiGlobe } from "react-icons/fi";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { setClientLocale } from "@/i18n/client";

type Props = {
  /** "icon": globo com menu suspenso (desktop); "list": lista aberta (menu mobile) */
  variant?: "icon" | "list";
  onChange?: () => void;
};

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
      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 ${
        l === locale ? "font-semibold text-black" : "text-gray-700"
      }`}
    >
      {LOCALE_LABELS[l]}
      {l === locale && <FiCheck className="text-base" />}
    </button>
  ));

  if (variant === "list") {
    return (
      <div>
        <div className="flex items-center gap-2 tracking-wide mb-2">
          <FiGlobe />
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
        className="flex items-center gap-1 text-black hover:text-gray-600 transition-colors"
        aria-label={t("changeLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FiGlobe />
        <span className="text-xs font-medium uppercase">{locale}</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("changeLanguage")}
          className="absolute right-0 top-full mt-2 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50"
        >
          {opcoes}
        </div>
      )}
    </div>
  );
}
