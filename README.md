# 📍 GPS — Gerenciador de Preparação para o SAEB/SAESE

Sistema web gamificado de diagnóstico, trilhas personalizadas e relatórios pedagógicos alinhado às **Matrizes de Referência do SAEB** (Língua Portuguesa e Matemática).

Desenvolvido para o **Hackathon Escolar do CEGLB** — Centro de Excelência Governador Lourival Baptista, Porto da Folha, SE.

---

## Stack

| Tecnologia | Uso |
|---|---|
| **Next.js 14** | Framework React com App Router e Server Actions |
| **TypeScript** | Tipagem estática |
| **Supabase** | Banco de dados PostgreSQL + Autenticação |
| **Tailwind CSS 3** | Estilização |
| **Lucide React** | Ícones |
| **Vercel** | Deploy |

---

## Funcionalidades

### Estudantes
- Diagnóstico inicial (20 questões) em LP e Matemática
- Trilha personalizada gerada automaticamente
- Atividades por habilidade com feedback imediato
- Sistema de XP e insígnias gamificadas
- Relatório de progresso individual

### Professores
- Painel de turmas com visão geral
- Relatório individual de cada estudante
- Biblioteca de sequências didáticas prontas
- Filtros por disciplina e status

### Gestores
- Dashboard macro da escola
- Ranking de turmas por avanço
- Mapa de calor de habilidades (índice de lacuna)
- Exportação de relatórios

---

## Como rodar localmente

### 1. Clone e instale dependências

```bash
git clone https://github.com/robisonsa/calculadora-cientifica
cd calculadora-cientifica
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute os arquivos em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
3. Copie as chaves do projeto em **Project Settings > API**

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Execute o seed (dados demo)

```bash
npm run seed
```

Isso cria:
- 16 habilidades (8 LP + 8 Matemática)
- 80 questões (5 por habilidade)
- 7 insígnias
- 3 turmas demo (1ºA, 2ºA, 3ºA)
- 5 usuários demo
- 16 sequências didáticas

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Contas Demo

| Perfil | Email | Senha |
|---|---|---|
| Professor | robison@gps.demo | gps2025 |
| Gestora | gestora@gps.demo | gps2025 |
| Estudante | joao@gps.demo | gps2025 |
| Estudante | maria@gps.demo | gps2025 |
| Estudante | pedro@gps.demo | gps2025 |

---

## Deploy na Vercel

1. Importe o repositório em [vercel.com](https://vercel.com)
2. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático a cada push

---

## Arquitetura

```
app/
├── page.tsx                    # Landing page
├── login/page.tsx              # Autenticação
├── estudante/
│   ├── dashboard/              # Dashboard com XP e trilhas
│   ├── diagnostico/            # Quiz inicial (20 questões)
│   ├── trilha/[disciplina]/    # Mapa visual da trilha
│   ├── atividade/[id]/         # Resolução de atividades
│   └── relatorio/              # Relatório individual
├── professor/
│   ├── turmas/                 # Lista de turmas
│   ├── turmas/[id]/            # Detalhamento da turma
│   ├── estudante/[id]/         # Relatório do estudante
│   └── sequencias/             # Biblioteca didática
└── gestor/
    ├── dashboard/              # Painel macro
    ├── turmas/                 # Ranking de turmas
    ├── habilidades/            # Mapa de calor
    └── relatorios/             # Exportações
```

---

## Regras de Negócio

- Diagnóstico deve ser feito antes de acessar o dashboard
- Trilha é gerada automaticamente após o diagnóstico
- XP concedido apenas na primeira conclusão de cada habilidade (≥ 4/5 acertos)
- Sequências didáticas visíveis apenas para professores e gestores
- Professores só veem estudantes de suas turmas; gestores veem tudo

---

Hackathon Escolar CEGLB 2025 · Desenvolvido com Next.js + Supabase
