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
--           campanhas,calendario,financeiro,equipe,relatorios,agente
-- criativo: dashboard,campanhas,calendario,criador-arte,
--           manus-imagens,editor,figueiredo,agente,ifood
-- cliente:  dashboard,campanhas,relatorios
-- viewer:   dashboard
