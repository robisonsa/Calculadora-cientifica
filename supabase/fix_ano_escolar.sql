-- Fix rápido: define ano_escolar nos perfis dos usuários demo existentes
-- Execute no Supabase → SQL Editor → New Query → Run

UPDATE public.profiles
SET ano_escolar = '9EF'
WHERE id = (SELECT id FROM auth.users WHERE email = 'joao@gps.demo');

UPDATE public.profiles
SET ano_escolar = '5EF'
WHERE id = (SELECT id FROM auth.users WHERE email = 'maria@gps.demo');

UPDATE public.profiles
SET ano_escolar = '2EF'
WHERE id = (SELECT id FROM auth.users WHERE email = 'pedro@gps.demo');

-- Confirma
SELECT au.email, p.ano_escolar, p.role
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email LIKE '%@gps.demo';
