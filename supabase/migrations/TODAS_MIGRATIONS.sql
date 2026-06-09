-- ================================================================
-- 001_initial.sql
-- ================================================================
-- ════════════════════════════════════════
-- Alcance+ — Migration Inicial
-- ════════════════════════════════════════

-- ── Clientes ──
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text not null default '',
  email text not null default '',
  telefone text not null default '',
  setor text not null default '',
  status text not null default 'ativo' check (status in ('ativo','onboarding','pausado','inativo')),
  mensalidade numeric(12,2) not null default 0,
  desde text not null default '',
  servicos text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Projetos ──
create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_nome text not null default '',
  responsavel text not null default '',
  status text not null default 'planejamento' check (status in ('planejamento','em_andamento','revisao','concluido','pausado')),
  prioridade text not null default 'media' check (prioridade in ('alta','media','baixa')),
  prazo date,
  progresso int not null default 0 check (progresso between 0 and 100),
  descricao text not null default '',
  created_at timestamptz not null default now()
);

-- ── Campanhas ──
create table if not exists campanhas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_nome text not null default '',
  canal text not null default '',
  status text not null default 'planejada' check (status in ('planejada','ativa','pausada','encerrada')),
  orcamento numeric(12,2) not null default 0,
  gasto numeric(12,2) not null default 0,
  inicio date,
  fim date,
  impressoes int not null default 0,
  cliques int not null default 0,
  conversoes int not null default 0,
  objetivo text not null default '',
  created_at timestamptz not null default now()
);

-- ── Transações ──
create table if not exists transacoes (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  tipo text not null check (tipo in ('receita','despesa')),
  categoria text not null default '',
  valor numeric(12,2) not null default 0,
  data date not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_nome text not null default '',
  status text not null default 'pendente' check (status in ('pago','pendente','atrasado')),
  created_at timestamptz not null default now()
);

-- ── Equipe ──
create table if not exists equipe (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null default '',
  email text not null default '',
  especializacao text[] not null default '{}',
  status text not null default 'ativo' check (status in ('ativo','ferias','afastado')),
  carga_horaria int not null default 40,
  nivel text not null default 'pleno' check (nivel in ('senior','pleno','junior')),
  created_at timestamptz not null default now()
);

-- ── Pipeline (Leads) ──
create table if not exists pipeline (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  contato text not null default '',
  valor numeric(12,2) not null default 0,
  etapa text not null default 'prospeccao' check (etapa in ('prospeccao','qualificacao','proposta','negociacao','fechado','perdido')),
  origem text not null default '',
  probabilidade int not null default 30 check (probabilidade between 0 and 100),
  proximo_contato date,
  observacoes text not null default '',
  created_at timestamptz not null default now()
);

-- ── Propostas ──
create table if not exists propostas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_nome text not null default '',
  valor numeric(12,2) not null default 0,
  status text not null default 'rascunho' check (status in ('rascunho','aguardando','em_analise','aprovada','recusada')),
  criado date not null default current_date,
  validade date,
  servicos text[] not null default '{}',
  desconto numeric(5,2) not null default 0,
  observacoes text not null default '',
  created_at timestamptz not null default now()
);

-- ── Calendário de Conteúdo ──
create table if not exists calendario (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  cliente_nome text not null default '',
  canal text not null default '',
  data date not null,
  hora time not null default '10:00',
  status text not null default 'em_criacao' check (status in ('em_criacao','revisao','aprovado','agendado','publicado')),
  formato text not null default 'Imagem',
  legenda text not null default '',
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════
alter table clientes enable row level security;
alter table projetos enable row level security;
alter table campanhas enable row level security;
alter table transacoes enable row level security;
alter table equipe enable row level security;
alter table pipeline enable row level security;
alter table propostas enable row level security;
alter table calendario enable row level security;

-- Políticas: apenas usuários autenticados
create policy "auth_select" on clientes for select to authenticated using (true);
create policy "auth_insert" on clientes for insert to authenticated with check (true);
create policy "auth_update" on clientes for update to authenticated using (true);
create policy "auth_delete" on clientes for delete to authenticated using (true);

create policy "auth_select" on projetos for select to authenticated using (true);
create policy "auth_insert" on projetos for insert to authenticated with check (true);
create policy "auth_update" on projetos for update to authenticated using (true);
create policy "auth_delete" on projetos for delete to authenticated using (true);

create policy "auth_select" on campanhas for select to authenticated using (true);
create policy "auth_insert" on campanhas for insert to authenticated with check (true);
create policy "auth_update" on campanhas for update to authenticated using (true);
create policy "auth_delete" on campanhas for delete to authenticated using (true);

create policy "auth_select" on transacoes for select to authenticated using (true);
create policy "auth_insert" on transacoes for insert to authenticated with check (true);
create policy "auth_update" on transacoes for update to authenticated using (true);
create policy "auth_delete" on transacoes for delete to authenticated using (true);

create policy "auth_select" on equipe for select to authenticated using (true);
create policy "auth_insert" on equipe for insert to authenticated with check (true);
create policy "auth_update" on equipe for update to authenticated using (true);
create policy "auth_delete" on equipe for delete to authenticated using (true);

create policy "auth_select" on pipeline for select to authenticated using (true);
create policy "auth_insert" on pipeline for insert to authenticated with check (true);
create policy "auth_update" on pipeline for update to authenticated using (true);
create policy "auth_delete" on pipeline for delete to authenticated using (true);

create policy "auth_select" on propostas for select to authenticated using (true);
create policy "auth_insert" on propostas for insert to authenticated with check (true);
create policy "auth_update" on propostas for update to authenticated using (true);
create policy "auth_delete" on propostas for delete to authenticated using (true);

create policy "auth_select" on calendario for select to authenticated using (true);
create policy "auth_insert" on calendario for insert to authenticated with check (true);
create policy "auth_update" on calendario for update to authenticated using (true);
create policy "auth_delete" on calendario for delete to authenticated using (true);

-- ════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════
insert into equipe (nome, cargo, email, especializacao, nivel, carga_horaria) values
  ('Marina Costa', 'Gerente de Conteúdo', 'marina@alcanceplus.com.br', array['Redes Sociais','Copywriting','Branding'], 'senior', 40),
  ('Carlos Pereira', 'Especialista em Tráfego', 'carlos@alcanceplus.com.br', array['Google Ads','Meta Ads','Analytics'], 'senior', 40),
  ('Ana Lima', 'Designer', 'ana@alcanceplus.com.br', array['UI/UX','Motion','Identidade Visual'], 'pleno', 40),
  ('João Silva', 'Analista de SEO', 'joao@alcanceplus.com.br', array['SEO','SEM','Blog'], 'pleno', 32),
  ('Fernanda Ramos', 'Account Manager', 'fernanda@alcanceplus.com.br', array['Atendimento','Projetos','Relatórios'], 'senior', 40)
on conflict do nothing;


-- ================================================================
-- 001_usuarios.sql
-- ================================================================
-- =====================================================
-- ALCANCE+ — Sistema de Usuários e Permissões
-- Execute este SQL no Supabase: SQL Editor → New query
-- =====================================================

-- Tabela de perfis (vinculada ao auth.users)
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  nome          text not null default '',
  email         text not null default '',
  cargo         text not null default '',
  role          text not null default 'viewer'
                  check (role in ('admin','gestor','criativo','cliente','viewer')),
  permissoes    text[] not null default array[]::text[],
  ativo         boolean not null default true,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Trigger para atualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- Trigger para criar profile automaticamente ao registrar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

-- Admins têm acesso total
create policy "admin_all" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Usuário vê seu próprio perfil
create policy "own_profile_select" on public.profiles
  for select using (auth.uid() = id);

-- =====================================================
-- Permissões padrão por role
-- Use como referência ao criar usuários
-- =====================================================
-- admin:    todas as páginas
-- gestor:   dashboard,pipeline,clientes,propostas,projetos,
--           campanhas,trafego,calendario,financeiro,equipe,relatorios,agente
-- criativo: dashboard,campanhas,calendario,criador-arte,
--           manus-imagens,editor,figueiredo,agente,ifood
-- cliente:  dashboard,campanhas,trafego,relatorios
-- viewer:   dashboard


-- ================================================================
-- 002_metricas_trafego.sql
-- ================================================================
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


-- ================================================================
-- 003_alertas_trafego.sql
-- ================================================================
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


-- ================================================================
-- 004_fase1_expansao.sql
-- ================================================================
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


