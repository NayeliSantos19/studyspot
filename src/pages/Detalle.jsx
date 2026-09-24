import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Detalle() {
  const { id } = useParams();
  const [lugar, setLugar] = useState(null);
  const [resenas, setResenas] = useState([]);

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
        .eq("lugar_id", id);
      setResenas(resenasData ?? []);
    }
    fetchDetalle();
  }, [id]);

  return (
    <div className="min-h-screen bg-paper p-6">
      <Link to="/" className="text-sm font-semibold text-accent">
        ← Volver
      </Link>

      <div className="h-40 bg-accentLight rounded-2xl my-4" />

      <h1 className="font-serif text-2xl font-bold text-ink">
        {lugar?.nombre ?? "Cargando…"}
      </h1>
      <p className="text-sm text-muted">{lugar?.ubicacion}</p>

      {/* TODO: métricas de wifi/enchufes/ruido, ver mockup "Detalle" */}

      <h2 className="mt-6 mb-2 font-semibold text-ink">Reseñas</h2>
      <div className="flex flex-col gap-2">
        {resenas.map((r) => (
          <div key={r.id} className="bg-white border border-neutral-200 rounded-xl p-3 text-sm">
            {r.comentario}
          </div>
        ))}
        {resenas.length === 0 && (
          <p className="text-sm text-muted">Todavía no hay reseñas para este lugar.</p>
        )}
      </div>

      <Link
        to="/login"
        className="mt-6 block text-center bg-accent text-paper rounded-xl py-3 font-semibold"
      >
        Dejar reseña
      </Link>
    </div>
  );
}
