import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [avisoRegistro, setAvisoRegistro] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setCargando(false);
      if (error) setError(traducirError(error.message));
      else navigate(-1); // vuelve a la pantalla de Detalle
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setCargando(false);
      if (error) setError(traducirError(error.message));
      else setAvisoRegistro(true);
    }
  }

  function traducirError(msg) {
    if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
    if (msg.includes("already registered")) return "Ese correo ya tiene una cuenta. Inicia sesión.";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    return msg;
  }

  return (
    <div className="min-h-screen bg-paper px-6 pt-6 pb-10 max-w-sm mx-auto flex flex-col">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Volver"
        className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232019" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-grow flex flex-col justify-center">
        {avisoRegistro ? (
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">Revisa tu correo</h1>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo para activar tu
              cuenta y luego vuelve aquí a iniciar sesión.
            </p>
            <button
              onClick={() => {
                setAvisoRegistro(false);
                setModo("login");
              }}
              className="mt-6 text-sm font-semibold text-accent"
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-bold text-ink">
              {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h1>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              {modo === "login"
                ? "Inicia sesión para dejar tu opinión sobre este lugar"
                : "Regístrate para poder dejar reseñas en StudySpot"}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">
                  Correo institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="tunombre@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full box-border px-3.5 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-ink"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full box-border px-3.5 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-ink"
                />
              </div>

              {error && <p className="text-[13px] text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="bg-accent text-paper rounded-xl py-3.5 font-semibold text-[15px] disabled:opacity-60"
              >
                {cargando ? "Un momento…" : modo === "login" ? "Iniciar sesión" : "Registrarme"}
              </button>
            </form>

            <div className="text-center mt-4 text-[13px] text-muted">
              {modo === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setModo("registro");
                      setError(null);
                    }}
                    className="text-accent font-semibold"
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setModo("login");
                      setError(null);
                    }}
                    className="text-accent font-semibold"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
