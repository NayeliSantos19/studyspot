import { useEffect, useState } from "react";

function RangeFiltro({ icono, label, valorTexto, valor, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icono}
          {label}
        </label>
        <span className="text-[13px] text-muted">{valorTexto}</span>
      </div>
      <input
        type="range"
        min="1"
        max="3"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

const ETIQUETAS = ["Cualquiera", "Regular o mejor", "Solo lo mejor"];

export default function FiltrosPanel({ open, filtros, onChange, onApply, onClose }) {
  // Mantenemos el panel montado un poco más al cerrar, para que la
  // animación de salida se alcance a ver antes de desaparecer del todo.
  const [renderizado, setRenderizado] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let id;
    if (open) {
      setRenderizado(true);
      id = requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      id = setTimeout(() => setRenderizado(false), 250);
    }
    return () => {
      cancelAnimationFrame?.(id);
      clearTimeout(id);
    };
  }, [open]);

  if (!renderizado) return null;

  function actualizar(campo, valor) {
    onChange({ ...filtros, [campo]: valor });
  }

  function toggleTipo(tipo) {
    onChange({
      ...filtros,
      tipos: { ...filtros.tipos, [tipo]: !filtros.tipos[tipo] },
    });
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-250 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-0 bg-paper flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="max-w-md w-full mx-auto px-5 pt-6 pb-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center transition-transform active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="font-serif text-xl font-bold text-ink">Filtros</div>
        </div>

        <div className="max-w-md w-full mx-auto px-5 flex-grow overflow-y-auto flex flex-col gap-7 py-3">
          <RangeFiltro
            label="Wifi mínimo"
            valorTexto={ETIQUETAS[filtros.wifiMin - 1]}
            valor={filtros.wifiMin}
            onChange={(v) => actualizar("wifiMin", v)}
            icono={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round">
                <path d="M4 10a12 12 0 0 1 16 0" />
                <path d="M7.5 13.5a7 7 0 0 1 9 0" />
                <circle cx="12" cy="18.5" r="0.9" fill="#2C4A31" stroke="none" />
              </svg>
            }
          />
          <RangeFiltro
            label="Enchufes"
            valorTexto={ETIQUETAS[filtros.enchufesMin - 1]}
            valor={filtros.enchufesMin}
            onChange={(v) => actualizar("enchufesMin", v)}
            icono={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8Z" />
                <path d="M12 16v5" />
              </svg>
            }
          />
          <RangeFiltro
            label="Nivel de silencio"
            valorTexto={ETIQUETAS[filtros.ruidoMin - 1]}
            valor={filtros.ruidoMin}
            onChange={(v) => actualizar("ruidoMin", v)}
            icono={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                <path d="M17 9a4 4 0 0 1 0 6" />
              </svg>
            }
          />

          <div className="h-px bg-neutral-200" />

          <div>
            <div className="text-sm font-semibold text-ink mb-2.5">Tipo de lugar</div>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <input type="checkbox" checked={filtros.tipos.cafe} onChange={() => toggleTipo("cafe")} className="w-4 h-4 accent-accent" />
                Café
              </label>
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <input type="checkbox" checked={filtros.tipos.biblioteca} onChange={() => toggleTipo("biblioteca")} className="w-4 h-4 accent-accent" />
                Biblioteca
              </label>
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <input type="checkbox" checked={filtros.tipos.sala} onChange={() => toggleTipo("sala")} className="w-4 h-4 accent-accent" />
                Sala de estudio
              </label>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto px-5 py-5 border-t border-neutral-200 flex-shrink-0">
          <button
            onClick={onApply}
            className="w-full bg-accent text-paper rounded-xl py-3.5 font-semibold text-[15px] transition-transform active:scale-[0.98]"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
