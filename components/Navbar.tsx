'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Home, BookOpen, Users, BarChart2, Map, Award, Zap } from 'lucide-react'
import type { UserRole } from '@/lib/types/database'

interface NavbarProps {
  role: UserRole
  nome: string
  xp?: number
  anoEscolar?: string
}

const navLinks: Record<UserRole, { href: string; label: string; icon: React.ReactNode }[]> = {
  estudante: [
    { href: '/estudante/dashboard',    label: 'Início',    icon: <Home className="w-4 h-4" /> },
    { href: '/estudante/trilha/lp',    label: 'LP',        icon: <BookOpen className="w-4 h-4" /> },
    { href: '/estudante/trilha/matematica', label: 'MAT',  icon: <Map className="w-4 h-4" /> },
    { href: '/estudante/relatorio',    label: 'Relatório', icon: <BarChart2 className="w-4 h-4" /> },
  ],
  professor: [
    { href: '/professor/turmas',    label: 'Turmas',     icon: <Users className="w-4 h-4" /> },
    { href: '/professor/sequencias',label: 'Sequências', icon: <BookOpen className="w-4 h-4" /> },
  ],
  gestor: [
    { href: '/gestor/dashboard',   label: 'Dashboard',  icon: <Home className="w-4 h-4" /> },
    { href: '/gestor/turmas',      label: 'Turmas',     icon: <Users className="w-4 h-4" /> },
    { href: '/gestor/habilidades', label: 'Habilidades',icon: <Award className="w-4 h-4" /> },
    { href: '/gestor/relatorios',  label: 'Relatórios', icon: <BarChart2 className="w-4 h-4" /> },
  ],
}

function calcLevel(xp: number) {
  if (xp >= 1500) return { level: 5, name: 'Mestre GPS', emoji: '🧠' }
  if (xp >= 800)  return { level: 4, name: 'Especialista', emoji: '🎯' }
  if (xp >= 400)  return { level: 3, name: 'Praticante', emoji: '⚡' }
  if (xp >= 150)  return { level: 2, name: 'Explorador', emoji: '🔭' }
  return { level: 1, name: 'Iniciante', emoji: '🌱' }
}

export function Navbar({ role, nome, xp = 0, anoEscolar }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const lvl = calcLevel(xp)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.svg" alt="GPS Logo" width={34} height={38} className="drop-shadow-sm" />
          <div className="hidden sm:block">
            <span className="font-black text-foreground text-base">GPS</span>
            <span className="text-xs text-gray-400 block -mt-0.5">CEGLB</span>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks[role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                pathname.startsWith(link.href)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-foreground'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="flex items-center gap-2 shrink-0">
          {role === 'estudante' && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{xp.toLocaleString('pt-BR')} XP</span>
              <span className="text-xs text-amber-400">·</span>
              <span className="text-xs font-semibold text-amber-600">{lvl.emoji} Nv.{lvl.level}</span>
            </div>
          )}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-foreground">{nome.split(' ')[0]}</span>
            {anoEscolar && <span className="text-[10px] text-gray-400">{anoEscolar}</span>}
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav — estudante */}
      {role === 'estudante' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
          {navLinks.estudante.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <span className={`p-1.5 rounded-xl ${pathname.startsWith(link.href) ? 'bg-green-100' : ''}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
      {/* Spacer for mobile bottom nav */}
      {role === 'estudante' && <div className="md:hidden h-16" />}

      {/* Desktop non-estudante mobile nav */}
      {role !== 'estudante' && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
          {navLinks[role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                pathname.startsWith(link.href) ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
