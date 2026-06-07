-- =====================================================
-- ALCANCE+ — Alcance Growth AI: alertas de performance
-- Execute este SQL no Supabase: SQL Editor → New query
-- Aditiva: não altera tabelas existentes
-- =====================================================

create table if not exists public.alertas_trafego (
  id            uuid primary key default gen_random_uuid(),
  campanha_id   uuid references public.campanhas(id) on delete cascade,
  cliente_id    uuid references public.clientes(id) on delete set null,
  canal         text not null check (canal in ('meta','google','tiktok')),
  tipo          text not null check (tipo in ('cpc_alto','ctr_baixo','frequencia_alta','sem_conversao')),
  severidade    text not null default 'atencao' check (severidade in ('atencao','critico')),
  mensagem      text not null default '',
  valor         numeric(12,4) not null default 0,
  limite        numeric(12,4) not null default 0,
  data          date not null,
  resolvido     boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (campanha_id, tipo, data)
);

create index if not exists alertas_trafego_data_idx on public.alertas_trafego (data);
create index if not exists alertas_trafego_resolvido_idx on public.alertas_trafego (resolvido);

alter table public.alertas_trafego enable row level security;

create policy "auth_select" on public.alertas_trafego for select to authenticated using (true);
create policy "auth_insert" on public.alertas_trafego for insert to authenticated with check (true);
create policy "auth_update" on public.alertas_trafego for update to authenticated using (true);
create policy "auth_delete" on public.alertas_trafego for delete to authenticated using (true);
