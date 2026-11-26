import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Home from "./pages/Home.jsx";
import Detalle from "./pages/Detalle.jsx";
import Login from "./pages/Login.jsx";
import ResenaForm from "./pages/ResenaForm.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lugar/:id" element={supabase ? <Detalle /> : <Navigate to="/" replace />} />
      <Route path="/login" element={supabase ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/lugar/:id/resena" element={supabase ? <ResenaForm /> : <Navigate to="/" replace />} />
    </Routes>
  );
}
