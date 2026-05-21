import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HabilidadeCard } from '@/components/HabilidadeCard'
import { XPBar } from '@/components/XPBar'
import { ArrowLeft, BookOpen, Calculator, Trophy } from 'lucide-react'
import type { Disciplina, TrilhaHabilidade } from '@/lib/types/database'

export default async function TrilhaPage({ params }: { params: { disciplina: string } }) {
  const { disciplina } = params

  if (disciplina !== 'lp' && disciplina !== 'matematica') notFound()

  const disc = disciplina as Disciplina
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trilha } = await supabase
    .from('trilhas')
    .select('*')
    .eq('estudante_id', user.id)
    .eq('disciplina', disc)
    .single()

  if (!trilha) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="text-xl font-bold text-foreground mb-2">Trilha não encontrada</h2>
        <p className="text-gray-500 mb-6">Você ainda não realizou o diagnóstico de {disc === 'lp' ? 'Língua Portuguesa' : 'Matemática'}.</p>
        <Link href="/estudante/diagnostico" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors">
          Fazer diagnóstico
        </Link>
      </div>
    )
  }

  const { data: trilhaHabilidades } = await supabase
    .from('trilha_habilidades')
    .select('*, habilidade:habilidades(*)')
    .eq('trilha_id', trilha.id)
    .order('id', { ascending: true })

  const habilidades = (trilhaHabilidades ?? []) as TrilhaHabilidade[]
  const concluidas = habilidades.filter((h) => h.status === 'concluida').length
  const emAndamento = habilidades.filter((h) => h.status === 'em_andamento').length
  const total = habilidades.length

  const titulo = disc === 'lp' ? 'Língua Portuguesa' : 'Matemática'
  const icone = disc === 'lp' ? <BookOpen className="w-5 h-5 text-blue-600" /> : <Calculator className="w-5 h-5 text-purple-600" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/estudante/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                {icone}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Trilha de {titulo}</h1>
                <p className="text-sm text-gray-400">
                  {concluidas}/{total} habilidades concluídas
                  {emAndamento > 0 && ` · ${emAndamento} em andamento`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-primary">{trilha.xp_acumulado}</div>
              <div className="text-xs text-gray-400">de {trilha.xp_total_possivel} XP</div>
            </div>
          </div>

          <div className="mt-5">
            <XPBar xp={trilha.xp_acumulado} maxXP={trilha.xp_total_possivel > 0 ? trilha.xp_total_possivel : 100} size="md" />
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{concluidas}</div>
          <div className="text-xs font-semibold text-green-600 mt-1">Concluídas</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{emAndamento}</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">Em andamento</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{total - concluidas - emAndamento}</div>
          <div className="text-xs font-semibold text-gray-400 mt-1">Não iniciadas</div>
        </div>
      </div>

      {/* Trilha completa */}
      {trilha.concluida && (
        <div className="bg-gradient-to-r from-accent to-yellow-400 rounded-2xl p-5 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-white" />
          <p className="font-bold text-white text-lg">Trilha concluída!</p>
          <p className="text-yellow-100 text-sm mt-1">Parabéns! Você dominou todas as habilidades desta disciplina.</p>
        </div>
      )}

      {/* Habilidades */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          Habilidades ({total})
        </h2>
        {habilidades.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhuma habilidade na trilha.</p>
            <p className="text-sm mt-1">Isso indica que você já domina todos os conteúdos desta disciplina!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habilidades.map((th, idx) => (
              <HabilidadeCard key={th.id} trilhaHabilidade={th} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
