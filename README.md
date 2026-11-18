# Studora — Guia Acadêmico Universitário

Organize disciplinas, atividades, avaliações, planejamento semanal de estudos, calendário e materiais de aula em um só lugar.

## Funcionalidades completas

- **Visão geral (`/`)**: Saudação contextual, KPIs do semestre, prioridades por urgência, próximas provas, entregas pendentes, progresso semanal e agenda de compromissos.
- **Disciplinas (`/disciplinas` e `/disciplinas/:subjectId`)**: Gestão de matérias do semestre com código, professor, sala, horário, carga horária, checklist de conteúdos estudados e abas de Trabalhos, Provas e Materiais.
- **Trabalhos e atividades (`/atividades`)**: Visões **Lista** (agrupada por urgência) e **Kanban** (`Pendente`, `Em andamento`, `Concluído`), filtros avançados e edição rápida.
- **Provas e notas (`/provas`)**: Próximas avaliações com medidor de preparação, histórico de notas e gráfico de desempenho ponderado por disciplina.
- **Calendário (`/calendario`)**: Visões **Mês**, **Semana**, **Dia** e **Agenda** unificando provas, prazos de entrega e blocos de estudo.
- **Planejamento de estudos (`/planejamento`)**: Meta semanal em horas, gráfico diário, sugestões automáticas de revisão para provas, gestão de sessões e **Timer de foco / Pomodoro** integrado.
- **Materiais (`/materiais`)**: Biblioteca central com upload por arrastar-e-soltar (PDF, DOCX, slides, planilhas, imagens) e links externos filtráveis por disciplina e formato.
- **Perfil e configurações (`/perfil`)**: Dados universitários, foto de perfil, meta semanal, início da semana, tema (`Claro` / `Escuro` / `Sistema`), notificações e exportação/importação de backup JSON.
- **Autenticação (`/login`, `/cadastro`, `/recuperar-senha`)**: Fluxo completo de login, criação de conta e redefinição de senha integrado ao Supabase Auth (com modo demonstração instantâneo quando executado localmente sem `.env`).

---

## Como rodar localmente

```bash
bun install
bun run dev
```

Para gerar o bundle estático compatível com **GitHub Pages**:

```bash
bun run build:pages
```

---

## Conectando o Backend Supabase (Opcional — funciona em modo local por padrão)

Os scripts SQL do banco de dados (com RLS completo, views e bucket privado `materials`) estão em `backend/sql/` e os serviços tipados em `src/backend/`:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor** do Supabase, execute os scripts de `backend/sql/` em ordem:
   - `20261117000001_schema.sql`
   - `20261117000002_rls.sql`
   - `20261117000003_storage.sql`
   - `20261117000004_dashboard.sql`
   - `20261117000005_ui_alignment.sql`
3. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Para **GitHub Pages**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em *Settings → Secrets and variables → Actions* no repositório e selecione **GitHub Actions** como fonte em *Settings → Pages*.
