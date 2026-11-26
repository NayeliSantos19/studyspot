import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FiltrosPanel from "../components/FiltrosPanel";
import "./explorar.css";

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

const TIPO_LABEL = { cafe: "Café", biblioteca: "Biblioteca", sala: "Sala de estudio" };
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


const FOTOS = {
  biblioteca: "https://images.unsplash.com/photo-1782080226304-b33c0a95a8bc?auto=format&fit=crop&w=720&q=78",
  cafe: "https://images.unsplash.com/photo-1775059956734-78ffd2075cec?auto=format&fit=crop&w=720&q=78",
  sala: "https://images.unsplash.com/photo-1777896193454-8b4863264f0b?auto=format&fit=crop&w=720&q=78",
};
const EJEMPLOS = [
  { id: "biblio", nombre: "Biblioteca Central", tipo: "biblioteca", ubicacion: "Edificio central", ratings: [4, 4, 5] },
  { id: "cafe", nombre: "Café Aurora", tipo: "cafe", ubicacion: "Cerca del campus", ratings: [5, 3, 3] },
  { id: "sala", nombre: "Sala de Estudio B4", tipo: "sala", ubicacion: "Facultad de Ingeniería", ratings: [4, 5, 4] },
  { id: "lectura", nombre: "Sala de Lectura Norte", tipo: "biblioteca", ubicacion: "Zona norte", ratings: [4, 3, 5] },
  { id: "mesa", nombre: "Mesas del Pasillo", tipo: "sala", ubicacion: "Edificio de aulas", ratings: [3, 4, 3] },
  { id: "portal", nombre: "Café del Portal", tipo: "cafe", ubicacion: "Entrada del campus", ratings: [4, 4, 2] },
].map(({ ratings: [rating_wifi, rating_enchufes, rating_ruido], ...lugar }) => ({
  ...lugar, resenas: [{ rating_wifi, rating_enchufes, rating_ruido }],
}));

function resumirLugar(lugar) {
  const resenas = lugar.resenas ?? [];
  const promedio = (campo) => resenas.length
    ? resenas.reduce((suma, resena) => suma + (resena[campo] ?? 0), 0) / resenas.length
    : 0;
  const wifi = promedio("rating_wifi");
  const enchufes = promedio("rating_enchufes");
  const ruido = promedio("rating_ruido");
  return {
    ...lugar, nivelWifi: nivelDesdePromedio(wifi), nivelEnchufes: nivelDesdePromedio(enchufes),
    nivelRuido: nivelDesdePromedio(ruido), tieneResenas: resenas.length > 0,
    ratingGeneral: (wifi + enchufes + ruido) / 3,
  };
}

function FotoLugar({ lugar }) {
  const foto = lugar.foto_url || FOTOS[lugar.tipo];
  return (
    <div className={`spot-photo spot-photo--${lugar.tipo}`}>
      <TipoIcon tipo={lugar.tipo} size={38} />
      {foto && <img src={foto} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
      {!lugar.foto_url && foto && <span className="spot-photo-label">Imagen ilustrativa</span>}
    </div>
  );
}

const MAPA_PUNTOS = [[23, 18], [65, 29], [42, 43], [77, 57], [23, 64], [55, 76]];
function Plano({ lugares, activo, onSelect }) {
  return (
    <aside className="spot-map" aria-label="Plano ilustrativo de los lugares">
      <div className="spot-map-heading">
        <strong>Plano de lugares</strong>
        <p>{lugares.length > MAPA_PUNTOS.length ? "Primeros seis resultados · Posiciones ilustrativas" : "Ubicaciones ilustrativas"}</p>
      </div>
      {lugares.slice(0, MAPA_PUNTOS.length).map((lugar, index) => {
        const [x, y] = MAPA_PUNTOS[index];
        return (
          <button key={lugar.id} type="button" className="spot-pin"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={lugar.nombre} aria-pressed={lugar.id === activo}
            onClick={() => onSelect(lugar.id)}>
            {lugar.tieneResenas ? `★ ${lugar.ratingGeneral.toFixed(1)}` : index + 1}
          </button>
        );
      })}
    </aside>
  );
}

export default function Home() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(!supabase);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recomendados");
  const [tipo, setTipo] = useState("todos");
  const [vistaMapa, setVistaMapa] = useState(true);
  const [activo, setActivo] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [filtrosBorrador, setFiltrosBorrador] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        if (!supabase) throw new Error("Modo demo");
        const { data, error } = await supabase
          .from("lugares")
          .select("*, resenas(rating_wifi, rating_enchufes, rating_ruido)")
          .abortSignal(control.signal);
        if (error) throw error;
        if (!cancelado) setLugares((data ?? []).map(resumirLugar));
      } catch {
        if (!cancelado) {
          setDemo(true);
          setLugares(EJEMPLOS.map(resumirLugar));
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    const control = new AbortController();
    const timeout = setTimeout(() => control.abort(), 4500);
    cargar().finally(() => clearTimeout(timeout));
    return () => {
      cancelado = true;
      clearTimeout(timeout);
      control.abort();
    };
  }, []);

  const resultados = useMemo(() => {
    const normalizar = (s) => (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    const consulta = normalizar(busqueda.trim());
    const f = filtrosAplicados;
    const visibles = lugares.filter((lugar) =>
      (tipo === "todos" || lugar.tipo === tipo) &&
      f.tipos[lugar.tipo] &&
      normalizar([lugar.nombre, lugar.ubicacion, TIPO_LABEL[lugar.tipo]].filter(Boolean).join(" ")).includes(consulta) &&
      ((!lugar.tieneResenas && f.wifiMin === 1 && f.enchufesMin === 1 && f.ruidoMin === 1) ||
        (lugar.nivelWifi >= f.wifiMin && lugar.nivelEnchufes >= f.enchufesMin && lugar.nivelRuido >= f.ruidoMin)),
    );
    return visibles.sort((a, b) => orden === "nombre"
      ? a.nombre.localeCompare(b.nombre, "es")
      : orden === "rating" || orden === "recomendados" ? b.ratingGeneral - a.ratingGeneral : 0);
  }, [lugares, tipo, busqueda, filtrosAplicados, orden]);

  const seleccionado = resultados.find((lugar) => lugar.id === activo);
  function seleccionar(id) {
    setActivo(id);
    const tarjeta = document.getElementById(`spot-${id}`);
    tarjeta?.focus({ preventScroll: true });
    tarjeta?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <div className="spot-shell">
      <header className="spot-header">
        <Link to="/" className="spot-brand"><span aria-hidden="true"><TipoIcon tipo="biblioteca" size={18} /></span>StudySpot</Link>
        <div className="spot-categories" role="group" aria-label="Tipo de lugar">
          {Object.entries({ todos: "Todos", ...TIPO_LABEL }).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={tipo === key} onClick={() => setTipo(key)}>{label}</button>
          ))}
        </div>
        {demo ? <span className="spot-demo">Demo de solo lectura</span> : <Link className="spot-login" to="/login">Mi cuenta ↗</Link>}
      </header>
      <main className="spot-main">
        <div className="spot-toolbar">
          <input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar lugares, salas o cafés" aria-label="Buscar lugares" />
          <button type="button" onClick={() => { setFiltrosBorrador(filtrosAplicados); setPanelAbierto(true); }}>Filtros</button>
          <button type="button" className="spot-map-toggle" aria-pressed={vistaMapa} onClick={() => setVistaMapa(!vistaMapa)}>
            {vistaMapa ? "Ocultar plano" : "Mostrar plano"}
          </button>
        </div>
        <div className="spot-title">
          <div>
            <h1>Espacios para estudiar</h1>
            <p role="status">{loading ? "Cargando lugares…" : `${resultados.length} ${resultados.length === 1 ? "lugar" : "lugares"}${demo ? " de ejemplo" : ""}`}</p>
          </div>
          <label>Ordenar <select value={orden} onChange={(event) => setOrden(event.target.value)}>
            {OPCIONES_ORDEN.map(({ valor, texto }) => <option key={valor} value={valor}>{texto}</option>)}
          </select></label>
        </div>
        <div className={`spot-results ${vistaMapa ? "" : "spot-results--wide"}`}>
          <section className="spot-grid" aria-label="Espacios de estudio">
            {resultados.map((lugar) => (
              <article key={lugar.id} id={`spot-${lugar.id}`} tabIndex={-1} className="spot-card"
                data-selected={lugar.id === activo}>
                <FotoLugar lugar={lugar} />
                <div className="spot-card-body">
                  <span className="spot-kind">{TIPO_LABEL[lugar.tipo] ?? lugar.tipo}</span>
                  <h2>{lugar.nombre}</h2>
                  <p>{lugar.ubicacion || "Ubicación sin indicar"}</p>
                  <div className="spot-card-meta">
                    <span>{lugar.tieneResenas ? `★ ${lugar.ratingGeneral.toFixed(1)}` : "Sin reseñas"}</span>
                    {demo
                      ? <button type="button" onClick={() => setActivo(lugar.id)} aria-label={`Ver información de ${lugar.nombre}`}>↗</button>
                      : <Link to={`/lugar/${lugar.id}`} aria-label={`Ver ${lugar.nombre}`}>↗</Link>}
                  </div>
                </div>
              </article>
            ))}
            {!loading && !resultados.length && <p className="spot-empty">No encontramos lugares con esa búsqueda.</p>}
          </section>
          {vistaMapa && <Plano lugares={resultados} activo={activo} onSelect={seleccionar} />}
        </div>
        {demo && seleccionado && (
          <section className="spot-detail" aria-live="polite" aria-label="Detalle del lugar de ejemplo">
            <div><h2>{seleccionado.nombre}</h2><p>{seleccionado.ubicacion} · Lugar de ejemplo</p></div>
            <p>Wifi {seleccionado.resenas[0].rating_wifi}/5 · Enchufes {seleccionado.resenas[0].rating_enchufes}/5 · Silencio {seleccionado.resenas[0].rating_ruido}/5</p>
            <button type="button" onClick={() => setActivo(null)}>Cerrar</button>
          </section>
        )}
      </main>
      <FiltrosPanel open={panelAbierto} filtros={filtrosBorrador} onChange={setFiltrosBorrador}
        onApply={() => { setFiltrosAplicados(filtrosBorrador); setPanelAbierto(false); }}
        onClose={() => setPanelAbierto(false)} />
    </div>
  );
}
