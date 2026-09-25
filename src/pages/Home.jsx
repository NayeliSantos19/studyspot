import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FiltrosPanel from "../components/FiltrosPanel";

function TipoIcon({ tipo, size = 26 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#2C4A31", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (tipo === "biblioteca") {
    return (
      <svg {...common}>
        <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5Z" />
        <path d="M12 3h6a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2h-6" />
      </svg>
    );
  }
  if (tipo === "sala") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 8h13v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Z" />
      <path d="M16 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 2v2M11 2v2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#847C6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  );
}

function StarIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#C08A2E" stroke="none">
      <path d="M12 2l2.9 6.4 7 0.7-5.3 4.6 1.6 6.9L12 17.6 5.8 20.6l1.6-6.9L2.1 9.1l7-0.7L12 2Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#847C6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="#2C4A31" stroke="none" />
      <circle cx="15" cy="12" r="2" fill="#2C4A31" stroke="none" />
      <circle cx="9" cy="18" r="2" fill="#2C4A31" stroke="none" />
    </svg>
  );
}

function TagBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-accentLight px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}

// Un pequeño elemento decorativo original (planta + taza), en línea con
// la paleta del proyecto — no es una foto ni un ícono de terceros.
function IlustracionDecorativa() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120" fill="none" className="hidden md:block flex-shrink-0">
      <ellipse cx="75" cy="108" rx="60" ry="8" fill="#E8EFE6" />
      <rect x="95" y="70" width="34" height="26" rx="3" fill="#FFFFFF" stroke="#2C4A31" strokeWidth="1.5" />
      <path d="M129 76h6a6 6 0 0 1 0 12h-6" stroke="#2C4A31" strokeWidth="1.5" fill="none" />
      <path d="M45 95c0-22 8-38 8-52 0 14 8 30 8 52" stroke="#2C4A31" strokeWidth="1.5" fill="none" />
      <ellipse cx="53" cy="42" rx="16" ry="10" fill="#E8EFE6" stroke="#2C4A31" strokeWidth="1.5" />
      <rect x="38" y="90" width="30" height="14" rx="2" fill="#FFFFFF" stroke="#2C4A31" strokeWidth="1.5" />
      <circle cx="112" cy="55" r="3" fill="#C08A2E" />
      <circle cx="120" cy="48" r="2" fill="#C08A2E" />
    </svg>
  );
}

function nivelDesdePromedio(promedio) {
  if (!promedio) return 0;
  return Math.max(1, Math.min(3, Math.round((promedio / 5) * 3)));
}

const TIPO_LABEL = { cafe: "Café", biblioteca: "Biblioteca", sala: "Sala de estudio" };

const FILTROS_INICIALES = {
  wifiMin: 1,
  enchufesMin: 1,
  ruidoMin: 1,
  tipos: { cafe: true, biblioteca: true, sala: true },
};

const OPCIONES_ORDEN = [
  { valor: "recomendados", texto: "Recomendados" },
  { valor: "rating", texto: "Mejor calificados" },
  { valor: "nombre", texto: "Nombre (A-Z)" },
];

export default function Home() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [filtrosBorrador, setFiltrosBorrador] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState("recomendados");

  useEffect(() => {
    async function fetchLugares() {
      const { data, error } = await supabase
        .from("lugares")
        .select("*, resenas(rating_wifi, rating_enchufes, rating_ruido)");

      if (error) {
        setError(error.message);
      } else {
        const conPromedios = (data ?? []).map((lugar) => {
          const rs = lugar.resenas ?? [];
          const promedio = (campo) =>
            rs.length ? rs.reduce((sum, r) => sum + (r[campo] ?? 0), 0) / rs.length : 0;
          return {
            ...lugar,
            promedioWifi: promedio("rating_wifi"),
            promedioEnchufes: promedio("rating_enchufes"),
            promedioRuido: promedio("rating_ruido"),
            nivelWifi: nivelDesdePromedio(promedio("rating_wifi")),
            nivelEnchufes: nivelDesdePromedio(promedio("rating_enchufes")),
            nivelRuido: nivelDesdePromedio(promedio("rating_ruido")),
            tieneResenas: rs.length > 0,
            numResenas: rs.length,
            ratingGeneral:
              rs.length > 0
                ? (promedio("rating_wifi") + promedio("rating_enchufes") + promedio("rating_ruido")) / 3
                : 0,
          };
        });
        setLugares(conPromedios);
      }
      setLoading(false);
    }
    fetchLugares();
  }, []);

  const lugaresFiltrados = useMemo(() => {
    const f = filtrosAplicados;
    let resultado = lugares.filter((lugar) => {
      if (!f.tipos[lugar.tipo]) return false;
      if (!lugar.tieneResenas) return true;
      return (
        lugar.nivelWifi >= f.wifiMin &&
        lugar.nivelEnchufes >= f.enchufesMin &&
        lugar.nivelRuido >= f.ruidoMin
      );
    });

    resultado = [...resultado].sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      if (orden === "rating") return b.ratingGeneral - a.ratingGeneral;
      // "recomendados": primero los mejor calificados, los sin reseñas al final
      if (!a.tieneResenas && !b.tieneResenas) return 0;
      if (!a.tieneResenas) return 1;
      if (!b.tieneResenas) return -1;
      return b.ratingGeneral - a.ratingGeneral;
    });

    return resultado;
  }, [lugares, filtrosAplicados, orden]);

  const hayFiltrosActivos =
    filtrosAplicados.wifiMin > 1 ||
    filtrosAplicados.enchufesMin > 1 ||
    filtrosAplicados.ruidoMin > 1 ||
    !filtrosAplicados.tipos.cafe ||
    !filtrosAplicados.tipos.biblioteca ||
    !filtrosAplicados.tipos.sala;

  function abrirPanel() {
    setFiltrosBorrador(filtrosAplicados);
    setPanelAbierto(true);
  }

  function aplicarFiltros() {
    setFiltrosAplicados(filtrosBorrador);
    setPanelAbierto(false);
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
        {/* Banner de bienvenida */}
        <div className="animate-fade-in bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">Hola 👋</h1>
            <p className="text-ink text-[15px] md:text-base mt-1 max-w-md">
              Encuentra el mejor lugar para estudiar en tu universidad
            </p>
            <p className="text-muted text-sm mt-1">
              Cafés, bibliotecas y salas de estudio, calificados por estudiantes reales.
            </p>
          </div>
          <IlustracionDecorativa />
        </div>

        {/* Encabezado de sección + controles */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <PinIcon />
            <h2 className="font-serif text-lg font-bold text-ink">Lugares disponibles</h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="text-[13px] font-medium text-ink bg-white border border-neutral-200 rounded-xl px-3 py-2 cursor-pointer"
            >
              {OPCIONES_ORDEN.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.texto}
                </option>
              ))}
            </select>

            <button
              onClick={abrirPanel}
              className="relative flex items-center gap-1.5 text-[13px] font-semibold text-ink bg-white border border-neutral-200 rounded-xl px-3 py-2 transition-transform active:scale-95"
            >
              <FilterIcon />
              Filtros
              {hayFiltrosActivos && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border-2 border-paper animate-pop-in" />
              )}
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-muted pb-8">Cargando lugares…</p>}
        {error && <p className="text-sm text-red-600 pb-8">No se pudo conectar: {error}</p>}

        <div className="flex flex-col gap-3 pb-10">
          {lugaresFiltrados.map((lugar, index) => (
            <Link
              key={lugar.id}
              to={`/lugar/${lugar.id}`}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-fade-in-up bg-white border border-neutral-200 rounded-2xl p-3.5 md:p-4 flex items-center gap-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
            >
              <div className="w-20 h-16 md:w-28 md:h-20 rounded-xl bg-accentLight flex items-center justify-center flex-shrink-0">
                <TipoIcon tipo={lugar.tipo} />
              </div>

              <div className="flex-grow min-w-0">
                <div className="font-serif text-[16px] md:text-lg font-bold text-ink truncate">{lugar.nombre}</div>
                <div className="flex items-center gap-1 text-[12px] text-muted mt-0.5">
                  <PinIcon />
                  {TIPO_LABEL[lugar.tipo] ?? lugar.tipo} · {lugar.ubicacion}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <TagBadge>{TIPO_LABEL[lugar.tipo]}</TagBadge>
                  {lugar.nivelWifi >= 2 && <TagBadge>Wifi</TagBadge>}
                  {lugar.nivelEnchufes >= 2 && <TagBadge>Tomas</TagBadge>}
                  {lugar.nivelRuido >= 2 && <TagBadge>Silencio</TagBadge>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-2">
                {lugar.tieneResenas ? (
                  <>
                    <div className="flex items-center gap-1">
                      <StarIcon />
                      <span className="text-[14px] font-bold text-ink">{lugar.ratingGeneral.toFixed(1)}</span>
                    </div>
                    <span className="text-[11px] text-muted whitespace-nowrap">
                      ({lugar.numResenas} {lugar.numResenas === 1 ? "reseña" : "reseñas"})
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted whitespace-nowrap">Sin reseñas</span>
                )}
              </div>

              <ChevronIcon />
            </Link>
          ))}

          {!loading && !error && lugaresFiltrados.length === 0 && (
            <p className="text-sm text-muted">
              {lugares.length === 0
                ? "Aún no hay lugares cargados. Agrega algunos desde el Table Editor de Supabase."
                : "Ningún lugar cumple con esos filtros. Prueba ajustándolos."}
            </p>
          )}
        </div>
      </div>

      <FiltrosPanel
        open={panelAbierto}
        filtros={filtrosBorrador}
        onChange={setFiltrosBorrador}
        onApply={aplicarFiltros}
        onClose={() => setPanelAbierto(false)}
      />
    </div>
  );
}