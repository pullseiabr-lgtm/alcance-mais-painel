-- ═══════════════════════════════════════════════════════════════════
-- ALCANCE+ — Schema completo do banco de dados Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- supabase.com → seu projeto → SQL Editor → cole e clique Run
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensões ─────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── CLIENTES ──────────────────────────────────────────────────────
create table if not exists clientes (
  id                  uuid primary key default uuid_generate_v4(),

  -- Identificação
  nome                text not null,
  nome_fantasia       text default '',
  responsavel         text default '',
  telefone            text default '',
  whatsapp            text default '',
  email               text default '',
  email_financeiro    text default '',
  endereco            text default '',
  cidade              text default '',
  cnpj                text default '',
  segmento            text default '',
  concorrentes        text default '',
  instagram           text default '',
  status              text default 'Ativo' check (status in ('Ativo','Onboarding','Pausado','Inativo')),
  mensalidade         numeric(10,2) default 0,
  desde               date,
  servicos            text[] default '{}',

  -- Objetivos
  objetivos           text[] default '{}',
  meta_curto          text default '',
  meta_medio          text default '',
  meta_longo          text default '',

  -- Branding
  estilo_visual       text default '',
  ref_instagram       text default '',
  cores               text default '',
  fontes              text default '',
  tom_voz             text default '',

  -- Acesso
  meta_ads_id         text default '',
  google_ads_id       text default '',
  google_analytics    text default '',
  site                text default '',
  senha_instagram     text default '',

  -- Financeiro
  dia_vencimento      int default 10,
  forma_pagamento     text default '',
  banco               text default '',
  observacoes_fin     text default '',

  -- Controle
  demandas            jsonb default '[]',
  observacoes         text default '',

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── LEADS / PIPELINE ──────────────────────────────────────────────
create table if not exists leads (
  id               uuid primary key default uuid_generate_v4(),
  empresa          text not null,
  contato          text default '',
  valor            numeric(10,2) default 0,
  etapa            text default 'prospeccao'
                   check (etapa in ('prospeccao','qualificacao','proposta','negociacao','fechado','perdido')),
  origem           text default '',
  probabilidade    int default 50,
  proximo_contato  date,
  observacoes      text default '',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── PROJETOS ──────────────────────────────────────────────────────
create table if not exists projetos (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text not null,
  cliente_id   uuid references clientes(id) on delete set null,
  responsavel  text default '',
  status       text default 'planejamento'
               check (status in ('planejamento','em_andamento','revisao','concluido','pausado')),
  prioridade   text default 'media'
               check (prioridade in ('alta','media','baixa')),
  prazo        date,
  progresso    int default 0 check (progresso between 0 and 100),
  descricao    text default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── CAMPANHAS ─────────────────────────────────────────────────────
create table if not exists campanhas (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  cliente_id   uuid references clientes(id) on delete set null,
  canal        text default '',
  status       text default 'planejada'
               check (status in ('planejada','ativa','pausada','encerrada')),
  orcamento    numeric(10,2) default 0,
  gasto        numeric(10,2) default 0,
  inicio       date,
  fim          date,
  impressoes   bigint default 0,
  cliques      bigint default 0,
  conversoes   bigint default 0,
  objetivo     text default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── TRANSAÇÕES FINANCEIRAS ────────────────────────────────────────
create table if not exists transacoes (
  id           uuid primary key default uuid_generate_v4(),
  descricao    text not null,
  tipo         text not null check (tipo in ('receita','despesa')),
  categoria    text default '',
  valor        numeric(10,2) not null,
  data         date not null default current_date,
  cliente_id   uuid references clientes(id) on delete set null,
  status       text default 'pendente'
               check (status in ('pago','pendente','atrasado')),
  created_at   timestamptz default now()
);

-- ── EQUIPE ────────────────────────────────────────────────────────
create table if not exists equipe (
  id               uuid primary key default uuid_generate_v4(),
  nome             text not null,
  cargo            text default '',
  email            text default '',
  especializacao   text[] default '{}',
  status           text default 'ativo'
                   check (status in ('ativo','ferias','afastado')),
  carga_horaria    int default 40,
  nivel            text default 'pleno'
                   check (nivel in ('senior','pleno','junior')),
  created_at       timestamptz default now()
);

-- ── PROPOSTAS ─────────────────────────────────────────────────────
create table if not exists propostas (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text not null,
  cliente_id   uuid references clientes(id) on delete set null,
  cliente_nome text default '',
  valor        numeric(10,2) default 0,
  status       text default 'rascunho'
               check (status in ('rascunho','aguardando','em_analise','aprovada','recusada')),
  criado       date default current_date,
  validade     date,
  servicos     text[] default '{}',
  desconto     numeric(5,2) default 0,
  observacoes  text default '',
  created_at   timestamptz default now()
);

-- ── CALENDÁRIO DE CONTEÚDO ────────────────────────────────────────
create table if not exists calendario (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text not null,
  cliente_id   uuid references clientes(id) on delete set null,
  canal        text default '',
  data         date not null,
  hora         time default '09:00',
  status       text default 'em_criacao'
               check (status in ('em_criacao','revisao','aprovado','agendado','publicado')),
  formato      text default '',
  legenda      text default '',
  created_at   timestamptz default now()
);

-- ── RLS — Row Level Security (deixa público por enquanto) ─────────
-- Você pode ativar autenticação depois para multi-usuário

alter table clientes    enable row level security;
alter table leads       enable row level security;
alter table projetos    enable row level security;
alter table campanhas   enable row level security;
alter table transacoes  enable row level security;
alter table equipe      enable row level security;
alter table propostas   enable row level security;
alter table calendario  enable row level security;

-- Políticas: acesso total (ajuste quando adicionar autenticação)
create policy "acesso_total" on clientes    for all using (true) with check (true);
create policy "acesso_total" on leads       for all using (true) with check (true);
create policy "acesso_total" on projetos    for all using (true) with check (true);
create policy "acesso_total" on campanhas   for all using (true) with check (true);
create policy "acesso_total" on transacoes  for all using (true) with check (true);
create policy "acesso_total" on equipe      for all using (true) with check (true);
create policy "acesso_total" on propostas   for all using (true) with check (true);
create policy "acesso_total" on calendario  for all using (true) with check (true);

-- ── Função para atualizar updated_at automaticamente ──────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_clientes_updated_at
  before update on clientes
  for each row execute function set_updated_at();

create trigger tr_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

create trigger tr_projetos_updated_at
  before update on projetos
  for each row execute function set_updated_at();

create trigger tr_campanhas_updated_at
  before update on campanhas
  for each row execute function set_updated_at();

-- ── Dados iniciais de exemplo ─────────────────────────────────────
insert into equipe (nome, cargo, email, especializacao, nivel, carga_horaria) values
  ('Ana Lima',    'Social Media',        'ana@alcance.com',      '{Instagram,TikTok,Reels}',           'pleno',  40),
  ('Carlos Dev',  'Developer',           'carlos@alcance.com',   '{Next.js,Supabase,APIs}',            'senior', 40),
  ('Julia Copy',  'Copywriter',          'julia@alcance.com',    '{Copy,Email,Legendas}',              'pleno',  40),
  ('Pedro Ads',   'Gestor de Tráfego',   'pedro@alcance.com',    '{"Meta Ads","Google Ads",TikTok}',   'senior', 40);

-- ══════════════════════════════════════════════════════════════════
-- Schema criado com sucesso! Volte para o .env.local e
-- adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ══════════════════════════════════════════════════════════════════
