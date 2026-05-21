-- Row Level Security Policies

-- Habilitar RLS em todas as tabelas
alter table profiles enable row level security;
alter table turmas enable row level security;
alter table habilidades enable row level security;
alter table questoes enable row level security;
alter table diagnosticos enable row level security;
alter table respostas_diagnostico enable row level security;
alter table trilhas enable row level security;
alter table trilha_habilidades enable row level security;
alter table insignias enable row level security;
alter table estudante_insignias enable row level security;
alter table sequencias_didaticas enable row level security;

-- Helper functions
create or replace function get_user_role()
returns text language sql security definer as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function get_user_turma()
returns uuid language sql security definer as $$
  select turma_id from profiles where id = auth.uid();
$$;

-- Profiles
create policy "Usuários veem próprio perfil" on profiles
  for select using (auth.uid() = id);

create policy "Professores veem perfis da sua turma" on profiles
  for select using (
    get_user_role() = 'professor' and
    turma_id in (select id from turmas where professor_id = auth.uid())
  );

create policy "Gestores veem todos os perfis" on profiles
  for select using (get_user_role() = 'gestor');

create policy "Usuários atualizam próprio perfil" on profiles
  for update using (auth.uid() = id);

-- Turmas
create policy "Todos autenticados veem turmas" on turmas
  for select using (auth.role() = 'authenticated');

-- Habilidades
create policy "Todos autenticados veem habilidades" on habilidades
  for select using (auth.role() = 'authenticated');

-- Questões (estudantes não precisam ver o gabarito direto — a lógica está no servidor)
create policy "Todos autenticados veem questões" on questoes
  for select using (auth.role() = 'authenticated');

-- Diagnósticos
create policy "Estudantes veem próprios diagnósticos" on diagnosticos
  for select using (estudante_id = auth.uid());

create policy "Estudantes criam diagnósticos" on diagnosticos
  for insert with check (estudante_id = auth.uid());

create policy "Estudantes atualizam próprios diagnósticos" on diagnosticos
  for update using (estudante_id = auth.uid());

create policy "Professores veem diagnósticos da sua turma" on diagnosticos
  for select using (
    get_user_role() = 'professor' and
    turma_id in (select id from turmas where professor_id = auth.uid())
  );

create policy "Gestores veem todos os diagnósticos" on diagnosticos
  for select using (get_user_role() = 'gestor');

-- Respostas diagnóstico
create policy "Estudantes veem próprias respostas" on respostas_diagnostico
  for select using (
    diagnostico_id in (select id from diagnosticos where estudante_id = auth.uid())
  );

create policy "Estudantes criam respostas" on respostas_diagnostico
  for insert with check (
    diagnostico_id in (select id from diagnosticos where estudante_id = auth.uid())
  );

-- Trilhas
create policy "Estudantes veem próprias trilhas" on trilhas
  for select using (estudante_id = auth.uid());

create policy "Estudantes criam trilhas" on trilhas
  for insert with check (estudante_id = auth.uid());

create policy "Estudantes atualizam próprias trilhas" on trilhas
  for update using (estudante_id = auth.uid());

create policy "Professores veem trilhas da turma" on trilhas
  for select using (
    get_user_role() = 'professor' and
    estudante_id in (
      select id from profiles
      where turma_id in (select id from turmas where professor_id = auth.uid())
    )
  );

create policy "Gestores veem todas as trilhas" on trilhas
  for select using (get_user_role() = 'gestor');

-- Trilha habilidades
create policy "Estudantes veem habilidades da própria trilha" on trilha_habilidades
  for select using (
    trilha_id in (select id from trilhas where estudante_id = auth.uid())
  );

create policy "Estudantes manipulam habilidades da própria trilha" on trilha_habilidades
  for all using (
    trilha_id in (select id from trilhas where estudante_id = auth.uid())
  );

create policy "Professores veem trilha_habilidades da turma" on trilha_habilidades
  for select using (
    get_user_role() in ('professor', 'gestor') and
    trilha_id in (
      select t.id from trilhas t
      join profiles p on t.estudante_id = p.id
      join turmas tu on p.turma_id = tu.id
      where tu.professor_id = auth.uid() or get_user_role() = 'gestor'
    )
  );

-- Insígnias
create policy "Todos autenticados veem insígnias" on insignias
  for select using (auth.role() = 'authenticated');

-- Insígnias do estudante
create policy "Estudantes veem próprias insígnias" on estudante_insignias
  for select using (estudante_id = auth.uid());

create policy "Estudantes ganham insígnias" on estudante_insignias
  for insert with check (estudante_id = auth.uid());

create policy "Professores e gestores veem insígnias" on estudante_insignias
  for select using (get_user_role() in ('professor', 'gestor'));

-- Sequências didáticas (nunca visíveis para estudantes)
create policy "Professores e gestores veem sequências" on sequencias_didaticas
  for select using (get_user_role() in ('professor', 'gestor'));
