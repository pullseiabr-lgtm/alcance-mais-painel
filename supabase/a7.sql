-- ═══════════════════════════════════════════════════════════════════
-- A7 — Portal do Cliente Alcance+ (inspirado no Sults)
-- Rode este arquivo UMA vez no Supabase → SQL Editor.
-- Todo acesso passa pelas rotas /api/a7/* (service role) que isolam por cliente_id.
-- RLS ligado SEM policies = anon/authenticated não leem nada direto.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Logins dos clientes no portal
create table if not exists a7_acessos (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null,
  nome          text not null,
  email         text not null unique,
  senha_hash    text not null,
  ativo         boolean default true,
  ultimo_login  timestamptz,
  created_at    timestamptz default now()
);

-- Cronograma de postagens (com aprovação do cliente)
create table if not exists a7_posts (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid not null,
  titulo           text not null,
  legenda          text default '',
  rede             text default 'instagram',   -- instagram, facebook, tiktok, linkedin, youtube, whatsapp, outro
  formato          text default 'feed',        -- feed, reels, stories, carrossel, video, artigo
  data_publicacao  timestamptz,
  midia_url        text default '',
  status           text default 'rascunho'
    check (status in ('rascunho','aguardando_aprovacao','aprovado','ajuste','agendado','publicado')),
  comentario_cliente text default '',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Biblioteca de conteúdo e imagens
create table if not exists a7_biblioteca (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null,
  pasta       text default 'Geral',
  nome        text not null,
  tipo        text default 'outro',            -- imagem, video, documento, outro
  url         text not null,
  path        text default '',
  tamanho     bigint default 0,
  origem      text default 'agencia',          -- agencia | cliente
  created_at  timestamptz default now()
);

-- Estratégia, planejamento, briefing e relatórios
create table if not exists a7_planos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null,
  titulo      text not null,
  tipo        text default 'planejamento',     -- estrategia, planejamento, briefing, relatorio
  periodo     text default '',
  conteudo    text default '',
  status      text default 'vigente',          -- rascunho, vigente, concluido
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Campanhas e tráfego pago
create table if not exists a7_campanhas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null,
  nome        text not null,
  canal       text default 'Meta Ads',
  objetivo    text default '',
  status      text default 'planejada'
    check (status in ('planejada','ativa','pausada','encerrada')),
  orcamento   numeric(12,2) default 0,
  gasto       numeric(12,2) default 0,
  inicio      date,
  fim         date,
  impressoes  bigint default 0,
  cliques     bigint default 0,
  conversoes  bigint default 0,
  resultado   text default '',
  created_at  timestamptz default now()
);

-- Cofre de senhas (senha_enc = AES-256-GCM, criptografada no servidor)
create table if not exists a7_senhas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null,
  servico     text not null,
  url         text default '',
  usuario     text default '',
  senha_enc   text default '',
  obs         text default '',
  created_at  timestamptz default now()
);

-- Chamados (cliente ↔ agência)
create table if not exists a7_chamados (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null,
  titulo      text not null,
  descricao   text default '',
  categoria   text default 'duvida',           -- duvida, alteracao, novo_pedido, problema, financeiro
  prioridade  text default 'media',
  status      text default 'novo'
    check (status in ('novo','andamento','aguardando_cliente','resolvido')),
  mensagens   jsonb default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Comunicados (cliente_id nulo = para todos os clientes)
create table if not exists a7_comunicados (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid,
  titulo      text not null,
  corpo       text default '',
  created_at  timestamptz default now()
);

create index if not exists idx_a7_posts_cli   on a7_posts(cliente_id, data_publicacao);
create index if not exists idx_a7_bib_cli     on a7_biblioteca(cliente_id, pasta);
create index if not exists idx_a7_planos_cli  on a7_planos(cliente_id);
create index if not exists idx_a7_camp_cli    on a7_campanhas(cliente_id);
create index if not exists idx_a7_senhas_cli  on a7_senhas(cliente_id);
create index if not exists idx_a7_cham_cli    on a7_chamados(cliente_id, status);
create index if not exists idx_a7_com_cli     on a7_comunicados(cliente_id);

alter table a7_acessos     enable row level security;
alter table a7_posts       enable row level security;
alter table a7_biblioteca  enable row level security;
alter table a7_planos      enable row level security;
alter table a7_campanhas   enable row level security;
alter table a7_senhas      enable row level security;
alter table a7_chamados    enable row level security;
alter table a7_comunicados enable row level security;

-- Bucket de arquivos (público para leitura; caminhos não adivinháveis)
insert into storage.buckets (id, name, public)
values ('a7', 'a7', true)
on conflict (id) do nothing;

-- ── Plano de Ação (5W2H) — execução, validação e aprovação pelo cliente ──
create table if not exists a7_acoes (
  id                 uuid primary key default gen_random_uuid(),
  cliente_id         uuid not null,
  o_que              text not null,
  por_que            text default '',
  como               text default '',
  quem               text default '',
  prazo              date,
  custo              numeric(12,2) default 0,
  prioridade         text default 'media',
  status             text default 'execucao' check (status in ('execucao','validacao','aprovado')),
  comentario_cliente text default '',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists idx_a7_acoes_cli on a7_acoes(cliente_id, status);
alter table a7_acoes enable row level security;
