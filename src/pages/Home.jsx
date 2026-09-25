import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FiltrosPanel from "../components/FiltrosPanel";

function TipoIcon({ tipo }) {
  if (tipo === "biblioteca") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5Z" />
        <path d="M12 3h6a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2h-6" />
      </svg>
    );
  }
  if (tipo === "sala") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h13v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Z" />
      <path d="M16 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 2v2M11 2v2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#C08A2E" stroke="none">
      <path d="M12 2l2.9 6.4 7 0.7-5.3 4.6 1.6 6.9L12 17.6 5.8 20.6l1.6-6.9L2.1 9.1l7-0.7L12 2Z" />
    </svg>
  );
}

function MetricDots({ level }) {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-sm ${i < level ? "bg-accent" : "bg-neutral-200"}`} />
      ))}
    </span>
  );
}

function WifiIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#847C6B" strokeWidth="2" strokeLinecap="round">
      <path d="M4 10a12 12 0 0 1 16 0" />
      <path d="M7.5 13.5a7 7 0 0 1 9 0" />
      <circle cx="12" cy="18.5" r="0.9" fill="#847C6B" stroke="none" />
    </svg>
  );
}
function EnchufeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#847C6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8Z" />
      <path d="M12 16v5" />
    </svg>
  );
}
function RuidoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#847C6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9a4 4 0 0 1 0 6" />
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

export default function Home() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [filtrosBorrador, setFiltrosBorrador] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);

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
            ratingGeneral:
              rs.length > 0
                ? ((promedio("rating_wifi") + promedio("rating_enchufes") + promedio("rating_ruido")) / 3).toFixed(1)
                : null,
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
    return lugares.filter((lugar) => {
      if (!f.tipos[lugar.tipo]) return false;

      // Los lugares sin reseñas siempre se muestran: no hay datos suficientes
      // para excluirlos, y así no desaparecen lugares nuevos de la lista.
      if (!lugar.tieneResenas) return true;

      return (
        lugar.nivelWifi >= f.wifiMin &&
        lugar.nivelEnchufes >= f.enchufesMin &&
        lugar.nivelRuido >= f.ruidoMin
      );
    });
  }, [lugares, filtrosAplicados]);

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
      <div className="max-w-md mx-auto px-5 pt-6 pb-4 flex items-center justify-between animate-fade-in">
        <h1 className="font-serif text-2xl font-bold text-accent">StudySpot</h1>
        <button
          onClick={abrirPanel}
          aria-label="Abrir filtros"
          className="relative w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 transition-transform duration-150 hover:scale-105 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F4EE" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9" cy="6" r="2.2" fill="#F7F4EE" stroke="none" />
            <circle cx="15" cy="12" r="2.2" fill="#F7F4EE" stroke="none" />
            <circle cx="9" cy="18" r="2.2" fill="#F7F4EE" stroke="none" />
          </svg>
          {hayFiltrosActivos && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold border-2 border-paper animate-pop-in" />
          )}
        </button>
      </div>

      <p className="max-w-md mx-auto px-5 pb-4 text-sm text-muted animate-fade-in" style={{ animationDelay: "80ms" }}>
        Encuentra el mejor lugar para estudiar en tu universidad
      </p>

      <div className="max-w-md mx-auto px-5 pb-8 flex flex-col gap-3">
        {loading && <p className="text-sm text-muted">Cargando lugares…</p>}
        {error && <p className="text-sm text-red-600">No se pudo conectar: {error}</p>}

        {lugaresFiltrados.map((lugar, index) => (
          <Link
            key={lugar.id}
            to={`/lugar/${lugar.id}`}
            style={{ animationDelay: `${index * 60}ms` }}
            className="animate-fade-in-up bg-white border border-neutral-200 rounded-2xl p-3.5 flex gap-3 items-start transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:shadow-none"
          >
            <div className="w-[60px] h-[60px] rounded-xl bg-accentLight flex items-center justify-center flex-shrink-0">
              <TipoIcon tipo={lugar.tipo} />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="text-[15px] font-semibold text-ink">{lugar.nombre}</div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {lugar.ratingGeneral ? (
                    <>
                      <StarIcon />
                      <span className="text-[13px] font-semibold text-ink">{lugar.ratingGeneral}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-muted">Sin reseñas</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted mt-0.5">
                {TIPO_LABEL[lugar.tipo] ?? lugar.tipo} · {lugar.ubicacion}
              </div>
              <div className="flex gap-3.5 mt-2">
                <div className="flex items-center gap-1">
                  <WifiIcon />
                  <MetricDots level={lugar.nivelWifi} />
                </div>
                <div className="flex items-center gap-1">
                  <EnchufeIcon />
                  <MetricDots level={lugar.nivelEnchufes} />
                </div>
                <div className="flex items-center gap-1">
                  <RuidoIcon />
                  <MetricDots level={lugar.nivelRuido} />
                </div>
              </div>
            </div>
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
