-- RLS em todas as tabelas privadas + privilégios mínimos.

alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Sem INSERT/DELETE: o perfil nasce por trigger e some em cascata com a conta.

do $$ declare t text; begin
  foreach t in array array['disciplines','tasks','exams','study_sessions','materials','calendar_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$create policy owner_all on public.%I for all to authenticated
      using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))$p$, t);
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on
  public.disciplines, public.tasks, public.exams,
  public.study_sessions, public.materials, public.calendar_events to authenticated;
