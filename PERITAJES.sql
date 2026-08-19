-- Estructura de peritajes para Funes Exclusivos.
-- Ejecutar manualmente en Supabase. Es idempotente y no borra datos existentes.

create extension if not exists pgcrypto;

create table if not exists public.peritaje_plantillas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  created_by uuid references public.empleados(id) on delete set null,
  updated_by uuid references public.empleados(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.peritaje_plantilla_secciones (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid not null references public.peritaje_plantillas(id) on delete cascade,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (plantilla_id, nombre)
);

create table if not exists public.peritaje_plantilla_items (
  id uuid primary key default gen_random_uuid(),
  seccion_id uuid not null references public.peritaje_plantilla_secciones(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  tipo text not null default 'estado' check (tipo in ('estado', 'check', 'boolean', 'texto', 'numero', 'fecha')),
  opciones jsonb not null default '[]'::jsonb,
  orden integer not null default 0,
  requerido boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (seccion_id, codigo)
);

create table if not exists public.peritajes (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid not null references public.vehiculos(id) on delete cascade,
  plantilla_id uuid references public.peritaje_plantillas(id) on delete set null,
  estado text not null default 'borrador' check (estado in ('borrador', 'en_proceso', 'completado', 'anulado')),
  fecha_peritaje date not null default current_date,
  cliente_nombre text,
  cliente_telefono text,
  vendedor_id uuid references public.empleados(id) on delete set null,
  tasador_id uuid references public.empleados(id) on delete set null,
  datos_generales jsonb not null default '{}'::jsonb,
  equipamiento jsonb not null default '{}'::jsonb,
  observaciones text,
  gasto_total numeric(14,2) not null default 0 check (gasto_total >= 0),
  moneda text not null default 'ARS' check (moneda in ('ARS', 'USD')),
  valor_mercado numeric(14,2) check (valor_mercado is null or valor_mercado >= 0),
  valor_sitio_1 numeric(14,2) check (valor_sitio_1 is null or valor_sitio_1 >= 0),
  valor_sitio_2 numeric(14,2) check (valor_sitio_2 is null or valor_sitio_2 >= 0),
  valor_tasado numeric(14,2) check (valor_tasado is null or valor_tasado >= 0),
  created_by uuid references public.empleados(id) on delete set null,
  updated_by uuid references public.empleados(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.peritaje_items (
  id uuid primary key default gen_random_uuid(),
  peritaje_id uuid not null references public.peritajes(id) on delete cascade,
  plantilla_item_id uuid references public.peritaje_plantilla_items(id) on delete set null,
  codigo text not null,
  nombre text not null,
  seccion text,
  tipo text not null default 'estado' check (tipo in ('estado', 'check', 'boolean', 'texto', 'numero', 'fecha')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'revisar', 'reparar', 'listo', 'no_aplica')),
  valor jsonb not null default '{}'::jsonb,
  nota text,
  orden integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (peritaje_id, codigo)
);

create table if not exists public.peritaje_paneles (
  id uuid primary key default gen_random_uuid(),
  peritaje_id uuid not null references public.peritajes(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'revisar', 'reparar', 'listo', 'no_aplica')),
  nota text,
  orden integer not null default 0,
  updated_by uuid references public.empleados(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (peritaje_id, codigo)
);

create table if not exists public.peritaje_reparaciones (
  id uuid primary key default gen_random_uuid(),
  peritaje_id uuid not null references public.peritajes(id) on delete cascade,
  orden integer not null default 0,
  descripcion text not null,
  monto numeric(14,2) not null default 0 check (monto >= 0),
  moneda text not null default 'ARS' check (moneda in ('ARS', 'USD')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'realizado', 'no_aplica')),
  created_at timestamptz not null default now()
);

create index if not exists peritajes_vehiculo_idx on public.peritajes(vehiculo_id, created_at desc);
create index if not exists peritaje_items_peritaje_idx on public.peritaje_items(peritaje_id, orden);
create index if not exists peritaje_paneles_peritaje_idx on public.peritaje_paneles(peritaje_id, orden);
create index if not exists peritaje_reparaciones_peritaje_idx on public.peritaje_reparaciones(peritaje_id, orden);

-- Plantilla base inspirada en el formulario de tasación entregado.
do $$
declare
  template_id uuid := '00000000-0000-0000-0000-000000000001';
  section_id uuid;
  section_record record;
  item_name text;
  item_index integer;
  sections jsonb := '[
    {"code":"datos","name":"Datos generales","description":"Identificación, titularidad y antecedentes."},
    {"code":"equipamiento","name":"Equipamiento","description":"Elementos y accesorios del vehículo."},
    {"code":"desgaste","name":"Estado y desgaste","description":"Revisión funcional y estado de componentes."}
  ]'::jsonb;
  equipment text[] := array[
    'ABS','Airbag','Alarma','Aire acondicionado','Dirección hidráulica','Blindado','Cuero','CD','Multimedia','Computadora de viaje','Limpialuneta','Desempañador trasero','Llantas de aleación','Techo solar','Cierre eléctrico','Levanta vidrios','Control de estabilidad','Control de tracción','4x4','Sensores o cámara','Espejos eléctricos','Control de velocidad','Sensor de lluvia','Sensor de luces','USB / SD / AUX / Bluetooth','Asientos eléctricos','Matafuegos','Balizas','Gato y llave de rueda'
  ];
  desgaste text[] := array[
    'Neumático delantero izquierdo','Neumático delantero derecho','Neumático trasero izquierdo','Neumático trasero derecho','Neumático de auxilio','Limpiaparabrisas','Rociador limpiaparabrisas','Aire acondicionado','Intermitentes','Luces y faros','Motor general','Acción embrague','Pastillas de freno','Discos','Fuga de frenos','Amortiguadores','Suspensión y juntas','Ruidos de suspensión','Correa dentada','Regulación butacas','Acción vidrios eléctricos','Acción vidrios manuales','Estado butacas','Freno de estacionamiento','Llaves y trabas eléctricas','Espejos','Cinturones de seguridad','Caja de dirección','Soportes de motor y cambios','Ruidos de motor o cambios','Fuga de motor','Fuga de cambios','Escape','Humo anormal','Estado del panel','Acción de cambios'
  ];
  general_items jsonb := '[
    {"code":"cliente_nombre","name":"Cliente","tipo":"texto"},
    {"code":"cliente_telefono","name":"Teléfono","tipo":"texto"},
    {"code":"puertas","name":"Puertas","tipo":"numero"},
    {"code":"motor","name":"Motor","tipo":"texto"},
    {"code":"transmision","name":"Transmisión","tipo":"texto"},
    {"code":"combustible","name":"Combustible","tipo":"texto"},
    {"code":"numero_chasis","name":"Número de chasis","tipo":"texto"},
    {"code":"numero_motor","name":"Número de motor","tipo":"texto"},
    {"code":"alineado","name":"Alineado","tipo":"boolean"},
    {"code":"revisiones","name":"Revisiones","tipo":"boolean"},
    {"code":"garantia","name":"Garantía","tipo":"boolean"},
    {"code":"manuales","name":"Manuales","tipo":"boolean"},
    {"code":"segunda_llave","name":"Segunda llave","tipo":"boolean"},
    {"code":"unico_dueno","name":"Único dueño","tipo":"boolean"}
  ]'::jsonb;
begin
  insert into public.peritaje_plantillas (id, nombre, descripcion)
  values (template_id, 'Tasación de vehículo usado', 'Checklist base para inspección, desgaste, equipamiento y valores de referencia.')
  on conflict (id) do nothing;

  for section_record in select * from jsonb_array_elements(sections) loop
    -- Los ids se buscan por nombre para que la carga sea segura si ya existe la sección.
    insert into public.peritaje_plantilla_secciones (plantilla_id, nombre, descripcion, orden)
    values (template_id, section_record.value->>'name', section_record.value->>'description', (select count(*) from public.peritaje_plantilla_secciones where plantilla_id = template_id))
    on conflict (plantilla_id, nombre) do update set descripcion = excluded.descripcion;
  end loop;

  select id into section_id from public.peritaje_plantilla_secciones where plantilla_id = template_id and nombre = 'Equipamiento';
  if section_id is not null then
    for item_index in 1..coalesce(array_length(equipment, 1), 0) loop
      insert into public.peritaje_plantilla_items (seccion_id, codigo, nombre, tipo, orden)
      values (section_id, 'equipamiento_' || item_index, equipment[item_index], 'check', item_index)
      on conflict (seccion_id, codigo) do update set nombre = excluded.nombre;
    end loop;
  end if;

  select id into section_id from public.peritaje_plantilla_secciones where plantilla_id = template_id and nombre = 'Estado y desgaste';
  if section_id is not null then
    for item_index in 1..coalesce(array_length(desgaste, 1), 0) loop
      insert into public.peritaje_plantilla_items (seccion_id, codigo, nombre, tipo, orden)
      values (section_id, 'desgaste_' || item_index, desgaste[item_index], 'estado', item_index)
      on conflict (seccion_id, codigo) do update set nombre = excluded.nombre;
    end loop;
  end if;

  select id into section_id from public.peritaje_plantilla_secciones where plantilla_id = template_id and nombre = 'Datos generales';
  if section_id is not null then
    for item_index in 0..jsonb_array_length(general_items) - 1 loop
      insert into public.peritaje_plantilla_items (seccion_id, codigo, nombre, tipo, orden)
      values (section_id, general_items->item_index->>'code', general_items->item_index->>'name', general_items->item_index->>'tipo', item_index)
      on conflict (seccion_id, codigo) do update set nombre = excluded.nombre, tipo = excluded.tipo;
    end loop;
  end if;
end $$;

-- RLS: la seguridad real queda en Supabase; estas políticas habilitan la interfaz
-- para empleados activos y reservan la edición de plantillas para admin.
alter table public.peritaje_plantillas enable row level security;
alter table public.peritaje_plantilla_secciones enable row level security;
alter table public.peritaje_plantilla_items enable row level security;
alter table public.peritajes enable row level security;
alter table public.peritaje_items enable row level security;
alter table public.peritaje_paneles enable row level security;
alter table public.peritaje_reparaciones enable row level security;

drop policy if exists peritaje_plantillas_select on public.peritaje_plantillas;
create policy peritaje_plantillas_select on public.peritaje_plantillas for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_plantillas_admin on public.peritaje_plantillas;
create policy peritaje_plantillas_admin on public.peritaje_plantillas for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false));

drop policy if exists peritaje_plantilla_secciones_select on public.peritaje_plantilla_secciones;
create policy peritaje_plantilla_secciones_select on public.peritaje_plantilla_secciones for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_plantilla_secciones_admin on public.peritaje_plantilla_secciones;
create policy peritaje_plantilla_secciones_admin on public.peritaje_plantilla_secciones for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false));

drop policy if exists peritaje_plantilla_items_select on public.peritaje_plantilla_items;
create policy peritaje_plantilla_items_select on public.peritaje_plantilla_items for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_plantilla_items_admin on public.peritaje_plantilla_items;
create policy peritaje_plantilla_items_admin on public.peritaje_plantilla_items for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false));

drop policy if exists peritajes_employee_select on public.peritajes;
create policy peritajes_employee_select on public.peritajes for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritajes_operator_write on public.peritajes;
create policy peritajes_operator_write on public.peritajes for insert to authenticated
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false));
drop policy if exists peritajes_operator_update on public.peritajes;
create policy peritajes_operator_update on public.peritajes for update to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false));
drop policy if exists peritajes_admin_delete on public.peritajes;
create policy peritajes_admin_delete on public.peritajes for delete to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol = 'admin' and e.activo is distinct from false));

drop policy if exists peritaje_items_select on public.peritaje_items;
create policy peritaje_items_select on public.peritaje_items for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_items_operator_write on public.peritaje_items;
create policy peritaje_items_operator_write on public.peritaje_items for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false));
drop policy if exists peritaje_paneles_select on public.peritaje_paneles;
create policy peritaje_paneles_select on public.peritaje_paneles for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_paneles_operator_write on public.peritaje_paneles;
create policy peritaje_paneles_operator_write on public.peritaje_paneles for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false));
drop policy if exists peritaje_reparaciones_select on public.peritaje_reparaciones;
create policy peritaje_reparaciones_select on public.peritaje_reparaciones for select to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.activo is distinct from false));
drop policy if exists peritaje_reparaciones_operator_write on public.peritaje_reparaciones;
create policy peritaje_reparaciones_operator_write on public.peritaje_reparaciones for all to authenticated
using (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false))
with check (exists (select 1 from public.empleados e where e.id = auth.uid() and e.rol in ('admin','gestor') and e.activo is distinct from false));
