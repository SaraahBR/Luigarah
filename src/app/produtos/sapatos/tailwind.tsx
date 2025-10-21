"use client";

import { ReactNode } from "react";

type SapatosLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  topBar?: ReactNode;        // pílulas e ordenar
  filtersDrawer?: ReactNode; // drawer flutuante
};

export default function SapatosLayout({
  children,
  title = "Sapatos",
  subtitle = "Scarpins, sandálias, tênis e botas de luxo para todas as ocasiões.",
  topBar,
  filtersDrawer,
}: SapatosLayoutProps) {
  return (
    <section className="min-h-[60vh] bg-white text-zinc-900">
      {/* Drawer montado acima para sobrepor conteúdo */}
      {filtersDrawer}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-zinc-600">{subtitle}</p>
        </div>

        {/* topbar */}
        {topBar && <div className="mb-6">{topBar}</div>}

        {/* grid - Responsivo otimizado com breakpoints customizados */}
        <div id="grid" className="grid grid-cols-2 gap-3 min-[525px]:gap-4 sm:gap-4 min-[723px]:gap-4.5 min-[770px]:gap-5 md:gap-5 lg:gap-6 min-[1200px]:gap-7 min-[1247px]:gap-7.5 xl:gap-8 min-[525px]:grid-cols-2 sm:grid-cols-2 min-[723px]:grid-cols-2 min-[770px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      </div>
    </section>
  );
}
