"use client";

import { ReactNode } from "react";

export default function SapatosLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-[60vh] bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Sapatos</h1>
          <p className="mt-2 text-zinc-300">
            Seleção premium de calçados de grife.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
