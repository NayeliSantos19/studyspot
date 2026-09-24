import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLugares() {
      // TODO: cuando tengas la tabla "lugares" creada en Supabase,
      // esto va a traer los datos reales.
      const { data, error } = await supabase.from("lugares").select("*");

      if (error) setError(error.message);
      else setLugares(data ?? []);
      setLoading(false);
    }
    fetchLugares();
  }, []);

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl font-bold text-accent">StudySpot</h1>
        {/* TODO: botón de filtros, ver mockup "Filtros" */}
      </div>
      <p className="text-sm text-muted mb-6">
        Encuentra el mejor lugar para estudiar en tu universidad
      </p>

      {loading && <p className="text-sm text-muted">Cargando lugares…</p>}
      {error && (
        <p className="text-sm text-red-600">
          No se pudo conectar a Supabase todavía: {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {lugares.map((lugar) => (
          <Link
            key={lugar.id}
            to={`/lugar/${lugar.id}`}
            className="bg-white border border-neutral-200 rounded-2xl p-4 flex gap-3"
          >
            <div className="w-16 h-16 rounded-xl bg-accentLight flex-shrink-0" />
            <div>
              <div className="font-semibold text-ink">{lugar.nombre}</div>
              <div className="text-xs text-muted">{lugar.tipo}</div>
            </div>
          </Link>
        ))}

        {!loading && !error && lugares.length === 0 && (
          <p className="text-sm text-muted">
            Aún no hay lugares cargados. Agrega algunos desde el Table Editor
            de Supabase para verlos aquí.
          </p>
        )}
      </div>
    </div>
  );
}
