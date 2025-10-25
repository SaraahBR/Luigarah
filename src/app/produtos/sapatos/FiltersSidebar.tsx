"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  selectedSizes: string[];          // numeração BR (32..41)
  selectedDimensions: string[];     // Grande, Médio, Pequeno, Mini

  onToggleSize: (s: string) => void;
  onToggleDimension: (d: string) => void;

  onClearAll: () => void;
  tamanhosDisponiveis?: string[];   // Tamanhos vindos do backend
};

const SIZES = Array.from({ length: 10 }, (_, i) => (32 + i).toString()); // 32..41
const DIMENSIONS = ["Grande", "Médio", "Pequeno", "Mini"];

/** Clique fora para fechar  */
function useClickOutside<T extends HTMLElement>(
  enabled: boolean,
  ref: React.RefObject<T | null>,
  cb: () => void
) {
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [enabled, ref, cb]);
}

function selectionsLabel(arr: string[]) {
  if (arr.length === 0) return "Todos";
  if (arr.length <= 3) return arr.join(", ");
  return `${arr.slice(0, 3).join(", ")} +${arr.length - 3}`;
}

export default function FiltersSidebar({
  open,
  onClose,
  selectedSizes,
  selectedDimensions,
  onToggleSize,
  onToggleDimension,
  onClearAll,
  tamanhosDisponiveis = [],
}: Props) {
  // Usar tamanhos do backend se disponíveis, senão usar lista fixa
  const tamanhos = tamanhosDisponiveis.length > 0 ? tamanhosDisponiveis : SIZES;
  
  const [sizesOpen, setSizesOpen] = useState(false);
  const [sizesFilter, setSizesFilter] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const filteredSizes = useMemo(() => {
    const q = sizesFilter.trim();
    if (!q) return tamanhos;
    return tamanhos.filter((s) => s.includes(q));
  }, [sizesFilter, tamanhos]);

  useClickOutside(sizesOpen, panelRef, () => setSizesOpen(false));

  useEffect(() => {
    if (!sizesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSizesOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sizesOpen]);

  return (
    <>
      {/* overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/10 backdrop-blur-[1.5px] transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* drawer */}
      <div
        className={[
          "fixed left-0 top-0 z-50 h-full w-[340px] bg-white p-5 shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-label="Todos os filtros"
      >
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Todos os filtros</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-700"
            >
              Limpar
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-48px)] overflow-y-auto pr-1">
          {/* TAMANHO (Combobox multi 32–41) */}
          <Section title="TAMANHO (BR)">
            <div className="relative" ref={panelRef}>
              <button
                ref={btnRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={sizesOpen}
                onClick={() => setSizesOpen((v) => !v)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-left flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedSizes.length === 0
                    ? "Todos os tamanhos"
                    : `Selecionados: ${selectionsLabel(selectedSizes)}`}
                </span>
                <span aria-hidden className="ml-3 text-xs">▼</span>
              </button>

              {/* Painel: bottom sheet no mobile, popover no desktop */}
              {sizesOpen && (
                <div
                  role="dialog"
                  aria-label="Selecionar tamanhos"
                  className="fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl border-t border-zinc-200 bg-white p-4 sm:absolute sm:inset-auto sm:mt-2 sm:w-full sm:rounded-xl sm:border sm:shadow-xl sm:bottom-auto"
                >
                  {/* Header do sheet */}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Tamanhos BR</h3>
                    <button
                      onClick={() => setSizesOpen(false)}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                      aria-label="Fechar seleção de tamanhos"
                    >
                      Fechar
                    </button>
                  </div>

                  {/* Busca rápida */}
                  <div className="mb-3">
                    <label htmlFor="sizes-search" className="sr-only">
                      Buscar tamanho
                    </label>
                    <input
                      id="sizes-search"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Buscar tamanho (ex: 35, 38)"
                      value={sizesFilter}
                      onChange={(e) => setSizesFilter(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Lista com checkboxes */}
                  <ul
                    role="listbox"
                    aria-multiselectable="true"
                    className="max-h-[40vh] sm:max-h-64 overflow-y-auto rounded-lg border border-zinc-200"
                  >
                    {filteredSizes.map((s) => {
                      const active = selectedSizes.includes(s);
                      return (
                        <li
                          key={s}
                          role="option"
                          aria-selected={active}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-50"
                          onClick={() => onToggleSize(s)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              id={`size-${s}`}
                              type="checkbox"
                              checked={active}
                              onChange={() => onToggleSize(s)}
                              className="h-4 w-4 rounded border-zinc-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor={`size-${s}`} className="text-sm cursor-pointer">
                              {s}
                            </label>
                          </div>
                          {active && <span className="text-xs"></span>}
                        </li>
                      );
                    })}
                    {filteredSizes.length === 0 && (
                      <li className="px-3 py-4 text-sm text-zinc-500">
                        Nenhum tamanho encontrado
                      </li>
                    )}
                  </ul>

                  {/* Ações do sheet */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        selectedSizes.forEach((s) => onToggleSize(s));
                      }}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      Limpar seleção
                    </button>
                    <button
                      onClick={() => setSizesOpen(false)}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* DIMENSÕES */}
          <Section title="DIMENSÕES">
            <ul className="space-y-3">
              {DIMENSIONS.map((d) => {
                const active = selectedDimensions.includes(d);
                return (
                  <li key={d} className="flex items-center gap-3">
                    <input
                      id={`dim-${d}`}
                      type="checkbox"
                      checked={active}
                      onChange={() => onToggleDimension(d)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <label htmlFor={`dim-${d}`} className="text-sm">
                      {d}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}
