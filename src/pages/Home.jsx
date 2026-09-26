import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FiltrosPanel from "../components/FiltrosPanel";

const TIPO_STYLE = {
  cafe: { bg: "bg-coralLight", text: "text-coral", border: "border-l-coral", icon: "#D97757" },
  biblioteca: { bg: "bg-accentLight", text: "text-accent", border: "border-l-accent", icon: "#2C4A31" },
  sala: { bg: "bg-skyLight", text: "text-sky", border: "border-l-sky", icon: "#3E7C8C" },
};

function TipoIcon({ tipo, size = 26 }) {
  const color = TIPO_STYLE[tipo]?.icon ?? "#2C4A31";
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
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

// Pequeños garabatos decorativos, como los que rodean un titular escrito a mano
function SparkleDoodle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C08A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block -translate-y-2">
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M18 18l-3-3M6 18l3-3M18 6l-3 3" />
    </svg>
  );
}
function HeartDoodle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block -translate-y-3 rotate-6">
      <path d="M12 20s-7-4.4-9.3-8.8C1 8 2.6 4.8 6 4.2c2-.4 3.8.6 6 3 2.2-2.4 4-3.4 6-3 3.4.6 5 3.8 3.3 7C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

const TIPO_LABEL = { cafe: "Café", biblioteca: "Biblioteca", sala: "Sala de estudio" };

function TagBadge({ children, tono = "accent" }) {
  const estilos = {
    accent: "text-accent bg-accentLight",
    coral: "text-coral bg-coralLight",
    sky: "text-sky bg-skyLight",
    sun: "text-sun bg-sunLight",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${estilos[tono]}`}>
      {children}
    </span>
  );
}

// Un gatito acurrucado sobre un libro, dibujo propio y sencillo, en la
// paleta del proyecto — no es una foto ni copia de ninguna ilustración.
function IlustracionDecorativa() {
  return (
    <svg width="168" height="120" viewBox="0 0 168 120" fill="none" className="hidden md:block flex-shrink-0">
      <ellipse cx="84" cy="110" rx="70" ry="7" fill="#EFE9DA" />

      {/* planta */}
      <path d="M22 96c0-20 7-34 7-46 0 14 7 26 7 46" stroke="#2C4A31" strokeWidth="1.6" fill="none" />
      <ellipse cx="29" cy="46" rx="14" ry="9" fill="#E8EFE6" stroke="#2C4A31" strokeWidth="1.4" />
      <rect x="16" y="90" width="26" height="12" rx="2" fill="#FFFFFF" stroke="#2C4A31" strokeWidth="1.4" />

      {/* libros apilados */}
      <rect x="58" y="86" width="46" height="9" rx="1.5" fill="#D97757" />
      <rect x="62" y="77" width="40" height="9" rx="1.5" fill="#3E7C8C" />
      <rect x="66" y="68" width="34" height="9" rx="1.5" fill="#E0A83E" />

      {/* gatito acurrucado encima */}
      <path d="M78 68c-4-10 3-18 14-18 12 0 20 8 18 18-1 6-9 10-17 10s-13-4-15-10Z" fill="#232019" />
      <path d="M83 51l-2-6 5 4Z" fill="#232019" />
      <path d="M108 51l3-6-6 4Z" fill="#232019" />
      <circle cx="118" cy="63" r="3.4" fill="#FFFFFF" />
      <path d="M96 66c3 2 7 2 10 0" stroke="#F7F4EE" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* taza */}
      <rect x="130" y="82" width="20" height="16" rx="3" fill="#FFFFFF" stroke="#2C4A31" strokeWidth="1.5" />
      <path d="M150 86h5a4 4 0 0 1 0 8h-5" stroke="#2C4A31" strokeWidth="1.5" fill="none" />
      <path d="M136 76c1-2-1-3 0-5M142 76c1-2-1-3 0-5" stroke="#C0A98E" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function nivelDesdePromedio(promedio) {
  if (!promedio) return 0;
  return Math.max(1, Math.min(3, Math.round((promedio / 5) * 3)));
}

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

const MENSAJES_CARGA = [
  "Buscando tu rincón ideal…",
  "Sacudiendo el polvo de las bibliotecas…",
  "Preguntándole a los cafés cuál tiene mejor wifi…",
];

// Fondo decorativo tipo "bokeh", hecho con círculos difuminados en los
// colores de la marca — ambiental y sutil, no distrae del contenido.
function FondoBokeh() {
  const circulos = [
    { top: "4%", left: "8%", size: 140, color: "bg-coral/25" },
    { top: "12%", left: "78%", size: 200, color: "bg-sky/20" },
    { top: "38%", left: "2%", size: 110, color: "bg-sun/25" },
    { top: "55%", left: "88%", size: 160, color: "bg-accent/15" },
    { top: "70%", left: "20%", size: 90, color: "bg-gold/20" },
    { top: "85%", left: "60%", size: 180, color: "bg-coral/15" },
    { top: "20%", left: "45%", size: 120, color: "bg-sky/15" },
  ];
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {circulos.map((c, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${c.color}`}
          style={{ top: c.top, left: c.left, width: c.size, height: c.size }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeCarga] = useState(
    MENSAJES_CARGA[Math.floor(Math.random() * MENSAJES_CARGA.length)]
  );

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
    <div className="relative min-h-screen bg-paper">
      <FondoBokeh />
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8">
        {/* Banner de bienvenida */}
        <div className="animate-fade-in relative overflow-hidden bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">
              <SparkleDoodle /> Hola <HeartDoodle />
            </h1>
            <p className="text-ink text-[15px] md:text-base mt-1 max-w-md font-medium">
              ¡Encuentra el mejor lugar para estudiar en tu universidad!
            </p>
            <p className="text-muted text-sm mt-1 max-w-sm">
              Cafés, bibliotecas y rincones secretos, todo en un solo lugar.
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

        {loading && <p className="text-sm text-muted pb-8">{mensajeCarga}</p>}
        {error && <p className="text-sm text-red-600 pb-8">No se pudo conectar: {error}</p>}

        <div className="flex flex-col gap-3 pb-10">
          {lugaresFiltrados.map((lugar, index) => {
            const estilo = TIPO_STYLE[lugar.tipo] ?? TIPO_STYLE.sala;
            return (
              <Link
                key={lugar.id}
                to={`/lugar/${lugar.id}`}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`animate-fade-in-up bg-white border border-neutral-200 border-l-4 ${estilo.border} rounded-2xl p-3.5 md:p-4 flex items-center gap-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]`}
              >
                <div className={`w-20 h-16 md:w-28 md:h-20 rounded-xl ${estilo.bg} flex items-center justify-center flex-shrink-0`}>
                  <TipoIcon tipo={lugar.tipo} />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="font-serif text-[16px] md:text-lg font-bold text-ink truncate">{lugar.nombre}</div>
                  <div className="flex items-center gap-1 text-[12px] text-muted mt-0.5">
                    <PinIcon />
                    {TIPO_LABEL[lugar.tipo] ?? lugar.tipo} · {lugar.ubicacion}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <TagBadge tono={lugar.tipo === "cafe" ? "coral" : lugar.tipo === "sala" ? "sky" : "accent"}>
                      {TIPO_LABEL[lugar.tipo]}
                    </TagBadge>
                    {lugar.nivelWifi >= 2 && <TagBadge tono="sky">Wifi</TagBadge>}
                    {lugar.nivelEnchufes >= 2 && <TagBadge tono="sun">Tomas</TagBadge>}
                    {lugar.nivelRuido >= 2 && <TagBadge tono="accent">Silencio</TagBadge>}
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
                    <span className="text-[11px] text-coral font-medium whitespace-nowrap">Sé el primero ✨</span>
                  )}
                </div>

                <ChevronIcon />
              </Link>
            );
          })}

          {!loading && !error && lugaresFiltrados.length === 0 && (
            <p className="text-sm text-muted">
              {lugares.length === 0
                ? "Todavía no hay lugares por aquí. ¡Agrega el primero desde Supabase! 🌱"
                : "Nada coincide con esos filtros — prueba aflojándolos un poco 🔍"}
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
