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

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="estudante" nome={profile.nome_completo} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
