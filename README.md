# StudySpot

Encuentra el mejor lugar para estudiar en tu universidad: wifi, enchufes y silencio, calificados por otros estudiantes.

Proyecto de portafolio — ver `StudySpot-PRD.docx` para el documento completo (problema, MVP, arquitectura, decisiones técnicas).

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
  lib/supabaseClient.js   → conexión a Supabase
  pages/
    Home.jsx              → lista de lugares
    Detalle.jsx           → detalle de un lugar + reseñas
    Login.jsx             → inicio de sesión
    ResenaForm.jsx        → dejar una reseña
  App.jsx                 → rutas de la app
```

## Próximos pasos

- [ ] Reemplazar los estilos básicos por el diseño del mockup (ver canvas de Claude)
- [ ] Agregar la pantalla/panel de Filtros
- [ ] Agregar registro de nuevos usuarios (no solo login)
- [ ] Mostrar el rating promedio calculado en cada tarjeta de lugar
- [ ] Deploy en Vercel
