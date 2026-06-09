-- =====================================================
-- ALCANCE+ — Alcance Growth AI: métricas diárias de tráfego
-- Execute este SQL no Supabase: SQL Editor → New query
-- Aditiva: não altera clientes/campanhas existentes
-- =====================================================

-- Série temporal de métricas por campanha/canal/dia
create table if not exists public.metricas_diarias (
  id            uuid primary key default gen_random_uuid(),
  campanha_id   uuid references public.campanhas(id) on delete cascade,
  cliente_id    uuid references public.clientes(id) on delete set null,
  canal         text not null check (canal in ('meta','google','tiktok')),
  data          date not null,
  impressoes    int not null default 0,
  cliques       int not null default 0,
  gasto         numeric(12,2) not null default 0,
  conversoes    int not null default 0,
  ctr           numeric(8,4) not null default 0,
  cpc           numeric(12,4) not null default 0,
  cpm           numeric(12,4) not null default 0,
  frequencia    numeric(8,4) not null default 0,
  created_at    timestamptz not null default now(),
  unique (campanha_id, canal, data)
);

create index if not exists metricas_diarias_data_idx on public.metricas_diarias (data);
create index if not exists metricas_diarias_cliente_idx on public.metricas_diarias (cliente_id);

-- Métricas agregadas diárias de WhatsApp (Evolution API)
create table if not exists public.metricas_whatsapp (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references public.clientes(id) on delete set null,
  data            date not null,
  conversas       int not null default 0,
  mensagens_recebidas int not null default 0,
  mensagens_enviadas  int not null default 0,
  tempo_medio_resposta_seg int not null default 0,
  created_at      timestamptz not null default now(),
  unique (cliente_id, data)
);

create index if not exists metricas_whatsapp_data_idx on public.metricas_whatsapp (data);

-- Row Level Security (mesmo padrão das tabelas existentes)
alter table public.metricas_diarias enable row level security;
alter table public.metricas_whatsapp enable row level security;

create policy "auth_select" on public.metricas_diarias for select to authenticated using (true);
create policy "auth_insert" on public.metricas_diarias for insert to authenticated with check (true);
create policy "auth_update" on public.metricas_diarias for update to authenticated using (true);
create policy "auth_delete" on public.metricas_diarias for delete to authenticated using (true);

create policy "auth_select" on public.metricas_whatsapp for select to authenticated using (true);
create policy "auth_insert" on public.metricas_whatsapp for insert to authenticated with check (true);
create policy "auth_update" on public.metricas_whatsapp for update to authenticated using (true);
create policy "auth_delete" on public.metricas_whatsapp for delete to authenticated using (true);
