-- ════════════════════════════════════════════════════════════════
-- Alcance+ — Migration 004 — Fase 1: Expansão Profissional
-- Novas tabelas: tarefas, brand_kits, contratos, briefings,
--                reunioes, nps_respostas, aprovacoes_pecas,
--                assets, pautas, timesheet, ferias, configuracoes
-- ════════════════════════════════════════════════════════════════

-- ── Tarefas ──────────────────────────────────────────────────────
create table if not exists tarefas (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  descricao     text not null default '',
  responsavel   text not null default '',
  responsavel_id uuid references equipe(id) on delete set null,
  projeto_id    uuid references projetos(id) on delete set null,
  cliente_id    uuid references clientes(id) on delete set null,
  cliente_nome  text not null default '',
  prioridade    text not null default 'media'
                  check (prioridade in ('urgente','alta','media','baixa')),
  status        text not null default 'a_fazer'
                  check (status in ('a_fazer','em_andamento','revisao','concluido')),
  prazo         date,
  tags          text[] not null default '{}',
  checklist     jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Brand Kits ───────────────────────────────────────────────────
create table if not exists brand_kits (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete cascade,
  nome            text not null,
  logo_url        text not null default '',
  cor_primaria    text not null default '#000000',
  cor_secundaria  text not null default '#ffffff',
  cor_acento      text not null default '#cccccc',
  fontes          text[] not null default '{}',
  tagline         text not null default '',
  segmento        text not null default '',
  site            text not null default '',
  created_at      timestamptz not null default now()
);

-- ── Contratos ────────────────────────────────────────────────────
create table if not exists contratos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  tipo            text not null default 'mensalidade'
                    check (tipo in ('mensalidade','projeto','avulso','retainer')),
  valor_mensal    numeric(12,2) not null default 0,
  dia_cobranca    int not null default 5 check (dia_cobranca between 1 and 31),
  inicio          date not null default current_date,
  vencimento      date,
  reajuste_anual  numeric(5,2) not null default 0,
  status          text not null default 'ativo'
                    check (status in ('ativo','pausado','encerrado','inadimplente')),
  servicos        text[] not null default '{}',
  observacoes     text not null default '',
  arquivo_url     text not null default '',
  created_at      timestamptz not null default now()
);

-- ── Briefings ────────────────────────────────────────────────────
create table if not exists briefings (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  projeto_id      uuid references projetos(id) on delete set null,
  tipo            text not null default 'campanha'
                    check (tipo in ('campanha','conteudo','criacao','evento','outro')),
  titulo          text not null,
  objetivos       text not null default '',
  publico_alvo    text not null default '',
  mensagem_chave  text not null default '',
  referencias     text not null default '',
  prazo           date,
  orcamento       numeric(12,2),
  status          text not null default 'aberto'
                    check (status in ('aberto','em_andamento','concluido','cancelado')),
  criado_por      text not null default '',
  created_at      timestamptz not null default now()
);

-- ── Reuniões & Atas ──────────────────────────────────────────────
create table if not exists reunioes (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  titulo          text not null,
  data            timestamptz not null,
  participantes   text[] not null default '{}',
  pauta           text not null default '',
  ata             text not null default '',
  proximos_passos text not null default '',
  responsavel     text not null default '',
  tipo            text not null default 'interna'
                    check (tipo in ('interna','cliente','apresentacao','feedback')),
  created_at      timestamptz not null default now()
);

-- ── NPS / Satisfação ─────────────────────────────────────────────
create table if not exists nps_respostas (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  nota            int not null check (nota between 0 and 10),
  comentario      text not null default '',
  categoria       text not null default 'geral'
                    check (categoria in ('geral','atendimento','resultado','comunicacao')),
  respondido_em   date not null default current_date,
  created_at      timestamptz not null default now()
);

-- ── Aprovação de Peças ───────────────────────────────────────────
create table if not exists aprovacoes_pecas (
  id              uuid primary key default gen_random_uuid(),
  projeto_id      uuid references projetos(id) on delete set null,
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  titulo          text not null,
  descricao       text not null default '',
  arquivo_url     text not null default '',
  tipo            text not null default 'imagem'
                    check (tipo in ('imagem','video','copy','layout','outro')),
  status          text not null default 'aguardando'
                    check (status in ('aguardando','aprovado','reprovado','em_revisao')),
  feedback        text not null default '',
  aprovado_por    text not null default '',
  criado_por      text not null default '',
  created_at      timestamptz not null default now()
);

-- ── Assets por Cliente ───────────────────────────────────────────
create table if not exists assets (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete cascade,
  nome            text not null,
  tipo            text not null default 'imagem'
                    check (tipo in ('imagem','video','logo','font','documento','outro')),
  url             text not null default '',
  tamanho_kb      int not null default 0,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- ── Pautas & Roteiros ────────────────────────────────────────────
create table if not exists pautas (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  titulo          text not null,
  formato         text not null default 'reels'
                    check (formato in ('reels','stories','feed','tiktok','youtube','blog','outro')),
  canal           text not null default '',
  roteiro         text not null default '',
  data_entrega    date,
  responsavel     text not null default '',
  status          text not null default 'em_criacao'
                    check (status in ('em_criacao','revisao','aprovado','gravado','publicado')),
  created_at      timestamptz not null default now()
);

-- ── Timesheet ────────────────────────────────────────────────────
create table if not exists timesheet (
  id              uuid primary key default gen_random_uuid(),
  membro_id       uuid references equipe(id) on delete cascade,
  membro_nome     text not null default '',
  projeto_id      uuid references projetos(id) on delete set null,
  cliente_id      uuid references clientes(id) on delete set null,
  cliente_nome    text not null default '',
  data            date not null default current_date,
  horas           numeric(4,2) not null default 0,
  descricao       text not null default '',
  aprovado        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── Férias & Ausências ───────────────────────────────────────────
create table if not exists ferias (
  id              uuid primary key default gen_random_uuid(),
  membro_id       uuid references equipe(id) on delete cascade,
  membro_nome     text not null default '',
  inicio          date not null,
  fim             date not null,
  tipo            text not null default 'ferias'
                    check (tipo in ('ferias','licenca','afastamento','folga')),
  status          text not null default 'solicitado'
                    check (status in ('solicitado','aprovado','negado')),
  aprovado_por    text not null default '',
  observacoes     text not null default '',
  created_at      timestamptz not null default now()
);

-- ── Configurações da Agência ─────────────────────────────────────
create table if not exists configuracoes (
  chave           text primary key,
  valor           text not null default '',
  descricao       text not null default '',
  updated_at      timestamptz not null default now()
);

insert into configuracoes (chave, valor, descricao) values
  ('agencia_nome',    'Alcance+',                     'Nome da agência'),
  ('agencia_cnpj',    '',                             'CNPJ da agência'),
  ('agencia_email',   'contato@alcanceplus.com.br',   'E-mail principal'),
  ('agencia_site',    'https://alcanceplus.com.br',   'Site da agência'),
  ('nps_dias_ciclo',  '90',                           'Dias entre pesquisas NPS'),
  ('mrr_dia_alerta',  '5',                            'Dias antes do vencimento para alertar')
on conflict (chave) do nothing;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security — todas as novas tabelas
-- ════════════════════════════════════════════════════════════════
alter table tarefas           enable row level security;
alter table brand_kits        enable row level security;
alter table contratos         enable row level security;
alter table briefings         enable row level security;
alter table reunioes          enable row level security;
alter table nps_respostas     enable row level security;
alter table aprovacoes_pecas  enable row level security;
alter table assets            enable row level security;
alter table pautas            enable row level security;
alter table timesheet         enable row level security;
alter table ferias            enable row level security;
alter table configuracoes     enable row level security;

-- Políticas uniformes: autenticado pode tudo
do $$
declare t text;
begin
  foreach t in array array[
    'tarefas','brand_kits','contratos','briefings','reunioes',
    'nps_respostas','aprovacoes_pecas','assets','pautas',
    'timesheet','ferias','configuracoes'
  ] loop
    execute format('create policy "auth_select" on %I for select to authenticated using (true)', t);
    execute format('create policy "auth_insert" on %I for insert to authenticated with check (true)', t);
    execute format('create policy "auth_update" on %I for update to authenticated using (true)', t);
    execute format('create policy "auth_delete" on %I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- ── Índices úteis ────────────────────────────────────────────────
create index if not exists idx_tarefas_status        on tarefas(status);
create index if not exists idx_tarefas_responsavel   on tarefas(responsavel_id);
create index if not exists idx_tarefas_projeto       on tarefas(projeto_id);
create index if not exists idx_contratos_cliente     on contratos(cliente_id);
create index if not exists idx_contratos_status      on contratos(status);
create index if not exists idx_briefings_cliente     on briefings(cliente_id);
create index if not exists idx_reunioes_cliente      on reunioes(cliente_id);
create index if not exists idx_nps_cliente           on nps_respostas(cliente_id);
create index if not exists idx_aprovacoes_projeto    on aprovacoes_pecas(projeto_id);
create index if not exists idx_timesheet_membro      on timesheet(membro_id);
create index if not exists idx_timesheet_data        on timesheet(data);
create index if not exists idx_ferias_membro         on ferias(membro_id);

-- ── Trigger updated_at para tarefas ──────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger tarefas_updated_at
  before update on tarefas
  for each row execute function set_updated_at();
