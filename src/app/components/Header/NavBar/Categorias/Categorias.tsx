"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useBolsas, useRoupas, useSapatos } from "@/hooks/api/useProdutos";
import { slugify } from "@/lib/slug";

function uniqueSorted(values: (string | undefined | null)[]) {
  return Array.from(
    new Set(values.filter(Boolean).map((v) => String(v).trim()))
  ).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
}

type Column = {
  title: "Marcas" | "Bolsas" | "Roupas" | "Sapatos";
  items: { name: string; href: string }[];
};

export default function Categorias({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) {
  const [openMenu, setOpenMenu] = useState<Column["title"] | null>(null);
  const [brandQuery, setBrandQuery] = useState("");

  // Usar os novos hooks da API
  const { bolsas, isLoading: lBolsas, error: eBolsas } = useBolsas();
  const { roupas, isLoading: lRoupas, error: eRoupas } = useRoupas();
  const { sapatos, isLoading: lSapatos, error: eSapatos } = useSapatos();
  
  const carregando = lBolsas || lRoupas || lSapatos;

  // Log apenas em caso de erro
  if (eBolsas || eRoupas || eSapatos) {
    console.log('Categorias - Erros de API:', { eBolsas, eRoupas, eSapatos });
  }

  // lista única de marcas (ordenada) - usando dados individuais
  const marcas = useMemo(() => {
    const all = [
      ...bolsas,
      ...roupas,
      ...sapatos,
    ];
    
    return uniqueSorted(all.map((p) => p.titulo));
  }, [bolsas, roupas, sapatos]);

  // aplica filtro de busca de marcas
  const filteredMarcas = useMemo(() => {
    const q = brandQuery.trim().toLocaleLowerCase();
    if (!q) return marcas;
    return marcas.filter((m) => m.toLocaleLowerCase().includes(q));
  }, [marcas, brandQuery]);

  // Categorias por tipo - usando dados individuais
  const categoriasBolsas = useMemo(() => {
    return uniqueSorted(bolsas.map((p) => p.subtitulo));
  }, [bolsas]);

  const categoriasRoupas = useMemo(() => {
    return uniqueSorted(roupas.map((p) => p.subtitulo));
  }, [roupas]);

  const categoriasSapatos = useMemo(() => {
    return uniqueSorted(sapatos.map((p) => p.subtitulo));
  }, [sapatos]);

  const columns: Column[] = useMemo(
    () => [
      {
        title: "Marcas",
        items: [
          { name: "Ver Todas", href: "/produtos/marcas" },
          // Entrada especial para "Desfile" dentro de Marcas
          { name: "Desfile", href: "/produtos/marcas?categoria=desfile" },
          ...marcas.map((m) => ({
            name: m,
            href: `/produtos/marcas/${slugify(m)}`,
          })),
        ],
      },
      {
        title: "Bolsas",
        items: [
          { name: "Ver Todas", href: "/produtos/bolsas" },
          ...categoriasBolsas.map((c) => ({
            name: c,
            href: `/produtos/bolsas/${slugify(c)}`,
          })),
        ],
      },
      {
        title: "Roupas",
        items: [
          { name: "Ver Todas", href: "/produtos/roupas" },
          ...categoriasRoupas.map((c) => ({
            name: c,
            href: `/produtos/roupas/${slugify(c)}`,
          })),
        ],
      },
      {
        title: "Sapatos",
        items: [
          { name: "Ver Todos", href: "/produtos/sapatos" },
          ...categoriasSapatos.map((c) => ({
            name: c,
            href: `/produtos/sapatos/${slugify(c)}`,
          })),
        ],
      },
    ],
    [marcas, categoriasBolsas, categoriasRoupas, categoriasSapatos]
  );

  /* ----------------------------- MOBILE ----------------------------- */
  if (mobile) {
    return (
      <nav>
        <ul className="space-y-4">
          {columns.map((col) => (
            <li key={col.title}>
              <button
                onClick={() =>
                  setOpenMenu(openMenu === col.title ? null : col.title)
                }
                className="font-medium text-gray-800 uppercase text-sm tracking-wide w-full text-left flex justify-between items-center"
                aria-expanded={openMenu === col.title}
                aria-controls={`section-${col.title}`}
              >
                {col.title}
                <span>{openMenu === col.title ? "−" : "+"}</span>
              </button>

              {openMenu === col.title && (
                <div id={`section-${col.title}`}>
                  {/* Busca apenas no grupo Marcas (mobile) */}
                  {col.title === "Marcas" && (
                    <div className="mt-2 pr-1">
                      <input
                        type="search"
                        placeholder="Buscar marca…"
                        value={brandQuery}
                        onChange={(e) => setBrandQuery(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                        aria-label="Buscar marca"
                      />
                    </div>
                  )}

                  <ul
                    className="pl-4 mt-2 space-y-2 max-h-72 overflow-y-auto overscroll-contain pr-1
                      [scrollbar-width:thin]
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-thumb]:bg-zinc-300
                      [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {carregando ? null : col.title === "Marcas" ? (
                      <>
                        {/* Ação fixa: Ver Todas e Desfile */}
                        <li>
                          <Link
                            href="/produtos/marcas"
                            className="block text-sm text-gray-600 hover:underline"
                            {...(onItemClick && { onClick: onItemClick })}
                          >
                            Ver Todas
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/produtos/marcas?categoria=desfile"
                            className="block text-sm text-gray-600 hover:underline"
                            {...(onItemClick && { onClick: onItemClick })}
                          >
                            Desfile
                          </Link>
                        </li>

                        {(filteredMarcas.length
                          ? filteredMarcas
                          : ["— Nenhuma marca encontrada —"]
                        ).map((m) =>
                          m.startsWith("— ") ? (
                            <li
                              key="no-brand"
                              className="text-sm text-gray-500"
                            >
                              {m}
                            </li>
                          ) : (
                            <li key={m}>
                              <Link
                                href={`/produtos/marcas/${slugify(m)}`}
                                className="block text-sm text-gray-600 hover:underline"
                                {...(onItemClick && { onClick: onItemClick })}
                              >
                                {m}
                              </Link>
                            </li>
                          )
                        )}
                      </>
                    ) : (
                      col.items.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className="block text-sm text-gray-600 hover:underline"
                            {...(onItemClick && { onClick: onItemClick })}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  /* ----------------------------- DESKTOP ---------------------------- */
  return (
    <nav>
      <ul className="flex items-center gap-8 h-14">
        {columns.map((col) => (
          <li
            key={col.title}
            className="relative h-full flex items-center"
            onMouseEnter={() => setOpenMenu(col.title)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className="font-medium uppercase text-sm tracking-wide text-gray-800 hover:text-black transition-colors duration-200"
              aria-haspopup="menu"
              aria-expanded={openMenu === col.title}
              aria-controls={`menu-${col.title}`}
            >
              {col.title}
            </button>

            {openMenu === col.title && (
              <div
                id={`menu-${col.title}`}
                className="
                  absolute top-full left-0 z-20
                  bg-white shadow-lg rounded-b-md
                  p-4 sm:p-6
                  w-72 sm:w-80
                  max-h-[70vh] overflow-y-auto overscroll-contain
                  [scrollbar-width:thin]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-thumb]:bg-zinc-300
                  [&::-webkit-scrollbar-thumb]:rounded-full
                "
                role="menu"
                aria-label={col.title}
              >
                {/* Busca apenas no grupo Marcas (desktop) */}
                {col.title === "Marcas" && (
                  <div className="mb-3">
                    <label htmlFor="brand-search" className="sr-only">
                      Buscar marca
                    </label>
                    <input
                      id="brand-search"
                      type="search"
                      placeholder="Buscar marca…"
                      value={brandQuery}
                      onChange={(e) => setBrandQuery(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <ul className="space-y-2">
                  {carregando ? null : col.title === "Marcas" ? (
                    <>
                      {/* Ações fixas no topo */}
                      <li>
                        <Link
                          href="/produtos/marcas"
                          className="block text-sm text-gray-800 hover:underline px-2 py-1.5 rounded"
                          role="menuitem"
                          {...(onItemClick && { onClick: onItemClick })}
                        >
                          Ver Todas
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/produtos/marcas?categoria=desfile"
                          className="block text-sm text-gray-800 hover:underline px-2 py-1.5 rounded"
                          role="menuitem"
                          {...(onItemClick && { onClick: onItemClick })}
                        >
                          Desfile
                        </Link>
                      </li>

                      {(filteredMarcas.length
                        ? filteredMarcas
                        : ["— Nenhuma marca encontrada —"]
                      ).map((m) =>
                        m.startsWith("— ") ? (
                          <li
                            key="no-brand"
                            className="text-sm text-gray-500 px-2 py-1.5"
                          >
                            {m}
                          </li>
                        ) : (
                          <li key={m}>
                            <Link
                              href={`/produtos/marcas/${slugify(m)}`}
                              className="block text-sm text-gray-800 hover:underline px-2 py-1.5 rounded"
                              role="menuitem"
                              {...(onItemClick && { onClick: onItemClick })}
                            >
                              {m}
                            </Link>
                          </li>
                        )
                      )}
                    </>
                  ) : (
                    col.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="block text-sm text-gray-800 hover:underline px-2 py-1.5 rounded"
                          role="menuitem"
                          {...(onItemClick && { onClick: onItemClick })}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
