import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TIPO_LABEL = { cafe: "Café", biblioteca: "Biblioteca", sala: "Sala de estudio" };

function TipoIconGrande({ tipo }) {
  const common = { width: 52, height: 52, viewBox: "0 0 24 24", fill: "none", stroke: "#2C4A31", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
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

function StarIcon({ size = 16, filled = true }) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#C08A2E" stroke="none">
      <path d="M12 2l2.9 6.4 7 0.7-5.3 4.6 1.6 6.9L12 17.6 5.8 20.6l1.6-6.9L2.1 9.1l7-0.7L12 2Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D8D2C2" strokeWidth="1">
      <path d="M12 2l2.9 6.4 7 0.7-5.3 4.6 1.6 6.9L12 17.6 5.8 20.6l1.6-6.9L2.1 9.1l7-0.7L12 2Z" />
    </svg>
  );
}

function Stars({ rating }) {
  const redondeado = Math.round(rating || 0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={12} filled={i <= redondeado} />
      ))}
    </div>
  );
}

function etiquetaNivel(promedio, tipo) {
  if (!promedio) return "Sin datos";
  if (tipo === "ruido") {
    if (promedio >= 4) return "Silencioso";
    if (promedio >= 2.5) return "Moderado";
    return "Ruidoso";
  }
  if (promedio >= 4) return "Bueno";
  if (promedio >= 2.5) return "Regular";
  return "Limitado";
}

function MetricCard({ icon, label, valor }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <div className="text-[13px] font-semibold text-ink">{label}</div>
      <div className="text-[11px] text-muted mt-0.5">{valor}</div>
    </div>
  );
}

export default function Detalle() {
  const { id } = useParams();
  const [lugar, setLugar] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetalle() {
      const { data: lugarData } = await supabase
        .from("lugares")
        .select("*")
        .eq("id", id)
        .single();
      setLugar(lugarData);

      const { data: resenasData } = await supabase
        .from("resenas")
        .select("*")
        .eq("lugar_id", id)
        .order("creado_en", { ascending: false });
      setResenas(resenasData ?? []);
      setLoading(false);
    }
    fetchDetalle();
  }, [id]);

  const promedio = (campo) =>
    resenas.length ? resenas.reduce((s, r) => s + (r[campo] ?? 0), 0) / resenas.length : 0;

  const promWifi = promedio("rating_wifi");
  const promEnchufes = promedio("rating_enchufes");
  const promRuido = promedio("rating_ruido");
  const ratingGeneral = resenas.length ? (promWifi + promEnchufes + promRuido) / 3 : 0;

  if (loading) {
    return <div className="min-h-screen bg-paper p-6 text-sm text-muted">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-paper pb-28">
      <div className="relative h-40 bg-accentLight flex items-center justify-center">
        <Link
          to="/"
          aria-label="Volver"
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <TipoIconGrande tipo={lugar?.tipo} />
      </div>

      <div className="max-w-md mx-auto px-5 pt-5">
        <h1 className="font-serif text-2xl font-bold text-ink">{lugar?.nombre}</h1>
        <div className="text-[13px] text-muted mt-1">
          {TIPO_LABEL[lugar?.tipo] ?? lugar?.tipo} · {lugar?.ubicacion}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          {ratingGeneral > 0 ? (
            <>
              <StarIcon />
              <span className="text-base font-bold text-ink">{ratingGeneral.toFixed(1)}</span>
              <span className="text-[13px] text-muted">
                · {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
              </span>
            </>
          ) : (
            <span className="text-[13px] text-muted">Todavía no tiene reseñas</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <MetricCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round">
                <path d="M4 10a12 12 0 0 1 16 0" />
                <path d="M7.5 13.5a7 7 0 0 1 9 0" />
                <circle cx="12" cy="18.5" r="0.9" fill="#2C4A31" stroke="none" />
              </svg>
            }
            label="Wifi"
            valor={etiquetaNivel(promWifi, "wifi")}
          />
          <MetricCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8Z" />
                <path d="M12 16v5" />
              </svg>
            }
            label="Enchufes"
            valor={etiquetaNivel(promEnchufes, "enchufes")}
          />
          <MetricCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C4A31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                <path d="M17 9a4 4 0 0 1 0 6" />
              </svg>
            }
            label="Silencio"
            valor={etiquetaNivel(promRuido, "ruido")}
          />
        </div>

        <h2 className="mt-7 mb-3 text-[15px] font-bold text-ink">Reseñas</h2>
        <div className="flex flex-col gap-3">
          {resenas.map((r) => (
            <div key={r.id} className="bg-white border border-neutral-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-ink">Estudiante</div>
                <Stars rating={(r.rating_wifi + r.rating_enchufes + r.rating_ruido) / 3} />
              </div>
              {r.comentario && (
                <div className="text-[13px] text-neutral-600 mt-1.5 leading-relaxed">{r.comentario}</div>
              )}
            </div>
          ))}
          {resenas.length === 0 && (
            <p className="text-sm text-muted">Sé el primero en dejar una reseña de este lugar.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-gradient-to-t from-paper via-paper to-transparent">
        <div className="max-w-md mx-auto">
          <Link
            to={`/lugar/${id}/resena`}
            className="block text-center bg-accent text-paper rounded-2xl py-3.5 font-semibold text-[15px]"
          >
            Dejar reseña
          </Link>
        </div>
      </div>
    </div>
  );
}
