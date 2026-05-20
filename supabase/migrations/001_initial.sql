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
