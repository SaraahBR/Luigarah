"use client";

import { ReactNode } from "react";

type BolsasLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
};

export default function BolsasLayout({
  children,
  title = "Bolsas",
  subtitle = "Clássicos e ícones contemporâneos em tiracolo, transversal e tote.",
  ctaText = "Compre agora",
  ctaHref = "#grid"
}: BolsasLayoutProps) {
  return (
    <section className="min-h-[60vh] bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

        <div id="grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      </div>
    </section>
  );
}
