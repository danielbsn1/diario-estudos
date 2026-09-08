-- Diário de Estudos: schema para o Supabase
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new).

create extension if not exists "pgcrypto";

-- Registros: sessões de estudo já realizadas (o histórico).
create table if not exists registros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  horas numeric not null check (horas > 0),
  data date not null,
  observacoes text,
  origem_tipo text check (origem_tipo in ('cronograma', 'sessao')),
  origem_id uuid,
  created_at timestamptz not null default now()
);

-- Cronograma: horários fixos que se repetem toda semana (ex: Seg 19h Matemática).
create table if not exists cronograma_blocos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  dia_semana int not null check (dia_semana between 0 and 6), -- 0 = domingo ... 6 = sábado
  hora_inicio time not null,
  duracao_horas numeric not null check (duracao_horas > 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Sessões planejadas: compromissos de estudo pontuais, em uma data específica.
create table if not exists sessoes_planejadas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  data date not null,
  hora_inicio time,
  duracao_horas numeric not null check (duracao_horas > 0),
  concluida boolean not null default false,
  registro_id uuid references registros(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists registros_data_idx on registros (data);
create index if not exists sessoes_planejadas_data_idx on sessoes_planejadas (data);
create index if not exists cronograma_blocos_dia_idx on cronograma_blocos (dia_semana);

-- RLS: este app não tem tela de login (por escolha) e só é acessado pelo
-- servidor Next.js com a chave "anon". As políticas abaixo liberam o acesso
-- para essa chave de propósito. Não exponha SUPABASE_URL/SUPABASE_ANON_KEY
-- no navegador nem deixe o app publicamente acessível sem outra proteção
-- (ex: senha no proxy/hosting), já que qualquer um com a chave leria/escreveria
-- todos os dados.
alter table registros enable row level security;
alter table cronograma_blocos enable row level security;
alter table sessoes_planejadas enable row level security;

create policy "acesso total anon" on registros for all to anon using (true) with check (true);
create policy "acesso total anon" on cronograma_blocos for all to anon using (true) with check (true);
create policy "acesso total anon" on sessoes_planejadas for all to anon using (true) with check (true);
