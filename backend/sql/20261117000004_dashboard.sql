-- Dashboard: tudo calculado a partir dos registros (nada duplicado).
-- Views com security_invoker e funções SECURITY INVOKER => o RLS do chamador continua valendo.

create view public.discipline_overview with (security_invoker = true) as
select
  d.id, d.user_id, d.name, d.code, d.professor, d.semester, d.color,
  d.workload_hours, d.content_progress, d.is_archived,
  (select count(*) from public.tasks t where t.discipline_id = d.id)                         as tasks_total,
  (select count(*) from public.tasks t where t.discipline_id = d.id and t.status = 'done')   as tasks_done,
  (select count(*) from public.tasks t where t.discipline_id = d.id and t.status <> 'done')  as tasks_pending,
  (select min(e.exam_date) from public.exams e
     where e.discipline_id = d.id and e.score is null and e.exam_date >= now())              as next_exam_at,
  (select round(sum(e.score / e.max_score * 10 * e.weight) / sum(e.weight), 2)
     from public.exams e where e.discipline_id = d.id and e.score is not null)               as average_score
from public.disciplines d;

create view public.calendar_feed with (security_invoker = true) as
select user_id, 'task'::text as source, id as source_id, title, discipline_id,
       due_at as starts_at, null::timestamptz as ends_at, status::text as status
  from public.tasks where due_at is not null
union all
select user_id, 'exam', id, title, discipline_id, exam_date, null::timestamptz,
       case when score is null then 'scheduled' else 'graded' end
  from public.exams
union all
select user_id, 'study', id, title, discipline_id, starts_at,
       starts_at + make_interval(mins => duration_minutes), status::text
  from public.study_sessions
union all
select user_id, 'event', id, title, discipline_id, starts_at, ends_at, kind::text
  from public.calendar_events;

create function public.dashboard_summary() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  tz text; goal int; wk_start timestamptz; wk_end timestamptz; result jsonb;
begin
  select p.timezone, p.weekly_study_goal_minutes into tz, goal
    from public.profiles p where p.id = auth.uid();
  tz := coalesce(tz, 'America/Sao_Paulo');
  goal := coalesce(goal, 0);
  -- semana segunda→domingo no fuso do usuário
  wk_start := date_trunc('week', now() at time zone tz) at time zone tz;
  wk_end   := (date_trunc('week', now() at time zone tz) + interval '7 days') at time zone tz;

  select jsonb_build_object(
    'pending_count',        (select count(*) from public.tasks where status <> 'done'),
    'overdue_count',        (select count(*) from public.tasks where status <> 'done' and due_at < now()),
    'due_this_week_count',  (select count(*) from public.tasks
                              where status <> 'done' and due_at >= now() and due_at < wk_end),
    'next_exam',            (select to_jsonb(x) from (
                               select e.id, e.title, e.exam_date, e.discipline_id,
                                      d.name as discipline_name, d.color as discipline_color
                                 from public.exams e
                                 join public.disciplines d on d.id = e.discipline_id
                                where e.score is null and e.exam_date >= now()
                                order by e.exam_date limit 1) x),
    'week_studied_minutes', coalesce((select sum(duration_minutes) from public.study_sessions
                              where status = 'done' and starts_at >= wk_start and starts_at < wk_end), 0),
    'week_planned_minutes', coalesce((select sum(duration_minutes) from public.study_sessions
                              where status = 'planned' and starts_at >= wk_start and starts_at < wk_end), 0),
    'week_goal_minutes',    goal,
    'overall_average',      (select round(sum(score / max_score * 10 * weight) / sum(weight), 2)
                              from public.exams where score is not null),
    'graded_count',         (select count(*) from public.exams where score is not null)
  ) into result;
  return result;
end $$;

create function public.weekly_study_progress()
returns table (day date, done_minutes int, planned_minutes int)
language plpgsql stable security invoker set search_path = '' as $$
#variable_conflict use_column
declare tz text; wk_day date;
begin
  select p.timezone into tz from public.profiles p where p.id = auth.uid();
  tz := coalesce(tz, 'America/Sao_Paulo');
  wk_day := date_trunc('week', now() at time zone tz)::date;
  return query
    select g.d::date,
           coalesce(sum(s.duration_minutes) filter (where s.status = 'done'), 0)::int,
           coalesce(sum(s.duration_minutes) filter (where s.status = 'planned'), 0)::int
      from generate_series(wk_day, wk_day + 6, interval '1 day') as g(d)
      left join public.study_sessions s on (s.starts_at at time zone tz)::date = g.d::date
     group by g.d order by g.d;
end $$;

revoke all on function public.dashboard_summary(), public.weekly_study_progress() from public, anon;
grant execute on function public.dashboard_summary(), public.weekly_study_progress() to authenticated;
grant select on public.discipline_overview, public.calendar_feed to authenticated;
