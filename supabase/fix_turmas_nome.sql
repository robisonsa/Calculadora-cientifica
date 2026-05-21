-- Renomeia as turmas para refletir os anos escolares trabalhados
-- Cole no Supabase → SQL Editor → New Query → Run

UPDATE turmas SET nome = '2º Ano EF' WHERE nome = '1ºA' AND escola = 'CEGLB';
UPDATE turmas SET nome = '5º Ano EF' WHERE nome = '2ºA' AND escola = 'CEGLB';
UPDATE turmas SET nome = '9º Ano EF' WHERE nome = '3ºA' AND escola = 'CEGLB';

-- Ajusta turma_id dos estudantes demo para a turma correta de cada série
UPDATE profiles
SET turma_id = (SELECT id FROM turmas WHERE nome = '9º Ano EF' AND escola = 'CEGLB')
WHERE ano_escolar = '9EF' AND role = 'estudante';

UPDATE profiles
SET turma_id = (SELECT id FROM turmas WHERE nome = '5º Ano EF' AND escola = 'CEGLB')
WHERE ano_escolar = '5EF' AND role = 'estudante';

UPDATE profiles
SET turma_id = (SELECT id FROM turmas WHERE nome = '2º Ano EF' AND escola = 'CEGLB')
WHERE ano_escolar = '2EF' AND role = 'estudante';

SELECT nome, ano_letivo, escola FROM turmas ORDER BY nome;
