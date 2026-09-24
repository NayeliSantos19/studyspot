import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResenaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comentario, setComentario] = useState("");
  const [ratingWifi, setRatingWifi] = useState(3);
  const [ratingEnchufes, setRatingEnchufes] = useState(3);
  const [ratingRuido, setRatingRuido] = useState(3);

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("resenas").insert({
      lugar_id: id,
      usuario_id: userData?.user?.id,
      rating_wifi: ratingWifi,
      rating_enchufes: ratingEnchufes,
      rating_ruido: ratingRuido,
      comentario,
    });

    navigate(`/lugar/${id}`);
  }

  return (
    <div className="min-h-screen bg-paper p-6 max-w-md mx-auto">
      <h1 className="font-serif text-xl font-bold text-ink">Dejar tu reseña</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        {/* TODO: reemplazar estos sliders por los selectores de estrellas del mockup */}
        <label className="text-sm font-semibold text-ink">
          Wifi ({ratingWifi}/5)
          <input
            type="range"
            min="1"
            max="5"
            value={ratingWifi}
            onChange={(e) => setRatingWifi(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="text-sm font-semibold text-ink">
          Enchufes ({ratingEnchufes}/5)
          <input
            type="range"
            min="1"
            max="5"
            value={ratingEnchufes}
            onChange={(e) => setRatingEnchufes(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="text-sm font-semibold text-ink">
          Silencio ({ratingRuido}/5)
          <input
            type="range"
            min="1"
            max="5"
            value={ratingRuido}
            onChange={(e) => setRatingRuido(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <textarea
          placeholder="¿Qué te gustó o qué se puede mejorar?"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="border border-neutral-300 rounded-xl px-4 py-3 text-sm h-24"
        />

        <button
          type="submit"
          className="bg-accent text-paper rounded-xl py-3 font-semibold"
        >
          Publicar reseña
        </button>
      </form>
    </div>
  );
}
