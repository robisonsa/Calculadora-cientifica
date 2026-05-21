-- GPS - Gerenciador de Preparação para o SAEB/SAESE
-- Schema inicial

create extension if not exists "uuid-ossp";

-- Turmas (criada antes de profiles para FK)
create table turmas (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  ano_letivo int not null default 2025,
  escola text default 'CEGLB',
  professor_id uuid,
  created_at timestamptz default now()
);

-- Profiles (estende auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nome_completo text not null,
  role text not null check (role in ('estudante', 'professor', 'gestor')),
  turma_id uuid references turmas(id),
  escola text default 'CEGLB',
  created_at timestamptz default now()
);

-- FK professor_id em turmas
alter table turmas
  add constraint turmas_professor_id_fkey
  foreign key (professor_id) references profiles(id);

-- Habilidades (Matriz de Referência SAEB)
create table habilidades (
  id uuid default uuid_generate_v4() primary key,
  codigo text unique not null,
  descricao text not null,
  disciplina text not null check (disciplina in ('lp', 'matematica')),
  eixo text not null,
  nivel_escala_saeb int not null check (nivel_escala_saeb between 1 and 9)
);

-- Questões
create table questoes (
  id uuid default uuid_generate_v4() primary key,
  habilidade_id uuid references habilidades(id) not null,
  enunciado text not null,
  alternativa_a text not null,
  alternativa_b text not null,
  alternativa_c text not null,
  alternativa_d text not null,
  gabarito char(1) not null check (gabarito in ('a', 'b', 'c', 'd')),
  nivel_dificuldade int not null check (nivel_dificuldade between 1 and 3) default 1,
  fonte text default 'elaborada' check (fonte in ('SAEB', 'SAESE', 'elaborada'))
);

-- Diagnósticos
create table diagnosticos (
  id uuid default uuid_generate_v4() primary key,
  estudante_id uuid references profiles(id) not null,
  turma_id uuid references turmas(id),
  disciplina text not null check (disciplina in ('lp', 'matematica')),
  data_aplicacao timestamptz default now(),
  concluido boolean default false,
  nivel_identificado int check (nivel_identificado between 1 and 9)
);

-- Respostas do diagnóstico
create table respostas_diagnostico (
  id uuid default uuid_generate_v4() primary key,
  diagnostico_id uuid references diagnosticos(id) on delete cascade not null,
  questao_id uuid references questoes(id) not null,
  resposta_estudante char(1) check (resposta_estudante in ('a', 'b', 'c', 'd')),
  correta boolean not null default false,
  habilidade_id uuid references habilidades(id) not null
);

-- Trilhas personalizadas
create table trilhas (
  id uuid default uuid_generate_v4() primary key,
  estudante_id uuid references profiles(id) not null,
  disciplina text not null check (disciplina in ('lp', 'matematica')),
  criada_em timestamptz default now(),
  concluida boolean default false,
  xp_total_possivel int default 0,
  xp_acumulado int default 0
);

-- Habilidades por trilha
create table trilha_habilidades (
  id uuid default uuid_generate_v4() primary key,
  trilha_id uuid references trilhas(id) on delete cascade not null,
  habilidade_id uuid references habilidades(id) not null,
  status text not null default 'nao_iniciada' check (status in ('nao_iniciada', 'em_andamento', 'concluida')),
  tentativas int default 0,
  acertos int default 0,
  xp_conquistado int default 0
);

-- Insígnias
create table insignias (
  id uuid default uuid_generate_v4() primary key,
  nome text unique not null,
  descricao text not null,
  icone_emoji text not null,
  criterio text not null,
  xp_bonus int default 0
);

-- Insígnias do estudante
create table estudante_insignias (
  id uuid default uuid_generate_v4() primary key,
  estudante_id uuid references profiles(id) not null,
  insignia_id uuid references insignias(id) not null,
  conquistada_em timestamptz default now(),
  unique(estudante_id, insignia_id)
);

-- Sequências didáticas
create table sequencias_didaticas (
  id uuid default uuid_generate_v4() primary key,
  habilidade_id uuid references habilidades(id) not null,
  titulo text not null,
  objetivo text not null,
  materiais text,
  etapas text not null,
  tempo_estimado_minutos int default 50,
  ano_escolar text default 'EM'
);

-- Trigger para criar profile após registro
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, nome_completo, role, escola)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'estudante'),
    coalesce(new.raw_user_meta_data->>'escola', 'CEGLB')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
