import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Detalle from "./pages/Detalle.jsx";
import Login from "./pages/Login.jsx";
import ResenaForm from "./pages/ResenaForm.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lugar/:id" element={<Detalle />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lugar/:id/resena" element={<ResenaForm />} />
    </Routes>
  );
}
