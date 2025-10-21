"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useBolsas, useRoupas, useSapatos, useProdutosMulher, useProdutosHomem, useProdutosUnissex, useProdutosKids } from "@/hooks/api/useProdutos";
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

type IdentidadeCode = 'mulher' | 'homem' | 'unissex' | 'kids' | null;

export default function Categorias({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) {
  const [openMenu, setOpenMenu] = useState<Column["title"] | null>(null);
  const [brandQuery, setBrandQuery] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detectar identidade atual baseado na URL ou query parameter
  const identidadeAtual: IdentidadeCode = useMemo(() => {
    // Primeiro, verificar se há parâmetro identidade na URL
    const identidadeParam = searchParams.get('identidade')?.toLowerCase();
    if (identidadeParam === 'mulher') return 'mulher';
    if (identidadeParam === 'homem') return 'homem';
    if (identidadeParam === 'unissex') return 'unissex';
    if (identidadeParam === 'kids') return 'kids';
    
    // Se não houver parâmetro, verificar o pathname
    if (pathname?.startsWith('/mulher')) return 'mulher';
    if (pathname?.startsWith('/homem')) return 'homem';
    if (pathname?.startsWith('/unissex')) return 'unissex';
    if (pathname?.startsWith('/kids')) return 'kids';
    
    return null;
  }, [pathname, searchParams]);

  // Buscar produtos por identidade
  const { produtos: produtosMulher } = useProdutosMulher(0, 1000);
  const { produtos: produtosHomem } = useProdutosHomem(0, 1000);
  const { produtos: produtosUnissex } = useProdutosUnissex(0, 1000);
  const { produtos: produtosKids } = useProdutosKids(0, 1000);

  // Usar os hooks gerais da API (para quando não estiver em página de identidade)
  const { bolsas: bolsasGeral, isLoading: lBolsas, error: eBolsas } = useBolsas(0, 1000);
  const { roupas: roupasGeral, isLoading: lRoupas, error: eRoupas } = useRoupas(0, 1000);
  const { sapatos: sapatosGeral, isLoading: lSapatos, error: eSapatos } = useSapatos(0, 1000);
  
  const carregando = lBolsas || lRoupas || lSapatos;

  // Filtrar produtos por identidade
  const produtosFiltrados = useMemo(() => {
    let produtos = [];
    
    switch (identidadeAtual) {
      case 'mulher':
        produtos = produtosMulher;
        break;
      case 'homem':
        produtos = produtosHomem;
        break;
      case 'unissex':
        produtos = produtosUnissex;
        break;
      case 'kids':
        produtos = produtosKids;
        break;
      default:
        // Se não estiver em página de identidade, usar todos os produtos
        produtos = [...bolsasGeral, ...roupasGeral, ...sapatosGeral];
    }
    
    return produtos;
  }, [identidadeAtual, produtosMulher, produtosHomem, produtosUnissex, produtosKids, bolsasGeral, roupasGeral, sapatosGeral]);

  // Separar produtos por tipo
  const { bolsas, roupas, sapatos } = useMemo(() => {
    const b = produtosFiltrados.filter(p => p.categoria?.toLowerCase().includes('bolsa'));
    const r = produtosFiltrados.filter(p => {
      const cat = p.categoria?.toLowerCase() || '';
      return !cat.includes('bolsa') && !cat.includes('sapato') && !cat.includes('calçado');
    });
    const s = produtosFiltrados.filter(p => {
      const cat = p.categoria?.toLowerCase() || '';
      return cat.includes('sapato') || cat.includes('calçado');
    });
    
    return { bolsas: b, roupas: r, sapatos: s };
  }, [produtosFiltrados]);

  // Log apenas em caso de erro
  if (eBolsas || eRoupas || eSapatos) {
    console.log('Categorias - Erros de API:', { eBolsas, eRoupas, eSapatos });
  }

  // lista única de marcas (ordenada) - usando dados filtrados por identidade
  const marcas = useMemo(() => {
    return uniqueSorted(produtosFiltrados.map((p) => p.titulo));
  }, [produtosFiltrados]);

  // aplica filtro de busca de marcas
  const filteredMarcas = useMemo(() => {
    const q = brandQuery.trim().toLocaleLowerCase();
    if (!q) return marcas;
    return marcas.filter((m) => m.toLocaleLowerCase().includes(q));
  }, [marcas, brandQuery]);

  // Categorias por tipo - usando dados filtrados
  const categoriasBolsas = useMemo(() => {
    return uniqueSorted(bolsas.map((p) => p.subtitulo));
  }, [bolsas]);

  const categoriasRoupas = useMemo(() => {
    return uniqueSorted(roupas.map((p) => p.subtitulo));
  }, [roupas]);

  const categoriasSapatos = useMemo(() => {
    return uniqueSorted(sapatos.map((p) => p.subtitulo));
  }, [sapatos]);

  // Helper para adicionar query de identidade aos links
  const addIdentidadeQuery = useCallback((href: string) => {
    if (!identidadeAtual) return href;
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}identidade=${identidadeAtual}`;
  }, [identidadeAtual]);

  const columns: Column[] = useMemo(
    () => [
      {
        title: "Marcas",
        items: [
          { name: "Ver Todas", href: addIdentidadeQuery("/produtos/marcas") },
          // Entrada especial para "Desfile" dentro de Marcas
          { name: "Desfile", href: addIdentidadeQuery("/produtos/marcas?categoria=desfile") },
          ...marcas.map((m) => ({
            name: m,
            href: addIdentidadeQuery(`/produtos/marcas/${slugify(m)}`),
          })),
        ],
      },
      {
        title: "Bolsas",
        items: [
          { name: "Ver Todas", href: addIdentidadeQuery("/produtos/bolsas") },
          ...categoriasBolsas.map((c) => ({
            name: c,
            href: addIdentidadeQuery(`/produtos/bolsas/${slugify(c)}`),
          })),
        ],
      },
      {
        title: "Roupas",
        items: [
          { name: "Ver Todas", href: addIdentidadeQuery("/produtos/roupas") },
          ...categoriasRoupas.map((c) => ({
            name: c,
            href: addIdentidadeQuery(`/produtos/roupas/${slugify(c)}`),
          })),
        ],
      },
      {
        title: "Sapatos",
        items: [
          { name: "Ver Todos", href: addIdentidadeQuery("/produtos/sapatos") },
          ...categoriasSapatos.map((c) => ({
            name: c,
            href: addIdentidadeQuery(`/produtos/sapatos/${slugify(c)}`),
          })),
        ],
      },
    ],
    [marcas, categoriasBolsas, categoriasRoupas, categoriasSapatos, addIdentidadeQuery]
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
                <div 
                  id={`section-${col.title}`}
                  className="
                    mt-3 pt-4 
                    animate-in fade-in slide-in-from-top-1 duration-300
                    relative
                  "
                  style={{
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                >
                  {/* Linha animada no topo */}
                  <div 
                    className="shimmer-line-mobile absolute top-0 left-0 right-0 h-[2px]"
                  />
                  {/* Sombreamento degradê */}
                  <div 
                    className="
                      absolute top-0 left-0 right-0 h-6
                      bg-gradient-to-b from-gray-900/5 to-transparent 
                      pointer-events-none
                    "
                  />
                  
                  {/* Busca apenas no grupo Marcas (mobile) */}
                  {col.title === "Marcas" && (
                    <div className="mb-2 pr-1">
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
                        {/* Ação fixa: Ver Todas e Desfile - usando hrefs do columns */}
                        <li>
                          <Link
                            href={col.items[0].href}
                            className="block text-sm text-gray-600 hover:underline"
                            {...(onItemClick && { onClick: onItemClick })}
                          >
                            Ver Todas
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={col.items[1].href}
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
                                href={addIdentidadeQuery(`/produtos/marcas/${slugify(m)}`)}
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
                  bg-white/95 backdrop-blur-md shadow-2xl rounded-b-md
                  p-4 sm:p-6
                  w-72 sm:w-80
                  max-h-[70vh] overflow-y-auto overscroll-contain
                  [scrollbar-width:thin]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-thumb]:bg-zinc-300
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  animate-in fade-in slide-in-from-top-2 duration-300
                "
                role="menu"
                aria-label={col.title}
                style={{
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                {/* Linha animada no topo */}
                <div 
                  className="shimmer-line absolute top-0 left-0 right-0 h-[3px]"
                />
                {/* Sombreamento degradê */}
                <div 
                  className="
                    absolute top-0 left-0 right-0 h-8
                    bg-gradient-to-b from-gray-900/10 to-transparent 
                    pointer-events-none
                  "
                />
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
                      {/* Ações fixas no topo - usando hrefs do columns */}
                      <li>
                        <Link
                          href={col.items[0].href}
                          className="block text-sm text-gray-800 hover:underline px-2 py-1.5 rounded"
                          role="menuitem"
                          {...(onItemClick && { onClick: onItemClick })}
                        >
                          Ver Todas
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={col.items[1].href}
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
                              href={addIdentidadeQuery(`/produtos/marcas/${slugify(m)}`)}
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
