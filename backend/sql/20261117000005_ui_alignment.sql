-- Alinhamento completo entre o schema Supabase e a interface do Studora:
-- adiciona campos visuais de disciplinas (horário, sala, checklist de tópicos),
-- avaliações (conteúdos cobrados, local) e perfil (universidade, matrícula, início da semana, notificações).

alter table public.profiles
  add column if not exists university text check (char_length(university) <= 160),
  add column if not exists student_id text check (char_length(student_id) <= 40),
  add column if not exists week_starts_on smallint not null default 1 check (week_starts_on in (0, 1)),
  add column if not exists notifications jsonb not null default '{"deadlines":true,"exams":true,"studyReminders":true,"weeklyReport":false,"email":true}'::jsonb;

alter table public.disciplines
  add column if not exists schedule text check (char_length(schedule) <= 120),
  add column if not exists room text check (char_length(room) <= 80),
  add column if not exists topics jsonb not null default '[]'::jsonb;

alter table public.exams
  add column if not exists topics text[] not null default '{}',
  add column if not exists location text check (char_length(location) <= 120);
