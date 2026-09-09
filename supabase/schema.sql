-- Diário de Estudos: schema para o Supabase
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new).
--
-- Este script apaga e recria as tabelas do app (seguro enquanto elas
-- ainda estiverem vazias). Se você já tem registros importantes, faça
-- backup antes de rodar de novo.

create extension if not exists "pgcrypto";

drop table if exists cronograma_blocos cascade;
drop table if exists registros cascade;
drop table if exists materias cascade;

-- Matérias: as disciplinas/assuntos que você define (ex: Matemática, Direito Penal).
create table materias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cor text not null default '#2a78d6',
  created_at timestamptz not null default now()
);

-- Registros: sessões de estudo já realizadas (o histórico).
create table registros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  materia_id uuid references materias(id) on delete set null,
  horas numeric not null check (horas > 0),
  data date not null,
  observacoes text,
  origem_tipo text check (origem_tipo in ('cronograma', 'sessao')),
  origem_id uuid,
  created_at timestamptz not null default now()
);

-- Cronograma: horários fixos que se repetem toda semana (ex: Seg 19h Matemática).
create table cronograma_blocos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  materia_id uuid not null references materias(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6), -- 0 = domingo ... 6 = sábado
  hora_inicio time not null,
  duracao_horas numeric not null check (duracao_horas > 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index registros_data_idx on registros (data);
create index registros_materia_idx on registros (materia_id);
create index cronograma_blocos_dia_idx on cronograma_blocos (dia_semana);

-- RLS: este app não tem tela de login (por escolha) e só é acessado pelo
-- servidor Next.js com a chave "anon". As políticas abaixo liberam o acesso
-- para essa chave de propósito. Não exponha SUPABASE_URL/SUPABASE_ANON_KEY
-- no navegador nem deixe o app publicamente acessível sem outra proteção
-- (ex: senha no proxy/hosting), já que qualquer um com a chave leria/escreveria
-- todos os dados.
alter table materias enable row level security;
alter table registros enable row level security;
alter table cronograma_blocos enable row level security;

create policy "acesso total anon" on materias for all to anon using (true) with check (true);
create policy "acesso total anon" on registros for all to anon using (true) with check (true);
create policy "acesso total anon" on cronograma_blocos for all to anon using (true) with check (true);
