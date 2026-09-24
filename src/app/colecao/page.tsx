"use client";

import { useTranslations } from "next-intl";
import Hero from "../components/Hero/Hero";

import SectionBolsas from "../components/SectionBolsas";
import SectionSapatos from "../components/SectionSapatos";
import SectionRoupas from "../components/SectionRoupas";

export default function ColecaoPage() {
  const t = useTranslations("colecao");
  return (
    <div className="bg-white text-zinc-900">
      {/* Hero */}
      <Hero
        subtitle={t("heroSubtitle")}
        ctaHref="/colecao"
      />

      {/* Sessões */}
      <main className="space-y-20">
        <SectionBolsas
          title={t("bagsTitle")}
          subtitle={t("bagsSubtitle")}
          ctaText={t("bagsCta")}
          ctaHref="/produtos/bolsas"
          maxItems={4}
        />

        <SectionSapatos
          title={t("shoesTitle")}
          subtitle={t("shoesSubtitle")}
          ctaText={t("shoesCta")}
          ctaHref="/produtos/sapatos"
          maxItems={4}
        />

        <SectionRoupas
          title={t("clothingTitle")}
          subtitle={t("clothingSubtitle")}
          ctaText={t("clothingCta")}
          ctaHref="/produtos/roupas"
          maxItems={4}
        />
      </main>

      {/* Footer */}
    </div>
  );
}
