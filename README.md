# StudySpot

Encuentra el mejor lugar para estudiar en tu universidad: wifi, enchufes y silencio, calificados por otros estudiantes.

🔗 **Demo en vivo:** https://studyspot-eta.vercel.app

Proyecto de portafolio — ver `StudySpot-PRD.docx` (planeación) y `StudySpot-Caso-de-Estudio.docx` (retrospectiva) para el contexto completo del proceso.

## Cómo correrlo localmente

1. Instala las dependencias:
   ```
   npm install
   ```

2. Copia `.env.example` a `.env` y llena tus claves de Supabase (Settings → API en tu proyecto de Supabase):
   ```
   cp .env.example .env
   ```

3. Crea las tablas en Supabase: abre `supabase-schema.sql`, copia todo el contenido y pégalo en el **SQL Editor** de tu proyecto de Supabase, luego dale "Run".

4. Corre el proyecto:
   ```
   npm run dev
   ```

5. Abre `http://localhost:5173` en tu navegador.

## Estructura del proyecto

```
src/
  lib/supabaseClient.js       → conexión a Supabase
  components/
    FiltrosPanel.jsx           → panel de filtros (wifi/enchufes/silencio/tipo)
  pages/
    Home.jsx                   → lista de lugares, banner, orden y filtros
    Detalle.jsx                → detalle de un lugar + reseñas
    Login.jsx                  → inicio de sesión y registro
    ResenaForm.jsx              → dejar una reseña
  App.jsx                      → rutas de la app
```

## Próximos pasos

- [x] Aplicar el diseño del mockup a las pantallas principales
- [x] Agregar la pantalla/panel de Filtros
- [x] Agregar registro de nuevos usuarios (no solo login)
- [x] Mostrar el rating promedio calculado en cada tarjeta de lugar
- [x] Deploy en Vercel
- [x] Cargar lugares reales de la universidad
- [ ] Conseguir las primeras reseñas de usuarios reales
- [ ] Agregar más categorías de lugares (áreas verdes, comedores) con íconos propios
- [ ] Explorar un mapa interactivo en una v2
