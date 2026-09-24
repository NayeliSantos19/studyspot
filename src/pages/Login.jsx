import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate(-1); // vuelve a la pantalla anterior (Detalle)
  }

  return (
    <div className="min-h-screen bg-paper p-6 flex flex-col justify-center max-w-sm mx-auto">
      <h1 className="font-serif text-2xl font-bold text-ink">Bienvenido de vuelta</h1>
      <p className="text-sm text-muted mt-1">
        Inicia sesión para dejar tu opinión sobre este lugar
      </p>

      <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          placeholder="tunombre@universidad.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-neutral-300 rounded-xl px-4 py-3 text-sm"
        />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-neutral-300 rounded-xl px-4 py-3 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="bg-accent text-paper rounded-xl py-3 font-semibold"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
