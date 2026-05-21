import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Iniciando seed do GPS...\n')

  // HABILIDADES
  const habilidades = [
    // Língua Portuguesa
    { codigo: 'LP01', descricao: 'Localizar informações explícitas em textos', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 2 },
    { codigo: 'LP02', descricao: 'Inferir o sentido de palavras ou expressões', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 3 },
    { codigo: 'LP03', descricao: 'Identificar o tema central de um texto', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 3 },
    { codigo: 'LP04', descricao: 'Reconhecer a finalidade de um texto', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 4 },
    { codigo: 'LP05', descricao: 'Interpretar texto com linguagem verbal e não verbal', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 4 },
    { codigo: 'LP06', descricao: 'Reconhecer relações de causa e consequência', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 5 },
    { codigo: 'LP07', descricao: 'Distinguir fato de opinião em texto argumentativo', disciplina: 'lp', eixo: 'Leitura', nivel_escala_saeb: 6 },
    { codigo: 'LP08', descricao: 'Reconhecer o efeito de sentido produzido por recursos expressivos', disciplina: 'lp', eixo: 'Literatura', nivel_escala_saeb: 7 },
    // Matemática
    { codigo: 'MT01', descricao: 'Resolver problemas com números naturais e operações básicas', disciplina: 'matematica', eixo: 'Numeros', nivel_escala_saeb: 2 },
    { codigo: 'MT02', descricao: 'Resolver problemas com frações e decimais', disciplina: 'matematica', eixo: 'Numeros', nivel_escala_saeb: 3 },
    { codigo: 'MT03', descricao: 'Identificar e descrever figuras geométricas planas e espaciais', disciplina: 'matematica', eixo: 'Geometria', nivel_escala_saeb: 3 },
    { codigo: 'MT04', descricao: 'Resolver problemas com porcentagem', disciplina: 'matematica', eixo: 'Numeros', nivel_escala_saeb: 4 },
    { codigo: 'MT05', descricao: 'Interpretar gráficos e tabelas', disciplina: 'matematica', eixo: 'Estatistica', nivel_escala_saeb: 4 },
    { codigo: 'MT06', descricao: 'Resolver equações e inequações do 1º grau', disciplina: 'matematica', eixo: 'Algebra', nivel_escala_saeb: 5 },
    { codigo: 'MT07', descricao: 'Aplicar o Teorema de Pitágoras em situações-problema', disciplina: 'matematica', eixo: 'Geometria', nivel_escala_saeb: 6 },
    { codigo: 'MT08', descricao: 'Resolver problemas envolvendo funções afins e quadráticas', disciplina: 'matematica', eixo: 'Algebra', nivel_escala_saeb: 7 },
  ]

  console.log('📚 Inserindo habilidades...')
  const { data: habsInseridas, error: habErr } = await supabase
    .from('habilidades')
    .upsert(habilidades, { onConflict: 'codigo' })
    .select()

  if (habErr) { console.error('Erro habilidades:', habErr.message); return }
  console.log(`✅ ${habsInseridas?.length} habilidades inseridas`)

  const habMap: Record<string, string> = {}
  habsInseridas?.forEach((h) => { habMap[h.codigo] = h.id })

  // QUESTÕES (5 por habilidade)
  const questoes = [
    // LP01
    { codigo: 'LP01', enunciado: 'Leia o trecho: "João acordou às 6h, tomou café e foi para a escola de bicicleta." Qual meio de transporte João usou para ir à escola?', alt_a: 'Ônibus', alt_b: 'A pé', alt_c: 'Bicicleta', alt_d: 'Carro', gabarito: 'c', nivel: 1 },
    { codigo: 'LP01', enunciado: 'No texto: "O museu abre às 9h e fecha às 17h, de terça a domingo." Em que dia o museu está fechado?', alt_a: 'Quarta-feira', alt_b: 'Sábado', alt_c: 'Domingo', alt_d: 'Segunda-feira', gabarito: 'd', nivel: 1 },
    { codigo: 'LP01', enunciado: '"A temperatura máxima prevista para amanhã é de 32°C." Qual é a temperatura máxima prevista?', alt_a: '22°C', alt_b: '32°C', alt_c: '30°C', alt_d: '35°C', gabarito: 'b', nivel: 1 },
    { codigo: 'LP01', enunciado: 'Segundo o aviso: "Proibido estacionar neste local das 7h às 19h." Às 20h, é permitido estacionar?', alt_a: 'Não, é sempre proibido', alt_b: 'Sim, pois está fora do horário proibido', alt_c: 'Só aos finais de semana', alt_d: 'Apenas com autorização', gabarito: 'b', nivel: 1 },
    { codigo: 'LP01', enunciado: 'No bilhete: "Mãe, fui ao mercado com a Ana. Volto às 18h. — Pedro." Quem foi ao mercado?', alt_a: 'A mãe de Pedro', alt_b: 'Pedro sozinho', alt_c: 'Pedro e Ana', alt_d: 'Apenas Ana', gabarito: 'c', nivel: 1 },
    // LP02
    { codigo: 'LP02', enunciado: 'Na frase "Ele tinha um coração de pedra", a expressão "coração de pedra" significa:', alt_a: 'Uma pessoa muito generosa', alt_b: 'Uma pessoa muito insensível', alt_c: 'Uma pessoa muito corajosa', alt_d: 'Uma pessoa muito trabalhadora', gabarito: 'b', nivel: 1 },
    { codigo: 'LP02', enunciado: '"O aluno estava voando de alegria depois da prova." O sentido de "voando de alegria" é:', alt_a: 'O aluno estava triste', alt_b: 'O aluno estava muito feliz', alt_c: 'O aluno foi embora rapidamente', alt_d: 'O aluno estava cansado', gabarito: 'b', nivel: 1 },
    { codigo: 'LP02', enunciado: 'Em "Ela tem uma memória de elefante", o que isso significa?', alt_a: 'Ela é muito grande', alt_b: 'Ela é muito lenta', alt_c: 'Ela lembra de tudo muito bem', alt_d: 'Ela tem medo de animais', gabarito: 'c', nivel: 1 },
    { codigo: 'LP02', enunciado: '"O jogador engoliu o choro e continuou na partida." Qual o sentido de "engoliu o choro"?', alt_a: 'Chorou muito', alt_b: 'Ficou doente', alt_c: 'Conteve as lágrimas', alt_d: 'Saiu do jogo', gabarito: 'c', nivel: 1 },
    { codigo: 'LP02', enunciado: 'Na expressão "Não mexa em time que está ganhando", o conselho dado é:', alt_a: 'Mude sempre a equipe para melhorar', alt_b: 'Não altere o que está funcionando bem', alt_c: 'Times perdedores precisam de mudanças', alt_d: 'Nunca jogue em equipe', gabarito: 'b', nivel: 2 },
    // LP03
    { codigo: 'LP03', enunciado: 'Um texto fala sobre os malefícios do consumo excessivo de açúcar para a saúde. Qual é o tema central?', alt_a: 'Os benefícios da alimentação saudável', alt_b: 'Os problemas causados pelo excesso de açúcar', alt_c: 'O processo de produção do açúcar', alt_d: 'O consumo de alimentos industrializados', gabarito: 'b', nivel: 1 },
    { codigo: 'LP03', enunciado: 'Um poema descreve a saudade de uma pessoa que partiu. O tema central é:', alt_a: 'A alegria de novas amizades', alt_b: 'A viagem e a aventura', alt_c: 'A saudade e a ausência', alt_d: 'A natureza e suas belezas', gabarito: 'c', nivel: 1 },
    { codigo: 'LP03', enunciado: 'Um artigo discute o aumento do desmatamento e suas consequências climáticas. Qual tema central?', alt_a: 'O crescimento econômico do país', alt_b: 'Os efeitos do desmatamento no clima', alt_c: 'O trabalho dos ambientalistas', alt_d: 'A preservação de animais', gabarito: 'b', nivel: 1 },
    { codigo: 'LP03', enunciado: 'Um conto mostra um personagem que aprende a valorizar a amizade após perder um amigo. O tema é:', alt_a: 'A competição entre amigos', alt_b: 'O valor da amizade e da perda', alt_c: 'A aventura de dois jovens', alt_d: 'A importância dos estudos', gabarito: 'b', nivel: 2 },
    { codigo: 'LP03', enunciado: 'Uma reportagem aborda a falta de investimento em educação pública no Brasil. O tema central é:', alt_a: 'O sistema de saúde público', alt_b: 'A qualidade do ensino privado', alt_c: 'A crise na educação pública', alt_d: 'Os salários dos professores', gabarito: 'c', nivel: 2 },
    // LP04
    { codigo: 'LP04', enunciado: 'Um texto com o título "Modo de usar: tome 1 comprimido a cada 8 horas" tem como finalidade:', alt_a: 'Narrar uma história', alt_b: 'Dar instruções de uso', alt_c: 'Convencer o leitor', alt_d: 'Descrever um lugar', gabarito: 'b', nivel: 1 },
    { codigo: 'LP04', enunciado: 'Uma campanha com o slogan "Doe sangue, doe vida!" tem como finalidade:', alt_a: 'Informar sobre doenças', alt_b: 'Vender produtos médicos', alt_c: 'Persuadir as pessoas a doar sangue', alt_d: 'Narrar experiências pessoais', gabarito: 'c', nivel: 1 },
    { codigo: 'LP04', enunciado: 'Um artigo de jornal que relata um acidente de trânsito tem como finalidade principal:', alt_a: 'Entreter o leitor com ficção', alt_b: 'Informar sobre o acontecimento', alt_c: 'Ensinar como dirigir', alt_d: 'Convencer a comprar seguro', gabarito: 'b', nivel: 1 },
    { codigo: 'LP04', enunciado: 'Um poema sobre a beleza do pôr do sol tem como finalidade:', alt_a: 'Instruir o leitor', alt_b: 'Argumentar contra a poluição', alt_c: 'Expressar sentimentos e provocar emoção', alt_d: 'Informar sobre meteorologia', gabarito: 'c', nivel: 2 },
    { codigo: 'LP04', enunciado: 'Um editorial de jornal que defende a redução da maioridade penal tem como finalidade:', alt_a: 'Narrar casos criminais', alt_b: 'Apresentar opinião e argumentar', alt_c: 'Descrever o sistema penal', alt_d: 'Instruir sobre leis', gabarito: 'b', nivel: 2 },
    // LP05
    { codigo: 'LP05', enunciado: 'Uma charge mostra um político segurando uma vassoura sobre um monte de lixo. O texto não verbal sugere:', alt_a: 'O político é trabalhador', alt_b: 'O político está fazendo faxina nos problemas', alt_c: 'O político vende vassouras', alt_d: 'O país está limpo', gabarito: 'b', nivel: 2 },
    { codigo: 'LP05', enunciado: 'Uma propaganda mostra uma pessoa feliz segurando um produto e a frase "Seja feliz também!". O objetivo é:', alt_a: 'Informar sobre os ingredientes', alt_b: 'Associar o produto à felicidade para vender', alt_c: 'Mostrar problemas de saúde', alt_d: 'Narrar uma história pessoal', gabarito: 'b', nivel: 2 },
    { codigo: 'LP05', enunciado: 'Uma tirinha mostra um personagem com chuva em cima da cabeça sorrindo. O humor vem de:', alt_a: 'O personagem está molhado', alt_b: 'O contraste entre chuva e alegria', alt_c: 'A chuva é abundante', alt_d: 'O personagem tem guarda-chuva', gabarito: 'b', nivel: 2 },
    { codigo: 'LP05', enunciado: 'Um infográfico mostra setas apontando para diferentes partes de uma célula com legendas. Sua função é:', alt_a: 'Convencer o leitor', alt_b: 'Narrar um processo histórico', alt_c: 'Explicar visualmente a estrutura da célula', alt_d: 'Expressar sentimentos do autor', gabarito: 'c', nivel: 2 },
    { codigo: 'LP05', enunciado: 'Em uma história em quadrinhos, o personagem pensa algo diferente do que diz. Isso indica:', alt_a: 'Que o personagem está doente', alt_b: 'Ironia ou hipocrisia do personagem', alt_c: 'Que o personagem está feliz', alt_d: 'Um erro do autor', gabarito: 'b', nivel: 2 },
    // LP06
    { codigo: 'LP06', enunciado: '"Porque não houve chuva no verão, a colheita foi prejudicada." A causa do problema foi:', alt_a: 'A colheita ruim', alt_b: 'A falta de chuva', alt_c: 'O calor excessivo', alt_d: 'O trabalho dos agricultores', gabarito: 'b', nivel: 2 },
    { codigo: 'LP06', enunciado: '"O estudante não dormiu bem e, por isso, tirou nota baixa." Qual a relação entre as ideias?', alt_a: 'Oposição', alt_b: 'Comparação', alt_c: 'Causa e consequência', alt_d: 'Adição', gabarito: 'c', nivel: 2 },
    { codigo: 'LP06', enunciado: '"O desmatamento intenso levou ao aumento de queimadas e à seca na região." Identifique a consequência:', alt_a: 'O desmatamento intenso', alt_b: 'O aumento das queimadas e a seca', alt_c: 'A devastação das florestas', alt_d: 'A ação humana', gabarito: 'b', nivel: 2 },
    { codigo: 'LP06', enunciado: '"Por praticar esportes regularmente, ela mantém boa saúde." O conector "por" indica:', alt_a: 'Consequência', alt_b: 'Causa', alt_c: 'Oposição', alt_d: 'Condição', gabarito: 'b', nivel: 2 },
    { codigo: 'LP06', enunciado: '"Tanto estudou que se tornou o melhor da turma." Qual relação essa frase expressa?', alt_a: 'Concessão', alt_b: 'Comparação', alt_c: 'Causa e efeito com intensidade', alt_d: 'Oposição', gabarito: 'c', nivel: 2 },
    // LP07
    { codigo: 'LP07', enunciado: '"O desemprego subiu 3% no último trimestre" — esta afirmação é:', alt_a: 'Uma opinião', alt_b: 'Um fato verificável', alt_c: 'Uma suposição', alt_d: 'Uma hipótese', gabarito: 'b', nivel: 2 },
    { codigo: 'LP07', enunciado: '"Acredito que a educação pública brasileira precisa de mais investimentos" — essa afirmação é:', alt_a: 'Um fato', alt_b: 'Uma lei', alt_c: 'Uma opinião', alt_d: 'Uma estatística', gabarito: 'c', nivel: 2 },
    { codigo: 'LP07', enunciado: 'Em um texto argumentativo, o autor afirma: "Segundo pesquisa do IBGE, 70% dos jovens preferem cursos técnicos." Trata-se de:', alt_a: 'Opinião pessoal', alt_b: 'Dado de pesquisa (fato)', alt_c: 'Sugestão', alt_d: 'Hipótese', gabarito: 'b', nivel: 2 },
    { codigo: 'LP07', enunciado: '"Em minha visão, as redes sociais são prejudiciais aos adolescentes." Esta frase expressa:', alt_a: 'Um fato comprovado', alt_b: 'Um dado científico', alt_c: 'Uma opinião', alt_d: 'Uma lei', gabarito: 'c', nivel: 2 },
    { codigo: 'LP07', enunciado: '"A poluição do ar causou aumento de internações hospitalares por doenças respiratórias neste ano." Isso é:', alt_a: 'Uma opinião editorial', alt_b: 'Uma hipótese a ser verificada', alt_c: 'Um fato documentado', alt_d: 'Uma previsão futura', gabarito: 'c', nivel: 3 },
    // LP08
    { codigo: 'LP08', enunciado: 'Em "as folhas caíam como lágrimas do outono", o recurso usado é:', alt_a: 'Metáfora', alt_b: 'Hipérbole', alt_c: 'Comparação (símile)', alt_d: 'Ironia', gabarito: 'c', nivel: 2 },
    { codigo: 'LP08', enunciado: 'Em "Seus olhos são dois diamantes brilhantes", o recurso é:', alt_a: 'Símile', alt_b: 'Metáfora', alt_c: 'Hipérbole', alt_d: 'Personificação', gabarito: 'b', nivel: 2 },
    { codigo: 'LP08', enunciado: 'Em "Já te disse um milhão de vezes para estudar!", o efeito criado é de:', alt_a: 'Ironia', alt_b: 'Exagero para enfatizar (hipérbole)', alt_c: 'Comparação', alt_d: 'Eufemismo', gabarito: 'b', nivel: 2 },
    { codigo: 'LP08', enunciado: '"O vento sussurrava segredos entre as árvores." Qual recurso está presente?', alt_a: 'Hipérbole', alt_b: 'Ironia', alt_c: 'Personificação (prosopopeia)', alt_d: 'Antítese', gabarito: 'c', nivel: 2 },
    { codigo: 'LP08', enunciado: '"Que lindo dia!" — dito com chuva e tempestade. Esse recurso é:', alt_a: 'Metáfora', alt_b: 'Hipérbole', alt_c: 'Ironia', alt_d: 'Comparação', gabarito: 'c', nivel: 2 },
    // MT01
    { codigo: 'MT01', enunciado: 'Uma padaria vendeu 248 pães de manhã e 173 à tarde. Quantos pães foram vendidos no total?', alt_a: '401', alt_b: '421', alt_c: '411', alt_d: '431', gabarito: 'b', nivel: 1 },
    { codigo: 'MT01', enunciado: 'Um fazendeiro tem 360 galinhas e quer distribuí-las igualmente em 9 galinheiros. Quantas galinhas ficam em cada galinheiro?', alt_a: '30', alt_b: '40', alt_c: '45', alt_d: '50', gabarito: 'b', nivel: 1 },
    { codigo: 'MT01', enunciado: 'Qual o resultado de 15 × 12?', alt_a: '170', alt_b: '180', alt_c: '190', alt_d: '160', gabarito: 'b', nivel: 1 },
    { codigo: 'MT01', enunciado: 'Uma escola tem 450 alunos. Se cada turma tem 30 alunos, quantas turmas há na escola?', alt_a: '12', alt_b: '13', alt_c: '15', alt_d: '14', gabarito: 'c', nivel: 1 },
    { codigo: 'MT01', enunciado: 'Num estádio com 12.500 lugares, 9.847 estão ocupados. Quantos lugares estão vazios?', alt_a: '2.553', alt_b: '2.653', alt_c: '2.453', alt_d: '2.753', gabarito: 'b', nivel: 1 },
    // MT02
    { codigo: 'MT02', enunciado: 'Maria comeu 3/8 de uma pizza e João comeu 2/8. Que fração da pizza foi consumida?', alt_a: '4/8', alt_b: '5/8', alt_c: '6/8', alt_d: '1/2', gabarito: 'b', nivel: 1 },
    { codigo: 'MT02', enunciado: 'Qual é o valor de 0,5 + 0,25?', alt_a: '0,70', alt_b: '0,75', alt_c: '0,80', alt_d: '0,65', gabarito: 'b', nivel: 1 },
    { codigo: 'MT02', enunciado: 'Uma receita pede 1/2 xícara de leite. Se a receita for dobrada, quantas xícaras serão necessárias?', alt_a: '1 xícara', alt_b: '1 e 1/4', alt_c: '3/4', alt_d: '2 xícaras', gabarito: 'a', nivel: 1 },
    { codigo: 'MT02', enunciado: 'Ordene da menor para a maior: 0,3 / 1/4 / 0,27', alt_a: '1/4 < 0,27 < 0,3', alt_b: '0,27 < 1/4 < 0,3', alt_c: '0,3 < 0,27 < 1/4', alt_d: '0,27 < 0,3 < 1/4', gabarito: 'b', nivel: 2 },
    { codigo: 'MT02', enunciado: 'Uma barra de chocolate foi dividida em 12 partes iguais. Ana comeu 4 partes e Pedro 3. Que fração sobrou?', alt_a: '5/12', alt_b: '4/12', alt_c: '6/12', alt_d: '7/12', gabarito: 'a', nivel: 2 },
    // MT03
    { codigo: 'MT03', enunciado: 'Quantos lados tem um hexágono regular?', alt_a: '5', alt_b: '7', alt_c: '6', alt_d: '8', gabarito: 'c', nivel: 1 },
    { codigo: 'MT03', enunciado: 'Qual figura geométrica espacial tem uma base circular e um vértice?', alt_a: 'Cilindro', alt_b: 'Esfera', alt_c: 'Cone', alt_d: 'Pirâmide', gabarito: 'c', nivel: 1 },
    { codigo: 'MT03', enunciado: 'Um cubo tem quantas faces?', alt_a: '4', alt_b: '5', alt_c: '8', alt_d: '6', gabarito: 'd', nivel: 1 },
    { codigo: 'MT03', enunciado: 'Qual polígono tem todos os lados e ângulos iguais e 4 lados?', alt_a: 'Retângulo', alt_b: 'Losango', alt_c: 'Quadrado', alt_d: 'Trapézio', gabarito: 'c', nivel: 1 },
    { codigo: 'MT03', enunciado: 'Uma pirâmide de base quadrangular tem quantas faces triangulares?', alt_a: '3', alt_b: '5', alt_c: '4', alt_d: '6', gabarito: 'c', nivel: 2 },
    // MT04
    { codigo: 'MT04', enunciado: 'Um produto custa R$ 200,00 e está com 15% de desconto. Qual o preço final?', alt_a: 'R$ 185,00', alt_b: 'R$ 170,00', alt_c: 'R$ 160,00', alt_d: 'R$ 175,00', gabarito: 'b', nivel: 1 },
    { codigo: 'MT04', enunciado: 'Em uma sala de 30 alunos, 60% são meninas. Quantas meninas há?', alt_a: '16', alt_b: '18', alt_c: '20', alt_d: '15', gabarito: 'b', nivel: 1 },
    { codigo: 'MT04', enunciado: 'Um salário de R$ 2.000 teve um aumento de 10%. Qual o novo salário?', alt_a: 'R$ 2.100', alt_b: 'R$ 2.200', alt_c: 'R$ 2.150', alt_d: 'R$ 2.020', gabarito: 'b', nivel: 1 },
    { codigo: 'MT04', enunciado: '25 é quanto por cento de 200?', alt_a: '10%', alt_b: '12,5%', alt_c: '15%', alt_d: '20%', gabarito: 'b', nivel: 2 },
    { codigo: 'MT04', enunciado: 'Uma loja vende um item por R$ 120 com lucro de 20% sobre o custo. Qual foi o custo?', alt_a: 'R$ 96,00', alt_b: 'R$ 100,00', alt_c: 'R$ 110,00', alt_d: 'R$ 104,00', gabarito: 'b', nivel: 2 },
    // MT05
    { codigo: 'MT05', enunciado: 'Um gráfico de barras mostra: LP=25, MAT=30, CIE=20, HIS=15. Qual a disciplina mais estudada?', alt_a: 'Língua Portuguesa', alt_b: 'Ciências', alt_c: 'Matemática', alt_d: 'História', gabarito: 'c', nivel: 1 },
    { codigo: 'MT05', enunciado: 'Numa tabela, Pedro obteve 8, 7, 9 e 10 nas 4 provas. Qual sua média?', alt_a: '8,0', alt_b: '8,5', alt_c: '9,0', alt_d: '7,5', gabarito: 'b', nivel: 1 },
    { codigo: 'MT05', enunciado: 'Um gráfico de setor mostra 40% para A, 35% para B e 25% para C. Se o total é 200, quantos são de A?', alt_a: '70', alt_b: '80', alt_c: '90', alt_d: '60', gabarito: 'b', nivel: 2 },
    { codigo: 'MT05', enunciado: 'Numa tabela de frequência, o valor que aparece mais vezes chama-se:', alt_a: 'Média', alt_b: 'Mediana', alt_c: 'Moda', alt_d: 'Amplitude', gabarito: 'c', nivel: 1 },
    { codigo: 'MT05', enunciado: 'Dados os valores 4, 7, 8, 9, 12. Qual é a mediana?', alt_a: '7', alt_b: '9', alt_c: '8', alt_d: '8,5', gabarito: 'c', nivel: 2 },
    // MT06
    { codigo: 'MT06', enunciado: 'Resolva: 2x + 6 = 14. Qual o valor de x?', alt_a: '3', alt_b: '5', alt_c: '4', alt_d: '6', gabarito: 'c', nivel: 1 },
    { codigo: 'MT06', enunciado: 'Se 3x - 9 = 0, então x é igual a:', alt_a: '2', alt_b: '4', alt_c: '3', alt_d: '6', gabarito: 'c', nivel: 1 },
    { codigo: 'MT06', enunciado: 'Resolva a inequação: x + 5 > 11. A solução é:', alt_a: 'x > 5', alt_b: 'x > 6', alt_c: 'x < 6', alt_d: 'x ≥ 6', gabarito: 'b', nivel: 2 },
    { codigo: 'MT06', enunciado: 'Um número somado a 17 resulta em 42. Qual o número?', alt_a: '23', alt_b: '25', alt_c: '27', alt_d: '29', gabarito: 'b', nivel: 1 },
    { codigo: 'MT06', enunciado: 'Se 4(x - 3) = 20, qual o valor de x?', alt_a: '7', alt_b: '6', alt_c: '8', alt_d: '5', gabarito: 'c', nivel: 2 },
    // MT07
    { codigo: 'MT07', enunciado: 'Em um triângulo retângulo, os catetos medem 3 e 4 cm. Qual é a hipotenusa?', alt_a: '6 cm', alt_b: '5 cm', alt_c: '7 cm', alt_d: '4,5 cm', gabarito: 'b', nivel: 2 },
    { codigo: 'MT07', enunciado: 'Um triângulo retângulo tem catetos de 5 e 12. Qual a hipotenusa?', alt_a: '11', alt_b: '15', alt_c: '13', alt_d: '14', gabarito: 'c', nivel: 2 },
    { codigo: 'MT07', enunciado: 'A hipotenusa de um triângulo retângulo mede 10 e um cateto mede 6. Qual o outro cateto?', alt_a: '7', alt_b: '9', alt_c: '8', alt_d: '6', gabarito: 'c', nivel: 2 },
    { codigo: 'MT07', enunciado: 'O Teorema de Pitágoras afirma que, num triângulo retângulo: a² + b² é igual a:', alt_a: 'c² (hipotenusa ao quadrado)', alt_b: '2c', alt_c: 'a + b', alt_d: '(a + b)²', gabarito: 'a', nivel: 1 },
    { codigo: 'MT07', enunciado: 'Uma escada de 5 m apoia-se numa parede a 4 m de altura. Qual é a distância da base ao pé da parede?', alt_a: '2 m', alt_b: '3 m', alt_c: '4 m', alt_d: '1 m', gabarito: 'b', nivel: 2 },
    // MT08
    { codigo: 'MT08', enunciado: 'Na função f(x) = 2x + 3, qual o valor de f(5)?', alt_a: '11', alt_b: '13', alt_c: '15', alt_d: '10', gabarito: 'b', nivel: 2 },
    { codigo: 'MT08', enunciado: 'Uma função afim tem f(0) = 2 e f(1) = 5. Qual a taxa de variação (coeficiente angular)?', alt_a: '2', alt_b: '5', alt_c: '3', alt_d: '4', gabarito: 'c', nivel: 2 },
    { codigo: 'MT08', enunciado: 'Na função quadrática f(x) = x² - 4x + 4, qual é o vértice?', alt_a: '(2, 0)', alt_b: '(0, 4)', alt_c: '(-2, 0)', alt_d: '(4, 0)', gabarito: 'a', nivel: 2 },
    { codigo: 'MT08', enunciado: 'A função f(x) = -x + 6 é crescente ou decrescente?', alt_a: 'Crescente', alt_b: 'Decrescente', alt_c: 'Constante', alt_d: 'Não é uma função', gabarito: 'b', nivel: 2 },
    { codigo: 'MT08', enunciado: 'Para que valores de x a função f(x) = x² - 9 se anula?', alt_a: 'x = 3 apenas', alt_b: 'x = ±3', alt_c: 'x = ±9', alt_d: 'x = 9', gabarito: 'b', nivel: 2 },
  ]

  console.log('❓ Inserindo questões...')
  let questoesCount = 0
  for (const q of questoes) {
    const habId = habMap[q.codigo]
    if (!habId) { console.warn(`  Habilidade ${q.codigo} não encontrada`); continue }
    await supabase.from('questoes').insert({
      habilidade_id: habId,
      enunciado: q.enunciado,
      alternativa_a: q.alt_a,
      alternativa_b: q.alt_b,
      alternativa_c: q.alt_c,
      alternativa_d: q.alt_d,
      gabarito: q.gabarito,
      nivel_dificuldade: q.nivel,
      fonte: 'elaborada',
    })
    questoesCount++
  }
  console.log(`✅ ${questoesCount} questões inseridas`)

  // INSÍGNIAS
  console.log('🏆 Inserindo insígnias...')
  const insignias = [
    { nome: 'Primeiro Passo', descricao: 'Conclua sua primeira habilidade na trilha', icone_emoji: '👟', criterio: 'completar 1 habilidade', xp_bonus: 50 },
    { nome: 'Sequência Quente', descricao: 'Acerte 10 questões seguidas sem errar', icone_emoji: '🔥', criterio: 'acertar 10 questões seguidas', xp_bonus: 100 },
    { nome: 'Metade do Caminho', descricao: 'Conclua 50% de qualquer trilha', icone_emoji: '🗺️', criterio: 'concluir 50% da trilha', xp_bonus: 150 },
    { nome: 'Chegada', descricao: 'Conclua 100% de qualquer trilha', icone_emoji: '🏁', criterio: 'concluir 100% da trilha', xp_bonus: 300 },
    { nome: 'Mestre das Palavras', descricao: 'Conclua todas as habilidades de Língua Portuguesa', icone_emoji: '📖', criterio: 'concluir trilha de LP', xp_bonus: 500 },
    { nome: 'Calculista', descricao: 'Conclua todas as habilidades de Matemática', icone_emoji: '🔢', criterio: 'concluir trilha de matemática', xp_bonus: 500 },
    { nome: 'GPS Completo', descricao: 'Conclua as trilhas de LP e Matemática', icone_emoji: '🧭', criterio: 'concluir ambas as trilhas', xp_bonus: 1000 },
  ]
  await supabase.from('insignias').upsert(insignias, { onConflict: 'nome' })
  console.log('✅ Insígnias inseridas')

  // TURMAS DEMO
  console.log('🏫 Inserindo turmas demo...')
  const { data: turmasSeed } = await supabase
    .from('turmas')
    .upsert([
      { nome: '1ºA', ano_letivo: 2026, escola: 'CEGLB' },
      { nome: '2ºA', ano_letivo: 2026, escola: 'CEGLB' },
      { nome: '3ºA', ano_letivo: 2026, escola: 'CEGLB' },
    ], { onConflict: 'nome' })
    .select()
  console.log('✅ Turmas inseridas')

  // USUÁRIOS DEMO
  console.log('👥 Criando usuários demo...')
  const turma2A = turmasSeed?.find((t) => t.nome === '2ºA')

  const usuariosDemo = [
    { email: 'robison@gps.demo', nome: 'Prof. Robison Sá', role: 'professor' },
    { email: 'gestora@gps.demo', nome: 'Gestora Ana Paula', role: 'gestor' },
    { email: 'joao@gps.demo', nome: 'João Silva', role: 'estudante', turma_id: turma2A?.id },
    { email: 'maria@gps.demo', nome: 'Maria Oliveira', role: 'estudante', turma_id: turma2A?.id },
    { email: 'pedro@gps.demo', nome: 'Pedro Santos', role: 'estudante', turma_id: turma2A?.id },
  ]

  for (const u of usuariosDemo) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    const exists = existing?.users?.find((usr) => usr.email === u.email)

    if (!exists) {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'gps2026',
        email_confirm: true,
        user_metadata: { nome_completo: u.nome, role: u.role },
      })
      if (error) { console.warn(`  Erro ao criar ${u.email}:`, error.message); continue }

      if (newUser?.user) {
        await supabase.from('profiles').upsert({
          id: newUser.user.id,
          nome_completo: u.nome,
          role: u.role,
          turma_id: (u as { turma_id?: string }).turma_id ?? null,
          escola: 'CEGLB',
        })
        console.log(`  ✅ Criado: ${u.email}`)
      }
    } else {
      console.log(`  ⏩ Já existe: ${u.email}`)
    }
  }

  // Vincular professor à turma 2ºA
  const professorProfile = await supabase.from('profiles').select('id').eq('role', 'professor').single()
  if (professorProfile.data && turma2A) {
    await supabase.from('turmas').update({ professor_id: professorProfile.data.id }).in('nome', ['1ºA', '2ºA', '3ºA'])
  }

  // SEQUÊNCIAS DIDÁTICAS
  console.log('📋 Inserindo sequências didáticas...')
  const sequencias = habilidades.map((h) => ({
    habilidade_id: habMap[h.codigo],
    titulo: `Desenvolvendo ${h.codigo}: ${h.descricao.slice(0, 40)}...`,
    objetivo: `Desenvolver a habilidade de ${h.descricao.toLowerCase()} conforme a Matriz de Referência do SAEB para o Ensino Médio.`,
    materiais: 'Textos impressos ou projetados, lousa, atividades de fixação, marcadores coloridos.',
    etapas: `**Etapa 1 — Sensibilização (10 min)**\nInicie a aula com uma situação-problema do cotidiano relacionada a "${h.descricao}". Promova discussão em duplas.\n\n**Etapa 2 — Apresentação do conteúdo (15 min)**\nExplique o conceito central com exemplos práticos. Use a lousa para esquematizar as ideias principais. Conecte ao nível ${h.nivel_escala_saeb} da Escala SAEB.\n\n**Etapa 3 — Atividade guiada (15 min)**\nResolva 2-3 exercícios coletivamente, modelando o raciocínio esperado. Valorize a participação e o processo.\n\n**Etapa 4 — Prática individual e feedback (10 min)**\nEstudantes resolvem 2 exercícios individualmente. Corrija coletivamente. Registre quem precisa de reforço.`,
    tempo_estimado_minutos: 50,
    ano_escolar: 'EM',
  })).filter((s) => s.habilidade_id)

  await supabase.from('sequencias_didaticas').insert(sequencias)
  console.log(`✅ ${sequencias.length} sequências inseridas`)

  console.log('\n🎉 Seed concluído com sucesso!\n')
  console.log('Contas demo criadas:')
  console.log('  Professor: robison@gps.demo / gps2026')
  console.log('  Gestora:   gestora@gps.demo / gps2026')
  console.log('  Estudante: joao@gps.demo / gps2026')
  console.log('  Estudante: maria@gps.demo / gps2026')
  console.log('  Estudante: pedro@gps.demo / gps2026')
}

seed().catch(console.error)
