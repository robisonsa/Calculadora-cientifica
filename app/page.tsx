import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BookOpen, ChevronRight, Star, Users, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="GPS Logo" width={40} height={44} className="drop-shadow-sm" />
            <div>
              <span className="text-xl font-bold text-foreground">GPS</span>
              <span className="text-xs text-primary block -mt-1">CEGLB · Porto da Folha</span>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-800 transition-colors shadow-sm"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-green-700 to-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
            Hackathon Escolar CEGLB 2025
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Sua rota para o<br />
            <span className="text-accent">SAEB 2025</span>
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Diagnóstico inteligente, trilhas personalizadas e gamificação para você ir mais longe
            no SAEB/SAESE. Aprenda no seu ritmo, conquiste insígnias, alcance o topo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-accent text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Começar Agora <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#como-funciona"
              className="bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              Como Funciona
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-green-100 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '16', label: 'Habilidades SAEB', icon: '🎯' },
            { value: '80+', label: 'Questões no banco', icon: '📝' },
            { value: '7', label: 'Insígnias para ganhar', icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">Como funciona o GPS</h2>
          <p className="text-center text-gray-500 mb-12">Quatro etapas simples para você chegar mais longe</p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Diagnóstico',
                desc: 'Responda 20 questões e descubra em qual nível da Escala SAEB você está em LP e Matemática.',
                color: 'bg-blue-50 border-blue-200',
              },
              {
                step: '02',
                icon: '🗺️',
                title: 'Trilha Pessoal',
                desc: 'O sistema cria automaticamente sua trilha personalizada com as habilidades que você precisa desenvolver.',
                color: 'bg-yellow-50 border-yellow-200',
              },
              {
                step: '03',
                icon: '⚡',
                title: 'Pratique',
                desc: 'Resolva atividades no seu ritmo. Cada habilidade concluída rende XP e avança você na trilha.',
                color: 'bg-green-50 border-green-200',
              },
              {
                step: '04',
                icon: '🏆',
                title: 'Conquiste',
                desc: 'Ganhe insígnias, acumule XP e veja seu progresso real em direção ao SAEB.',
                color: 'bg-purple-50 border-purple-200',
              },
            ].map((item) => (
              <div key={item.step} className={`${item.color} border rounded-2xl p-6 text-center`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-gray-400 mb-1">PASSO {item.step}</div>
                <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfis */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">Para toda a comunidade escolar</h2>
          <p className="text-center text-gray-500 mb-12">Ferramentas específicas para cada perfil</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-white" />,
                title: 'Estudantes',
                color: 'bg-secondary',
                items: [
                  'Diagnóstico personalizado',
                  'Trilha adaptada ao seu nível',
                  'XP e insígnias gamificados',
                  'Relatório de evolução',
                ],
              },
              {
                icon: <Users className="w-8 h-8 text-white" />,
                title: 'Professores',
                color: 'bg-primary',
                items: [
                  'Painel de turmas em tempo real',
                  'Relatório individual por estudante',
                  'Sequências didáticas prontas',
                  'Filtros por nível de proficiência',
                ],
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-white" />,
                title: 'Gestores',
                color: 'bg-accent',
                items: [
                  'Dashboard macro da escola',
                  'Ranking de turmas por avanço',
                  'Mapa de calor de habilidades',
                  'Exportação de relatórios em PDF',
                ],
              },
            ].map((perfil) => (
              <div key={perfil.title} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className={`${perfil.color} p-6 text-white flex items-center gap-3`}>
                  <div className="bg-white/20 p-2 rounded-xl">{perfil.icon}</div>
                  <h3 className="text-xl font-bold">{perfil.title}</h3>
                </div>
                <ul className="p-6 space-y-3">
                  {perfil.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insígnias */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Conquiste insígnias</h2>
          <p className="text-gray-500 mb-10">Cada conquista é um passo a mais na sua jornada de aprendizado</p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { emoji: '👟', nome: 'Primeiro Passo' },
              { emoji: '🔥', nome: 'Sequência Quente' },
              { emoji: '🗺️', nome: 'Metade do Caminho' },
              { emoji: '🏁', nome: 'Chegada' },
              { emoji: '📖', nome: 'Mestre das Palavras' },
              { emoji: '🔢', nome: 'Calculista' },
              { emoji: '🧭', nome: 'GPS Completo' },
            ].map((insignia) => (
              <div
                key={insignia.nome}
                className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{insignia.emoji}</span>
                <span className="text-xs font-semibold text-gray-600 text-center">{insignia.nome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Pronto para traçar sua rota?</h2>
          <p className="text-green-100 mb-8 text-lg">
            Entre com suas credenciais do CEGLB e comece seu diagnóstico agora mesmo.
          </p>
          <Link
            href="/login"
            className="bg-accent text-foreground px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg inline-flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Iniciar Diagnóstico
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/60 py-8 px-4 text-center text-sm">
        <div className="max-w-4xl mx-auto">
          <p className="font-semibold text-white mb-1">
            📍 GPS — Gerenciador de Preparação para o SAEB/SAESE
          </p>
          <p>Centro de Excelência Governador Lourival Baptista — Porto da Folha, SE</p>
          <p className="mt-2 text-white/40">Hackathon Escolar CEGLB 2025 · Desenvolvido com Next.js + Supabase</p>
        </div>
      </footer>
    </div>
  )
}
