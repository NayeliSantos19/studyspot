-- Pega esto en Supabase: SQL Editor -> New query -> Run

create table lugares (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text check (tipo in ('cafe', 'biblioteca', 'sala')) not null,
  ubicacion text,
  foto_url text,
  creado_en timestamp with time zone default now()
);

create table resenas (
  id uuid primary key default gen_random_uuid(),
  lugar_id uuid references lugares(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete cascade,
  rating_wifi int check (rating_wifi between 1 and 5),
  rating_enchufes int check (rating_enchufes between 1 and 5),
  rating_ruido int check (rating_ruido between 1 and 5),
  comentario text,
  creado_en timestamp with time zone default now()
);

-- Permite leer lugares y reseñas a cualquiera (son públicos)
alter table lugares enable row level security;
create policy "Lugares visibles para todos" on lugares for select using (true);

alter table resenas enable row level security;
create policy "Reseñas visibles para todos" on resenas for select using (true);
create policy "Usuarios autenticados pueden crear reseñas" on resenas for insert
  with check (auth.uid() = usuario_id);

-- Lugares de prueba para que Home no se vea vacío
insert into lugares (nombre, tipo, ubicacion) values
  ('Café Aurora', 'cafe', 'a 5 min del campus'),
  ('Biblioteca Central', 'biblioteca', 'Edificio central'),
  ('Sala de Estudio B4', 'sala', 'Facultad de Ingeniería');
