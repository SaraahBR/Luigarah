"use client";

type Props = {
  open: boolean;
  onClose: () => void;

  selectedSizes: string[]; // tamanhos de roupas (XXXS..XL) e numeração (34..41)
  selectedDimensions: string[]; // Grande, Médio/Média, Pequeno/Pequena, Mini

  onToggleSize: (s: string) => void;
  onToggleDimension: (d: string) => void;

  onClearAll: () => void;
  tamanhosDisponiveis?: string[]; // Tamanhos vindos do backend
};

const SIZES = [
  "XXXS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
];
const DIMENSIONS = ["Grande", "Médio", "Média", "Pequeno", "Pequena", "Mini"];

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
  return (
    <>
      {/* Overlay com blur suave */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/10 backdrop-blur-[1.5px] transition-opacity",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
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
              aria-label="Fechar filtros"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-48px)] overflow-y-auto pr-1">
          {/* TAMANHO */}
          <Section title="TAMANHO">
            <div className="grid grid-cols-3 gap-3">
              {tamanhos.map((s) => {
                const active = selectedSizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => onToggleSize(s)}
                    className={[
                      "rounded-md border px-3 py-2 text-sm",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 hover:bg-zinc-50",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {s}
                  </button>
                );
              })}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-600">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
