-- Migration 003: Personalização por ano/série escolar (2EF, 5EF, 9EF)

-- 1. Adicionar ano_escolar ao perfil do estudante
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ano_escolar TEXT
  CHECK (ano_escolar IN ('2EF', '5EF', '9EF'));

-- 2. Adicionar ano_escolar às habilidades da Matriz SAEB
ALTER TABLE public.habilidades
  ADD COLUMN IF NOT EXISTS ano_escolar TEXT
  CHECK (ano_escolar IN ('2EF', '5EF', '9EF'));

-- 3. Atualizar trigger para incluir ano_escolar no cadastro via signUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, role, escola, ano_escolar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'estudante'),
    COALESCE(NEW.raw_user_meta_data->>'escola', 'CEGLB'),
    NEW.raw_user_meta_data->>'ano_escolar'
  );
  RETURN NEW;
END;
$$;
