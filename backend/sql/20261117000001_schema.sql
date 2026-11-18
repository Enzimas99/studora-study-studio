-- Studora: schema base. Todas as tabelas privadas têm user_id (dono do registro).

create type public.task_status    as enum ('todo', 'in_progress', 'done');
create type public.task_priority  as enum ('low', 'medium', 'high');
create type public.study_status   as enum ('planned', 'done', 'skipped');
create type public.material_kind  as enum ('file', 'link');
create type public.event_kind     as enum ('event', 'class', 'other');

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create function public.is_valid_timezone(tz text) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = tz)
$$;

-- PROFILES (1:1 com auth.users) -------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  course text check (char_length(course) <= 120),
  current_period text check (char_length(current_period) <= 40),
  avatar_url text check (char_length(avatar_url) <= 500),
  timezone text not null default 'America/Sao_Paulo' check (public.is_valid_timezone(timezone)),
  weekly_study_goal_minutes int not null default 600 check (weekly_study_goal_minutes between 0 and 10080),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'full_name', 120), ''));
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- DISCIPLINES --------------------------------------------------------------
create table public.disciplines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  code text check (char_length(code) <= 30),
  professor text check (char_length(professor) <= 120),
  semester text check (char_length(semester) <= 20),            -- ex.: '2026.2'
  color text not null default '#3B6FD4' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  workload_hours int check (workload_hours between 0 and 2000),
  content_progress smallint not null default 0 check (content_progress between 0 and 100),
  notes text check (char_length(notes) <= 5000),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)  -- alvo das FKs compostas (impede referência a disciplina de outro usuário)
);
create index disciplines_user_semester_idx on public.disciplines (user_id, semester);

-- TASKS --------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  discipline_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 5000),
  due_at timestamptz,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (discipline_id, user_id) references public.disciplines (id, user_id) on delete cascade
);
create index tasks_user_pending_due_idx on public.tasks (user_id, due_at) where status <> 'done';
create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_discipline_idx on public.tasks (discipline_id);

create function public.tasks_set_completed_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'done' then
    if tg_op = 'INSERT' then new.completed_at := coalesce(new.completed_at, now());
    elsif old.status <> 'done' then new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end $$;
create trigger tasks_completed_at before insert or update on public.tasks
  for each row execute function public.tasks_set_completed_at();

-- EXAMS (provas e avaliações; nota nula = ainda não corrigida) ---------------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  discipline_id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  exam_date timestamptz not null,
  weight numeric(5,2) not null default 1 check (weight > 0),
  max_score numeric(5,2) not null default 10 check (max_score > 0),
  score numeric(5,2) check (score >= 0),
  prep_progress smallint not null default 0 check (prep_progress between 0 and 100),
  notes text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (score is null or score <= max_score),
  foreign key (discipline_id, user_id) references public.disciplines (id, user_id) on delete cascade
);
create index exams_user_date_idx on public.exams (user_id, exam_date);
create index exams_discipline_idx on public.exams (discipline_id);

-- STUDY_SESSIONS -----------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  discipline_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  starts_at timestamptz not null,
  duration_minutes int not null check (duration_minutes between 1 and 1440),
  status public.study_status not null default 'planned',
  notes text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (discipline_id, user_id) references public.disciplines (id, user_id)
    on delete set null (discipline_id)
);
create index study_user_start_idx on public.study_sessions (user_id, starts_at);
create index study_discipline_idx on public.study_sessions (discipline_id);

-- MATERIALS (arquivo no Storage ou link) -------------------------------------
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  discipline_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  kind public.material_kind not null,
  url text check (url ~* '^https?://' and char_length(url) <= 2000),
  storage_path text,
  file_name text check (char_length(file_name) <= 255),
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'link' and url is not null and storage_path is null) or
    (kind = 'file' and storage_path is not null and url is null
       and storage_path like user_id::text || '/%')
  ),
  foreign key (discipline_id, user_id) references public.disciplines (id, user_id)
    on delete set null (discipline_id)
);
create index materials_user_discipline_idx on public.materials (user_id, discipline_id);

-- CALENDAR_EVENTS (apenas compromissos avulsos; o resto vem da view calendar_feed)
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  discipline_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  kind public.event_kind not null default 'event',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  foreign key (discipline_id, user_id) references public.disciplines (id, user_id)
    on delete set null (discipline_id)
);
create index events_user_start_idx on public.calendar_events (user_id, starts_at);

-- updated_at ---------------------------------------------------------------
do $$ declare t text; begin
  foreach t in array array['profiles','disciplines','tasks','exams','study_sessions','materials','calendar_events'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
