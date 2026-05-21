-- ============================================================
-- GPS — Cria os 5 usuários demo
-- Execute este script no Supabase SQL Editor
-- (os dados de habilidades/questões já foram inseridos antes)
-- ============================================================

-- 1. Cria os usuários em auth.users (sem ON CONFLICT)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', u.email,
  crypt('gps2026', gen_salt('bf')), NOW(),
  '{"provider":"email","providers":["email"]}',
  u.meta::jsonb,
  NOW(), NOW(), '', '', '', ''
FROM (VALUES
  ('robison@gps.demo',  '{"nome_completo":"Prof. Robison Sá","role":"professor"}'),
  ('gestora@gps.demo',  '{"nome_completo":"Gestora Ana Paula","role":"gestor"}'),
  ('joao@gps.demo',     '{"nome_completo":"João Silva","role":"estudante"}'),
  ('maria@gps.demo',    '{"nome_completo":"Maria Oliveira","role":"estudante"}'),
  ('pedro@gps.demo',    '{"nome_completo":"Pedro Santos","role":"estudante"}')
) AS u(email, meta)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.email = u.email
);

-- 2. Cria as identities (necessário para login por email)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
SELECT
  gen_random_uuid(),
  au.id,
  json_build_object('sub', au.id::text, 'email', au.email)::jsonb,
  'email',
  au.email,
  NOW(), NOW(), NOW()
FROM auth.users au
WHERE au.email IN ('robison@gps.demo','gestora@gps.demo','joao@gps.demo','maria@gps.demo','pedro@gps.demo')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities ai WHERE ai.provider_id = au.email AND ai.provider = 'email'
  );

-- 3. Vincula estudantes à turma 2ºA
UPDATE public.profiles
SET turma_id = (SELECT id FROM public.turmas WHERE nome = '2ºA' LIMIT 1)
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('joao@gps.demo','maria@gps.demo','pedro@gps.demo')
)
AND turma_id IS NULL;

-- 4. Vincula professor às turmas
UPDATE public.turmas
SET professor_id = (
  SELECT id FROM auth.users WHERE email = 'robison@gps.demo'
)
WHERE professor_id IS NULL;

-- Confirma
SELECT email, raw_user_meta_data->>'role' AS role
FROM auth.users
WHERE email LIKE '%@gps.demo';
