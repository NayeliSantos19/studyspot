import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function StarPicker({ valor, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} de 5`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill={n <= valor ? "#C08A2E" : "none"} stroke={n <= valor ? "none" : "#D8D2C2"} strokeWidth="1.2">
            <path d="M12 2l2.9 6.4 7 0.7-5.3 4.6 1.6 6.9L12 17.6 5.8 20.6l1.6-6.9L2.1 9.1l7-0.7L12 2Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ResenaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [comentario, setComentario] = useState("");
  const [ratingWifi, setRatingWifi] = useState(0);
  const [ratingEnchufes, setRatingEnchufes] = useState(0);
  const [ratingRuido, setRatingRuido] = useState(0);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function init() {
      // Si no hay sesión activa, de vuelta al login (siguiendo el flujo del mockup)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: lugarData } = await supabase.from("lugares").select("nombre").eq("id", id).single();
      setLugar(lugarData);
    }
    init();
  }, [id, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ratingWifi || !ratingEnchufes || !ratingRuido) {
      setError("Califica los tres aspectos antes de publicar.");
      return;
    }
    setEnviando(true);
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("resenas").insert({
      lugar_id: id,
      usuario_id: userData.user.id,
      rating_wifi: ratingWifi,
      rating_enchufes: ratingEnchufes,
      rating_ruido: ratingRuido,
      comentario: comentario || null,
    });

    setEnviando(false);
    if (error) setError(error.message);
    else navigate(`/lugar/${id}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-md mx-auto px-5 pt-6 flex items-center gap-3">
        <Link
          to={`/lugar/${id}`}
          aria-label="Volver"
          className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="font-serif text-lg font-bold text-ink">Dejar tu reseña</div>
          <div className="text-xs text-muted">{lugar?.nombre ?? "…"}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-5 pt-6 pb-10 flex flex-col gap-6">
        <div>
          <div className="text-sm font-semibold text-ink mb-2">¿Qué tal el wifi?</div>
          <StarPicker valor={ratingWifi} onChange={setRatingWifi} />
        </div>

        <div>
          <div className="text-sm font-semibold text-ink mb-2">¿Y los enchufes?</div>
          <StarPicker valor={ratingEnchufes} onChange={setRatingEnchufes} />
        </div>

        <div>
          <div className="text-sm font-semibold text-ink mb-2">Nivel de silencio</div>
          <StarPicker valor={ratingRuido} onChange={setRatingRuido} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-2">Cuéntanos más (opcional)</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Qué te gustó o qué se puede mejorar?"
            className="w-full box-border h-24 px-3.5 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-ink resize-none"
          />
        </div>

        {error && <p className="text-[13px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="bg-accent text-paper rounded-xl py-3.5 font-semibold text-[15px] disabled:opacity-60"
        >
          {enviando ? "Publicando…" : "Publicar reseña"}
        </button>
      </form>
    </div>
  );
}
