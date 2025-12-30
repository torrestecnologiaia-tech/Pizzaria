-- Tabelas para o Cardápio Hott Rossi

-- 1. Tabela de Produtos
create table public.products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  "imageUrl" text,
  "isPromo" boolean default false,
  "isBestSeller" boolean default false,
  "promoText" text,
  addons text[],
  created_at timestamp with time zone default now()
);

-- 2. Tabela de Adicionais
create table public.addons (
  id text primary key,
  name text not null,
  price numeric not null,
  created_at timestamp with time zone default now()
);

-- 3. Tabela de Configurações
create table public.settings (
  id int primary key default 1,
  "shopName" text not null,
  "logoUrl" text,
  "promoBanner" text,
  "whatsappNumber" text,
  created_at timestamp with time zone default now(),
  constraint only_one_row check (id = 1)
);

-- Habilitar RLS (Segurança)
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.settings enable row level security;

-- Políticas de Acesso Público (Leitura)
create policy "Leitura pública" on public.products for select using (true);
create policy "Leitura pública" on public.addons for select using (true);
create policy "Leitura pública" on public.settings for select using (true);

-- Políticas de Escrita (Para facilitar, liberado para todos por enquanto. Recomenda-se usar Autenticação depois)
create policy "Escrita liberada" on public.products for all using (true) with check (true);
create policy "Escrita liberada" on public.addons for all using (true) with check (true);
create policy "Escrita liberada" on public.settings for all using (true) with check (true);
