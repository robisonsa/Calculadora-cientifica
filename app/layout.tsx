import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GPS — Gerenciador de Preparação para o SAEB',
  description: 'Sistema gamificado de diagnóstico e trilhas personalizadas para o SAEB/SAESE. CEGLB — Porto da Folha, SE.',
  icons: { icon: '/logo.svg', apple: '/logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
