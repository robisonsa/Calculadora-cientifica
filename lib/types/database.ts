export type UserRole = 'estudante' | 'professor' | 'gestor'
export type Disciplina = 'lp' | 'matematica'
export type HabilidadeStatus = 'nao_iniciada' | 'em_andamento' | 'concluida'
export type Gabarito = 'a' | 'b' | 'c' | 'd'

export interface Profile {
  id: string
  nome_completo: string
  role: UserRole
  turma_id: string | null
  escola: string
  created_at: string
}

export interface Turma {
  id: string
  nome: string
  ano_letivo: number
  escola: string
  professor_id: string
  created_at: string
}

export interface Habilidade {
  id: string
  codigo: string
  descricao: string
  disciplina: Disciplina
  eixo: string
  nivel_escala_saeb: number
}

export interface Questao {
  id: string
  habilidade_id: string
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  gabarito: Gabarito
  nivel_dificuldade: number
  fonte: string
}

export interface Diagnostico {
  id: string
  estudante_id: string
  turma_id: string | null
  disciplina: Disciplina
  data_aplicacao: string
  concluido: boolean
  nivel_identificado: number | null
}

export interface RespostaDiagnostico {
  id: string
  diagnostico_id: string
  questao_id: string
  resposta_estudante: Gabarito | null
  correta: boolean
  habilidade_id: string
}

export interface Trilha {
  id: string
  estudante_id: string
  disciplina: Disciplina
  criada_em: string
  concluida: boolean
  xp_total_possivel: number
  xp_acumulado: number
}

export interface TrilhaHabilidade {
  id: string
  trilha_id: string
  habilidade_id: string
  status: HabilidadeStatus
  tentativas: number
  acertos: number
  xp_conquistado: number
  habilidade?: Habilidade
}

export interface Insignia {
  id: string
  nome: string
  descricao: string
  icone_emoji: string
  criterio: string
  xp_bonus: number
}

export interface EstudanteInsignia {
  id: string
  estudante_id: string
  insignia_id: string
  conquistada_em: string
  insignia?: Insignia
}

export interface SequenciaDidatica {
  id: string
  habilidade_id: string
  titulo: string
  objetivo: string
  materiais: string
  etapas: string
  tempo_estimado_minutos: number
  ano_escolar: string
  habilidade?: Habilidade
}
