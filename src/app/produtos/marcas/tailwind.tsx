"use client";

import { ReactNode } from "react";

type MarcasLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  topBar?: ReactNode;
  filtersDrawer?: ReactNode;
};

export default function MarcasLayout({
  children,
  title = "Marcas",
  subtitle = "Explore nossas marcas em bolsas, roupas e sapatos.",
  ctaText = "Compre agora",
  ctaHref = "#grid",
  topBar,
  filtersDrawer,
}: MarcasLayoutProps) {
  return (
    <section className="min-h-[60vh] bg-white text-zinc-900">
      {/* Drawer montado acima para sobrepor conteúdo */}
      {filtersDrawer}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-zinc-600">{subtitle}</p>
          </div>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 transition"
          >
            {ctaText}
          </a>
        </div>

        {/* topbar */}
        {topBar && <div className="mb-6">{topBar}</div>}

        {/* grid */}
        <div
          id="grid"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
