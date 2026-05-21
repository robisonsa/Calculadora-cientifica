'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, LogOut, Home, BookOpen, Users, BarChart2, Map, Award } from 'lucide-react'
import type { UserRole } from '@/lib/types/database'

interface NavbarProps {
  role: UserRole
  nome: string
}

const navLinks: Record<UserRole, { href: string; label: string; icon: React.ReactNode }[]> = {
  estudante: [
    { href: '/estudante/dashboard', label: 'Início', icon: <Home className="w-4 h-4" /> },
    { href: '/estudante/trilha/lp', label: 'LP', icon: <BookOpen className="w-4 h-4" /> },
    { href: '/estudante/trilha/matematica', label: 'Matemática', icon: <Map className="w-4 h-4" /> },
    { href: '/estudante/relatorio', label: 'Relatório', icon: <BarChart2 className="w-4 h-4" /> },
  ],
  professor: [
    { href: '/professor/turmas', label: 'Turmas', icon: <Users className="w-4 h-4" /> },
    { href: '/professor/sequencias', label: 'Sequências', icon: <BookOpen className="w-4 h-4" /> },
  ],
  gestor: [
    { href: '/gestor/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/gestor/turmas', label: 'Turmas', icon: <Users className="w-4 h-4" /> },
    { href: '/gestor/habilidades', label: 'Habilidades', icon: <Award className="w-4 h-4" /> },
    { href: '/gestor/relatorios', label: 'Relatórios', icon: <BarChart2 className="w-4 h-4" /> },
  ],
}

const roleLabel: Record<UserRole, string> = {
  estudante: 'Estudante',
  professor: 'Professor',
  gestor: 'Gestor',
}

const roleColor: Record<UserRole, string> = {
  estudante: 'text-blue-600 bg-blue-50',
  professor: 'text-green-600 bg-green-50',
  gestor: 'text-purple-600 bg-purple-50',
}

export function Navbar({ role, nome }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-xl shadow-sm">
            📍
          </div>
          <div>
            <span className="font-bold text-foreground text-base">GPS</span>
            <span className="text-xs text-gray-400 block -mt-0.5">CEGLB</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks[role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {nome.split(' ')[0]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[role]}`}>
              {roleLabel[role]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {navLinks[role].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              pathname.startsWith(link.href)
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
