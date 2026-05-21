import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'

export default async function EstudanteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'estudante') redirect('/')

  // Buscar XP total das trilhas
  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('xp_acumulado')
    .eq('estudante_id', user.id)
  const xpTotal = trilhas?.reduce((s, t) => s + (t.xp_acumulado ?? 0), 0) ?? 0

  const anoLabel: Record<string, string> = { '2EF': '2º Ano EF', '5EF': '5º Ano EF', '9EF': '9º Ano EF' }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        role="estudante"
        nome={profile.nome_completo}
        xp={xpTotal}
        anoEscolar={profile.ano_escolar ? anoLabel[profile.ano_escolar] : undefined}
      />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
