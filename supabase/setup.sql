-- Crea la tabla de órdenes
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_neighborhood text not null,
  location_url text,
  total_amount numeric not null,
  status text not null default 'pending',
  payment_method text not null
);

-- Crea la tabla de los items de la orden
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null,
  size text not null,
  price_at_time numeric not null
);

-- Políticas de Seguridad RLS (Row Level Security)
-- (Permitimos que cualquiera inserte una orden si no hay auth implementado todavía)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Permitir inserción anónima de orders" on public.orders for insert with check (true);
create policy "Permitir inserción anónima de order_items" on public.order_items for insert with check (true);
