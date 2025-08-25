"use client";

type Props = {
  open: boolean;
  onClose: () => void;

  selectedDimensions: string[];     // Grande, Média, Pequena, Mini
  onToggleDimension: (d: string) => void;

  onClearAll: () => void;
};

const DIMENSIONS = ["Grande", "Média", "Pequena", "Mini"];

export default function FiltersSidebar({
  open,
  onClose,
  selectedDimensions,
  onToggleDimension,
  onClearAll,
}: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/10 backdrop-blur-[1.5px] transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <div
        className={[
          "fixed left-0 top-0 z-50 h-full w-[320px] bg-white p-5 shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-label="Todos os filtros"
      >
        {/* Cabeçalho */}
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
          {/* DIMENSÕES (único filtro em bolsas) */}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}
