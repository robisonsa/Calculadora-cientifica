-- ============================================================
-- GPS — Seed SQL completo
-- Cole este script no Supabase → SQL Editor → New Query → Run
-- ============================================================

DO $$
DECLARE
  -- IDs das turmas
  turma_1a_id UUID;
  turma_2a_id UUID;
  turma_3a_id UUID;

  -- IDs das habilidades
  lp01_id UUID; lp02_id UUID; lp03_id UUID; lp04_id UUID;
  lp05_id UUID; lp06_id UUID; lp07_id UUID; lp08_id UUID;
  mt01_id UUID; mt02_id UUID; mt03_id UUID; mt04_id UUID;
  mt05_id UUID; mt06_id UUID; mt07_id UUID; mt08_id UUID;

  -- IDs dos usuários
  professor_id UUID;
  gestora_id   UUID;
  joao_id      UUID;
  maria_id     UUID;
  pedro_id     UUID;

BEGIN

-- ===== 1. HABILIDADES =====
RAISE NOTICE 'Inserindo habilidades...';
INSERT INTO public.habilidades (codigo, descricao, disciplina, eixo, nivel_escala_saeb) VALUES
  ('LP01','Localizar informações explícitas em textos','lp','Leitura',2),
  ('LP02','Inferir o sentido de palavras ou expressões','lp','Leitura',3),
  ('LP03','Identificar o tema central de um texto','lp','Leitura',3),
  ('LP04','Reconhecer a finalidade de um texto','lp','Leitura',4),
  ('LP05','Interpretar texto com linguagem verbal e não verbal','lp','Leitura',4),
  ('LP06','Reconhecer relações de causa e consequência','lp','Leitura',5),
  ('LP07','Distinguir fato de opinião em texto argumentativo','lp','Leitura',6),
  ('LP08','Reconhecer o efeito de sentido produzido por recursos expressivos','lp','Literatura',7),
  ('MT01','Resolver problemas com números naturais e operações básicas','matematica','Numeros',2),
  ('MT02','Resolver problemas com frações e decimais','matematica','Numeros',3),
  ('MT03','Identificar e descrever figuras geométricas planas e espaciais','matematica','Geometria',3),
  ('MT04','Resolver problemas com porcentagem','matematica','Numeros',4),
  ('MT05','Interpretar gráficos e tabelas','matematica','Estatistica',4),
  ('MT06','Resolver equações e inequações do 1º grau','matematica','Algebra',5),
  ('MT07','Aplicar o Teorema de Pitágoras em situações-problema','matematica','Geometria',6),
  ('MT08','Resolver problemas envolvendo funções afins e quadráticas','matematica','Algebra',7)
ON CONFLICT (codigo) DO NOTHING;

SELECT id INTO lp01_id FROM public.habilidades WHERE codigo = 'LP01';
SELECT id INTO lp02_id FROM public.habilidades WHERE codigo = 'LP02';
SELECT id INTO lp03_id FROM public.habilidades WHERE codigo = 'LP03';
SELECT id INTO lp04_id FROM public.habilidades WHERE codigo = 'LP04';
SELECT id INTO lp05_id FROM public.habilidades WHERE codigo = 'LP05';
SELECT id INTO lp06_id FROM public.habilidades WHERE codigo = 'LP06';
SELECT id INTO lp07_id FROM public.habilidades WHERE codigo = 'LP07';
SELECT id INTO lp08_id FROM public.habilidades WHERE codigo = 'LP08';
SELECT id INTO mt01_id FROM public.habilidades WHERE codigo = 'MT01';
SELECT id INTO mt02_id FROM public.habilidades WHERE codigo = 'MT02';
SELECT id INTO mt03_id FROM public.habilidades WHERE codigo = 'MT03';
SELECT id INTO mt04_id FROM public.habilidades WHERE codigo = 'MT04';
SELECT id INTO mt05_id FROM public.habilidades WHERE codigo = 'MT05';
SELECT id INTO mt06_id FROM public.habilidades WHERE codigo = 'MT06';
SELECT id INTO mt07_id FROM public.habilidades WHERE codigo = 'MT07';
SELECT id INTO mt08_id FROM public.habilidades WHERE codigo = 'MT08';
RAISE NOTICE 'Habilidades OK';

-- ===== 2. QUESTÕES =====
RAISE NOTICE 'Inserindo questões...';
INSERT INTO public.questoes (habilidade_id,enunciado,alternativa_a,alternativa_b,alternativa_c,alternativa_d,gabarito,nivel_dificuldade,fonte) VALUES
  -- LP01
  (lp01_id,'Leia o trecho: "João acordou às 6h, tomou café e foi para a escola de bicicleta." Qual meio de transporte João usou?','Ônibus','A pé','Bicicleta','Carro','c',1,'elaborada'),
  (lp01_id,'No texto: "O museu abre às 9h e fecha às 17h, de terça a domingo." Em que dia o museu está fechado?','Quarta-feira','Sábado','Domingo','Segunda-feira','d',1,'elaborada'),
  (lp01_id,'"A temperatura máxima prevista para amanhã é de 32°C." Qual é a temperatura máxima prevista?','22°C','32°C','30°C','35°C','b',1,'elaborada'),
  (lp01_id,'Segundo o aviso: "Proibido estacionar neste local das 7h às 19h." Às 20h, é permitido estacionar?','Não, é sempre proibido','Sim, pois está fora do horário proibido','Só aos finais de semana','Apenas com autorização','b',1,'elaborada'),
  (lp01_id,'No bilhete: "Mãe, fui ao mercado com a Ana. Volto às 18h. — Pedro." Quem foi ao mercado?','A mãe de Pedro','Pedro sozinho','Pedro e Ana','Apenas Ana','c',1,'elaborada'),
  -- LP02
  (lp02_id,'Na frase "Ele tinha um coração de pedra", a expressão significa:','Uma pessoa muito generosa','Uma pessoa muito insensível','Uma pessoa muito corajosa','Uma pessoa muito trabalhadora','b',1,'elaborada'),
  (lp02_id,'"O aluno estava voando de alegria depois da prova." O sentido de "voando de alegria" é:','O aluno estava triste','O aluno estava muito feliz','O aluno foi embora rapidamente','O aluno estava cansado','b',1,'elaborada'),
  (lp02_id,'Em "Ela tem uma memória de elefante", o que isso significa?','Ela é muito grande','Ela é muito lenta','Ela lembra de tudo muito bem','Ela tem medo de animais','c',1,'elaborada'),
  (lp02_id,'"O jogador engoliu o choro e continuou na partida." Qual o sentido de "engoliu o choro"?','Chorou muito','Ficou doente','Conteve as lágrimas','Saiu do jogo','c',1,'elaborada'),
  (lp02_id,'Na expressão "Não mexa em time que está ganhando", o conselho dado é:','Mude sempre a equipe para melhorar','Não altere o que está funcionando bem','Times perdedores precisam de mudanças','Nunca jogue em equipe','b',2,'elaborada'),
  -- LP03
  (lp03_id,'Um texto fala sobre os malefícios do consumo excessivo de açúcar para a saúde. Qual é o tema central?','Os benefícios da alimentação saudável','Os problemas causados pelo excesso de açúcar','O processo de produção do açúcar','O consumo de alimentos industrializados','b',1,'elaborada'),
  (lp03_id,'Um poema descreve a saudade de uma pessoa que partiu. O tema central é:','A alegria de novas amizades','A viagem e a aventura','A saudade e a ausência','A natureza e suas belezas','c',1,'elaborada'),
  (lp03_id,'Um artigo discute o aumento do desmatamento e suas consequências climáticas. Qual tema central?','O crescimento econômico do país','Os efeitos do desmatamento no clima','O trabalho dos ambientalistas','A preservação de animais','b',1,'elaborada'),
  (lp03_id,'Um conto mostra um personagem que aprende a valorizar a amizade após perder um amigo. O tema é:','A competição entre amigos','O valor da amizade e da perda','A aventura de dois jovens','A importância dos estudos','b',2,'elaborada'),
  (lp03_id,'Uma reportagem aborda a falta de investimento em educação pública no Brasil. O tema central é:','O sistema de saúde público','A qualidade do ensino privado','A crise na educação pública','Os salários dos professores','c',2,'elaborada'),
  -- LP04
  (lp04_id,'Um texto com o título "Modo de usar: tome 1 comprimido a cada 8 horas" tem como finalidade:','Narrar uma história','Dar instruções de uso','Convencer o leitor','Descrever um lugar','b',1,'elaborada'),
  (lp04_id,'Uma campanha com o slogan "Doe sangue, doe vida!" tem como finalidade:','Informar sobre doenças','Vender produtos médicos','Persuadir as pessoas a doar sangue','Narrar experiências pessoais','c',1,'elaborada'),
  (lp04_id,'Um artigo de jornal que relata um acidente de trânsito tem como finalidade principal:','Entreter o leitor com ficção','Informar sobre o acontecimento','Ensinar como dirigir','Convencer a comprar seguro','b',1,'elaborada'),
  (lp04_id,'Um poema sobre a beleza do pôr do sol tem como finalidade:','Instruir o leitor','Argumentar contra a poluição','Expressar sentimentos e provocar emoção','Informar sobre meteorologia','c',2,'elaborada'),
  (lp04_id,'Um editorial que defende a redução da maioridade penal tem como finalidade:','Narrar casos criminais','Apresentar opinião e argumentar','Descrever o sistema penal','Instruir sobre leis','b',2,'elaborada'),
  -- LP05
  (lp05_id,'Uma charge mostra um político segurando uma vassoura sobre um monte de lixo. O texto não verbal sugere:','O político é trabalhador','O político está fazendo faxina nos problemas','O político vende vassouras','O país está limpo','b',2,'elaborada'),
  (lp05_id,'Uma propaganda mostra uma pessoa feliz segurando um produto e a frase "Seja feliz também!". O objetivo é:','Informar sobre os ingredientes','Associar o produto à felicidade para vender','Mostrar problemas de saúde','Narrar uma história pessoal','b',2,'elaborada'),
  (lp05_id,'Uma tirinha mostra um personagem com chuva em cima da cabeça sorrindo. O humor vem de:','O personagem está molhado','O contraste entre chuva e alegria','A chuva é abundante','O personagem tem guarda-chuva','b',2,'elaborada'),
  (lp05_id,'Um infográfico mostra setas apontando para partes de uma célula com legendas. Sua função é:','Convencer o leitor','Narrar um processo histórico','Explicar visualmente a estrutura da célula','Expressar sentimentos do autor','c',2,'elaborada'),
  (lp05_id,'Em uma história em quadrinhos, o personagem pensa algo diferente do que diz. Isso indica:','Que o personagem está doente','Ironia ou hipocrisia do personagem','Que o personagem está feliz','Um erro do autor','b',2,'elaborada'),
  -- LP06
  (lp06_id,'"Porque não houve chuva no verão, a colheita foi prejudicada." A causa do problema foi:','A colheita ruim','A falta de chuva','O calor excessivo','O trabalho dos agricultores','b',2,'elaborada'),
  (lp06_id,'"O estudante não dormiu bem e, por isso, tirou nota baixa." Qual a relação entre as ideias?','Oposição','Comparação','Causa e consequência','Adição','c',2,'elaborada'),
  (lp06_id,'"O desmatamento intenso levou ao aumento de queimadas e à seca na região." Identifique a consequência:','O desmatamento intenso','O aumento das queimadas e a seca','A devastação das florestas','A ação humana','b',2,'elaborada'),
  (lp06_id,'"Por praticar esportes regularmente, ela mantém boa saúde." O conector "por" indica:','Consequência','Causa','Oposição','Condição','b',2,'elaborada'),
  (lp06_id,'"Tanto estudou que se tornou o melhor da turma." Qual relação essa frase expressa?','Concessão','Comparação','Causa e efeito com intensidade','Oposição','c',2,'elaborada'),
  -- LP07
  (lp07_id,'"O desemprego subiu 3% no último trimestre" — esta afirmação é:','Uma opinião','Um fato verificável','Uma suposição','Uma hipótese','b',2,'elaborada'),
  (lp07_id,'"Acredito que a educação pública brasileira precisa de mais investimentos" — essa afirmação é:','Um fato','Uma lei','Uma opinião','Uma estatística','c',2,'elaborada'),
  (lp07_id,'"Segundo pesquisa do IBGE, 70% dos jovens preferem cursos técnicos." Trata-se de:','Opinião pessoal','Dado de pesquisa (fato)','Sugestão','Hipótese','b',2,'elaborada'),
  (lp07_id,'"Em minha visão, as redes sociais são prejudiciais aos adolescentes." Esta frase expressa:','Um fato comprovado','Um dado científico','Uma opinião','Uma lei','c',2,'elaborada'),
  (lp07_id,'"A poluição do ar causou aumento de internações por doenças respiratórias neste ano." Isso é:','Uma opinião editorial','Uma hipótese a ser verificada','Um fato documentado','Uma previsão futura','c',3,'elaborada'),
  -- LP08
  (lp08_id,'Em "as folhas caíam como lágrimas do outono", o recurso usado é:','Metáfora','Hipérbole','Comparação (símile)','Ironia','c',2,'elaborada'),
  (lp08_id,'Em "Seus olhos são dois diamantes brilhantes", o recurso é:','Símile','Metáfora','Hipérbole','Personificação','b',2,'elaborada'),
  (lp08_id,'Em "Já te disse um milhão de vezes para estudar!", o efeito criado é de:','Ironia','Exagero para enfatizar (hipérbole)','Comparação','Eufemismo','b',2,'elaborada'),
  (lp08_id,'"O vento sussurrava segredos entre as árvores." Qual recurso está presente?','Hipérbole','Ironia','Personificação (prosopopeia)','Antítese','c',2,'elaborada'),
  (lp08_id,'"Que lindo dia!" — dito com chuva e tempestade. Esse recurso é:','Metáfora','Hipérbole','Ironia','Comparação','c',2,'elaborada'),
  -- MT01
  (mt01_id,'Uma padaria vendeu 248 pães de manhã e 173 à tarde. Quantos pães foram vendidos no total?','401','421','411','431','b',1,'elaborada'),
  (mt01_id,'Um fazendeiro tem 360 galinhas e quer distribuí-las igualmente em 9 galinheiros. Quantas ficam em cada?','30','40','45','50','b',1,'elaborada'),
  (mt01_id,'Qual o resultado de 15 × 12?','170','180','190','160','b',1,'elaborada'),
  (mt01_id,'Uma escola tem 450 alunos. Se cada turma tem 30 alunos, quantas turmas há?','12','13','15','14','c',1,'elaborada'),
  (mt01_id,'Num estádio com 12.500 lugares, 9.847 estão ocupados. Quantos lugares estão vazios?','2.553','2.653','2.453','2.753','b',1,'elaborada'),
  -- MT02
  (mt02_id,'Maria comeu 3/8 de uma pizza e João comeu 2/8. Que fração da pizza foi consumida?','4/8','5/8','6/8','1/2','b',1,'elaborada'),
  (mt02_id,'Qual é o valor de 0,5 + 0,25?','0,70','0,75','0,80','0,65','b',1,'elaborada'),
  (mt02_id,'Uma receita pede 1/2 xícara de leite. Se for dobrada, quantas xícaras serão necessárias?','1 xícara','1 e 1/4','3/4','2 xícaras','a',1,'elaborada'),
  (mt02_id,'Ordene da menor para a maior: 0,3 / 1/4 / 0,27','1/4 < 0,27 < 0,3','0,27 < 1/4 < 0,3','0,3 < 0,27 < 1/4','0,27 < 0,3 < 1/4','b',2,'elaborada'),
  (mt02_id,'Uma barra de chocolate foi dividida em 12 partes iguais. Ana comeu 4 e Pedro 3. Que fração sobrou?','5/12','4/12','6/12','7/12','a',2,'elaborada'),
  -- MT03
  (mt03_id,'Quantos lados tem um hexágono regular?','5','7','6','8','c',1,'elaborada'),
  (mt03_id,'Qual figura geométrica espacial tem uma base circular e um vértice?','Cilindro','Esfera','Cone','Pirâmide','c',1,'elaborada'),
  (mt03_id,'Um cubo tem quantas faces?','4','5','8','6','d',1,'elaborada'),
  (mt03_id,'Qual polígono tem todos os lados e ângulos iguais e 4 lados?','Retângulo','Losango','Quadrado','Trapézio','c',1,'elaborada'),
  (mt03_id,'Uma pirâmide de base quadrangular tem quantas faces triangulares?','3','5','4','6','c',2,'elaborada'),
  -- MT04
  (mt04_id,'Um produto custa R$ 200,00 e está com 15% de desconto. Qual o preço final?','R$ 185,00','R$ 170,00','R$ 160,00','R$ 175,00','b',1,'elaborada'),
  (mt04_id,'Em uma sala de 30 alunos, 60% são meninas. Quantas meninas há?','16','18','20','15','b',1,'elaborada'),
  (mt04_id,'Um salário de R$ 2.000 teve um aumento de 10%. Qual o novo salário?','R$ 2.100','R$ 2.200','R$ 2.150','R$ 2.020','b',1,'elaborada'),
  (mt04_id,'25 é quanto por cento de 200?','10%','12,5%','15%','20%','b',2,'elaborada'),
  (mt04_id,'Uma loja vende um item por R$ 120 com lucro de 20% sobre o custo. Qual foi o custo?','R$ 96,00','R$ 100,00','R$ 110,00','R$ 104,00','b',2,'elaborada'),
  -- MT05
  (mt05_id,'Um gráfico de barras mostra: LP=25, MAT=30, CIE=20, HIS=15. Qual a disciplina mais estudada?','Língua Portuguesa','Ciências','Matemática','História','c',1,'elaborada'),
  (mt05_id,'Pedro obteve 8, 7, 9 e 10 nas 4 provas. Qual sua média?','8,0','8,5','9,0','7,5','b',1,'elaborada'),
  (mt05_id,'Um gráfico de setor mostra 40% para A, 35% para B e 25% para C. Se o total é 200, quantos são de A?','70','80','90','60','b',2,'elaborada'),
  (mt05_id,'Numa tabela de frequência, o valor que aparece mais vezes chama-se:','Média','Mediana','Moda','Amplitude','c',1,'elaborada'),
  (mt05_id,'Dados os valores 4, 7, 8, 9, 12. Qual é a mediana?','7','9','8','8,5','c',2,'elaborada'),
  -- MT06
  (mt06_id,'Resolva: 2x + 6 = 14. Qual o valor de x?','3','5','4','6','c',1,'elaborada'),
  (mt06_id,'Se 3x - 9 = 0, então x é igual a:','2','4','3','6','c',1,'elaborada'),
  (mt06_id,'Resolva a inequação: x + 5 > 11. A solução é:','x > 5','x > 6','x < 6','x ≥ 6','b',2,'elaborada'),
  (mt06_id,'Um número somado a 17 resulta em 42. Qual o número?','23','25','27','29','b',1,'elaborada'),
  (mt06_id,'Se 4(x - 3) = 20, qual o valor de x?','7','6','8','5','c',2,'elaborada'),
  -- MT07
  (mt07_id,'Em um triângulo retângulo, os catetos medem 3 e 4 cm. Qual é a hipotenusa?','6 cm','5 cm','7 cm','4,5 cm','b',2,'elaborada'),
  (mt07_id,'Um triângulo retângulo tem catetos de 5 e 12. Qual a hipotenusa?','11','15','13','14','c',2,'elaborada'),
  (mt07_id,'A hipotenusa de um triângulo retângulo mede 10 e um cateto mede 6. Qual o outro cateto?','7','9','8','6','c',2,'elaborada'),
  (mt07_id,'O Teorema de Pitágoras afirma que, num triângulo retângulo: a² + b² é igual a:','c² (hipotenusa ao quadrado)','2c','a + b','(a + b)²','a',1,'elaborada'),
  (mt07_id,'Uma escada de 5 m apoia-se numa parede a 4 m de altura. Qual é a distância da base ao pé da parede?','2 m','3 m','4 m','1 m','b',2,'elaborada'),
  -- MT08
  (mt08_id,'Na função f(x) = 2x + 3, qual o valor de f(5)?','11','13','15','10','b',2,'elaborada'),
  (mt08_id,'Uma função afim tem f(0) = 2 e f(1) = 5. Qual a taxa de variação (coeficiente angular)?','2','5','3','4','c',2,'elaborada'),
  (mt08_id,'Na função quadrática f(x) = x² - 4x + 4, qual é o vértice?','(2, 0)','(0, 4)','(-2, 0)','(4, 0)','a',2,'elaborada'),
  (mt08_id,'A função f(x) = -x + 6 é crescente ou decrescente?','Crescente','Decrescente','Constante','Não é uma função','b',2,'elaborada'),
  (mt08_id,'Para que valores de x a função f(x) = x² - 9 se anula?','x = 3 apenas','x = ±3','x = ±9','x = 9','b',2,'elaborada');

RAISE NOTICE 'Questões OK';

-- ===== 3. INSÍGNIAS =====
RAISE NOTICE 'Inserindo insígnias...';
INSERT INTO public.insignias (nome, descricao, icone_emoji, criterio, xp_bonus) VALUES
  ('Primeiro Passo','Conclua sua primeira habilidade na trilha','👟','completar 1 habilidade',50),
  ('Sequência Quente','Acerte 10 questões seguidas sem errar','🔥','acertar 10 questões seguidas',100),
  ('Metade do Caminho','Conclua 50% de qualquer trilha','🗺️','concluir 50% da trilha',150),
  ('Chegada','Conclua 100% de qualquer trilha','🏁','concluir 100% da trilha',300),
  ('Mestre das Palavras','Conclua todas as habilidades de Língua Portuguesa','📖','concluir trilha de LP',500),
  ('Calculista','Conclua todas as habilidades de Matemática','🔢','concluir trilha de matemática',500),
  ('GPS Completo','Conclua as trilhas de LP e Matemática','🧭','concluir ambas as trilhas',1000)
ON CONFLICT (nome) DO NOTHING;
RAISE NOTICE 'Insígnias OK';

-- ===== 4. TURMAS =====
RAISE NOTICE 'Inserindo turmas...';
INSERT INTO public.turmas (nome, ano_letivo, escola) VALUES
  ('1ºA', 2026, 'CEGLB'),
  ('2ºA', 2026, 'CEGLB'),
  ('3ºA', 2026, 'CEGLB')
ON CONFLICT DO NOTHING;

SELECT id INTO turma_1a_id FROM public.turmas WHERE nome = '1ºA' AND ano_letivo = 2026;
SELECT id INTO turma_2a_id FROM public.turmas WHERE nome = '2ºA' AND ano_letivo = 2026;
SELECT id INTO turma_3a_id FROM public.turmas WHERE nome = '3ºA' AND ano_letivo = 2026;
RAISE NOTICE 'Turmas OK';

-- ===== 5. USUÁRIOS AUTH =====
-- O trigger on_auth_user_created cria o perfil automaticamente.
RAISE NOTICE 'Criando usuários demo...';

-- Professor
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'robison@gps.demo') THEN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'robison@gps.demo',
    crypt('gps2026', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Prof. Robison Sá","role":"professor"}',
    NOW(), NOW(), '', '', '', ''
  );
END IF;
SELECT id INTO professor_id FROM auth.users WHERE email = 'robison@gps.demo';
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES (gen_random_uuid(), professor_id,
  json_build_object('sub', professor_id::text, 'email', 'robison@gps.demo')::jsonb,
  'email', 'robison@gps.demo', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Gestora
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gestora@gps.demo') THEN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'gestora@gps.demo',
    crypt('gps2026', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Gestora Ana Paula","role":"gestor"}',
    NOW(), NOW(), '', '', '', ''
  );
END IF;
SELECT id INTO gestora_id FROM auth.users WHERE email = 'gestora@gps.demo';
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES (gen_random_uuid(), gestora_id,
  json_build_object('sub', gestora_id::text, 'email', 'gestora@gps.demo')::jsonb,
  'email', 'gestora@gps.demo', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- João (estudante)
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joao@gps.demo') THEN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'joao@gps.demo',
    crypt('gps2026', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"João Silva","role":"estudante"}',
    NOW(), NOW(), '', '', '', ''
  );
END IF;
SELECT id INTO joao_id FROM auth.users WHERE email = 'joao@gps.demo';
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES (gen_random_uuid(), joao_id,
  json_build_object('sub', joao_id::text, 'email', 'joao@gps.demo')::jsonb,
  'email', 'joao@gps.demo', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Maria (estudante)
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maria@gps.demo') THEN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'maria@gps.demo',
    crypt('gps2026', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Maria Oliveira","role":"estudante"}',
    NOW(), NOW(), '', '', '', ''
  );
END IF;
SELECT id INTO maria_id FROM auth.users WHERE email = 'maria@gps.demo';
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES (gen_random_uuid(), maria_id,
  json_build_object('sub', maria_id::text, 'email', 'maria@gps.demo')::jsonb,
  'email', 'maria@gps.demo', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Pedro (estudante)
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pedro@gps.demo') THEN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'pedro@gps.demo',
    crypt('gps2026', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Pedro Santos","role":"estudante"}',
    NOW(), NOW(), '', '', '', ''
  );
END IF;
SELECT id INTO pedro_id FROM auth.users WHERE email = 'pedro@gps.demo';
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES (gen_random_uuid(), pedro_id,
  json_build_object('sub', pedro_id::text, 'email', 'pedro@gps.demo')::jsonb,
  'email', 'pedro@gps.demo', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

RAISE NOTICE 'Usuários auth OK';

-- ===== 6. AJUSTAR TURMA DOS ESTUDANTES E PROFESSOR =====
-- Atualiza turma_id dos estudantes (2ºA)
UPDATE public.profiles SET turma_id = turma_2a_id
WHERE id IN (joao_id, maria_id, pedro_id);

-- Vincula professor às turmas
UPDATE public.turmas SET professor_id = professor_id
WHERE id IN (turma_1a_id, turma_2a_id, turma_3a_id);

-- ===== 7. SEQUÊNCIAS DIDÁTICAS =====
RAISE NOTICE 'Inserindo sequências didáticas...';
INSERT INTO public.sequencias_didaticas (habilidade_id, titulo, objetivo, materiais, etapas, tempo_estimado_minutos, ano_escolar) VALUES
  (lp01_id,'LP01: Localizar informações explícitas em textos','Desenvolver a habilidade de localizar informações explícitas em textos conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente um texto curto e peça aos estudantes que identifiquem uma informação específica.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique o que são informações explícitas vs implícitas. Use exemplos do cotidiano.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva exercícios coletivamente, destacando as palavras-chave que indicam a informação.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem 2 questões. Corrija e registre quem precisa de reforço.',50,'EM'),
  (lp02_id,'LP02: Inferir sentido de palavras ou expressões','Desenvolver a habilidade de inferir o sentido de palavras ou expressões conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente expressões idiomáticas do cotidiano e discuta seus sentidos com a turma.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique inferência a partir do contexto. Mostre como o texto ajuda a descobrir o sentido.\n\n**Etapa 3 — Atividade guiada (15 min)**\nTrabalhe com textos que contenham metáforas e expressões, resolvendo coletivamente.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem questões de inferência. Corrija coletivamente.',50,'EM'),
  (lp03_id,'LP03: Identificar o tema central de um texto','Desenvolver a habilidade de identificar o tema central de um texto conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente dois textos sobre o mesmo tema com abordagens diferentes. Discuta o que têm em comum.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique como diferenciar tema de assunto. Use mapas mentais na lousa.\n\n**Etapa 3 — Atividade guiada (15 min)**\nLeia um texto coletivamente e construa juntos a identificação do tema central.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes identificam o tema de textos curtos. Corrija e discuta.',50,'EM'),
  (lp04_id,'LP04: Reconhecer a finalidade de um texto','Desenvolver a habilidade de reconhecer a finalidade de um texto conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre diferentes gêneros textuais: bula, charge, notícia, poema. Peça que digam para que serve cada um.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique os tipos de finalidade: informar, instruir, persuadir, entreter, expressar.\n\n**Etapa 3 — Atividade guiada (15 min)**\nIdentifique coletivamente a finalidade de 3 textos diferentes.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes classificam textos por finalidade. Corrija.',50,'EM'),
  (lp05_id,'LP05: Interpretar texto verbal e não verbal','Desenvolver a habilidade de interpretar texto com linguagem verbal e não verbal conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre charges e tirinhas. Pergunte: o que o texto verbal diz? E o não verbal?\n\n**Etapa 2 — Apresentação (15 min)**\nExplique linguagem verbal e não verbal e como interagem na produção de sentido.\n\n**Etapa 3 — Atividade guiada (15 min)**\nAnalisem coletivamente uma propaganda e uma charge.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes interpretam textos multimodais. Corrija.',50,'EM'),
  (lp06_id,'LP06: Relações de causa e consequência','Desenvolver a habilidade de reconhecer relações de causa e consequência conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente situações do cotidiano com causa e efeito. Discuta os conectivos usados.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique os principais conectivos de causa/consequência: porque, por isso, logo, portanto, assim.\n\n**Etapa 3 — Atividade guiada (15 min)**\nIdentifiquem coletivamente as relações em textos jornalísticos.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes completam e analisam frases com conectivos. Corrija.',50,'EM'),
  (lp07_id,'LP07: Fato e opinião em texto argumentativo','Desenvolver a habilidade de distinguir fato de opinião em texto argumentativo conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente afirmações e peça que classifiquem como fato ou opinião.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique as características de fatos verificáveis vs opiniões. Mostre marcadores linguísticos.\n\n**Etapa 3 — Atividade guiada (15 min)**\nAnalise coletivamente um artigo de opinião identificando fatos e opiniões.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes identificam e classificam afirmações. Corrija.',50,'EM'),
  (lp08_id,'LP08: Recursos expressivos e efeitos de sentido','Desenvolver a habilidade de reconhecer efeitos de sentido produzidos por recursos expressivos conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente poemas e trechos literários com figuras de linguagem. Pergunte o que chamou atenção.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique metáfora, símile, hipérbole, ironia e personificação com exemplos.\n\n**Etapa 3 — Atividade guiada (15 min)**\nIdentifiquem coletivamente os recursos em textos literários e publicitários.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes identificam e nomeiam figuras de linguagem. Corrija.',50,'EM'),
  (mt01_id,'MT01: Números naturais e operações básicas','Desenvolver a habilidade de resolver problemas com números naturais e operações básicas conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente situações-problema do cotidiano envolvendo as quatro operações.\n\n**Etapa 2 — Apresentação (15 min)**\nRevise adição, subtração, multiplicação e divisão. Destaque a interpretação do problema.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva 3 problemas coletivamente, enfatizando a leitura e identificação da operação necessária.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem 2 problemas. Corrija e discuta estratégias.',50,'EM'),
  (mt02_id,'MT02: Frações e números decimais','Desenvolver a habilidade de resolver problemas com frações e decimais conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nUse materiais concretos (pizza, chocolate) para representar frações.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique frações equivalentes, decimais e conversões. Conecte ao cotidiano.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva problemas com frações e decimais coletivamente.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem exercícios. Corrija.',50,'EM'),
  (mt03_id,'MT03: Figuras geométricas planas e espaciais','Desenvolver a habilidade de identificar e descrever figuras geométricas conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre objetos do cotidiano e peça que identifiquem as formas geométricas correspondentes.\n\n**Etapa 2 — Apresentação (15 min)**\nCaracterize polígonos, poliedros e corpos redondos. Use imagens e modelos.\n\n**Etapa 3 — Atividade guiada (15 min)**\nClassifiquem figuras coletivamente e calculem perímetros simples.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem questões de identificação. Corrija.',50,'EM'),
  (mt04_id,'MT04: Porcentagem','Desenvolver a habilidade de resolver problemas com porcentagem conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre situações reais: desconto em loja, juros, pesquisas. Pergunte como calculariam.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique porcentagem como fração de 100. Demonstre cálculo de porcentagem e variação percentual.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva problemas de desconto, aumento e taxa coletivamente.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem 2 problemas. Corrija.',50,'EM'),
  (mt05_id,'MT05: Gráficos e tabelas','Desenvolver a habilidade de interpretar gráficos e tabelas conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre gráficos de jornais/revistas. Pergunte que informações podem ser extraídas.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique tipos de gráficos (barras, linha, setor) e como lê-los. Calcule média, moda e mediana.\n\n**Etapa 3 — Atividade guiada (15 min)**\nInterprete coletivamente uma tabela e um gráfico com perguntas orientadas.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes respondem questões sobre um gráfico. Corrija.',50,'EM'),
  (mt06_id,'MT06: Equações e inequações do 1º grau','Desenvolver a habilidade de resolver equações e inequações do 1º grau conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nApresente uma balança em equilíbrio como metáfora da equação. Discuta a ideia de igualdade.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique o método de resolução de equações e inequações do 1º grau com exemplos graduais.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva equações e inequações coletivamente, verificando as soluções.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem equações. Corrija e discuta os erros mais comuns.',50,'EM'),
  (mt07_id,'MT07: Teorema de Pitágoras','Desenvolver a habilidade de aplicar o Teorema de Pitágoras em situações-problema conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre situações práticas onde Pitágoras é usado: construção, mapa, distância.\n\n**Etapa 2 — Apresentação (15 min)**\nEnuncie o teorema (a² + b² = c²). Demonstre visualmente com quadriculados.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva 3 problemas aplicados coletivamente, identificando hipotenusa e catetos.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem 2 problemas. Corrija.',50,'EM'),
  (mt08_id,'MT08: Funções afins e quadráticas','Desenvolver a habilidade de resolver problemas envolvendo funções afins e quadráticas conforme a Matriz SAEB.','Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.','**Etapa 1 — Sensibilização (10 min)**\nMostre situações cotidianas modeladas por funções: preço×quantidade, queda livre.\n\n**Etapa 2 — Apresentação (15 min)**\nExplique função afim (f(x) = ax + b) e quadrática (f(x) = ax² + bx + c). Construa gráficos.\n\n**Etapa 3 — Atividade guiada (15 min)**\nCalcule valores e interprete gráficos coletivamente.\n\n**Etapa 4 — Prática individual (10 min)**\nEstudantes resolvem exercícios com funções. Corrija.',50,'EM');

RAISE NOTICE 'Sequências OK';
RAISE NOTICE '✅ Seed concluído! Usuários demo: joao@gps.demo, maria@gps.demo, pedro@gps.demo, robison@gps.demo, gestora@gps.demo — senha: gps2026';

END $$;
