-- Rode no SQL Editor do Supabase (tudo é desfeito no final com ROLLBACK).
-- Qualquer falha lança "FALHA: ..."; sucesso imprime NOTICE 'RLS OK'.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@test.local');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
insert into public.disciplines (id, name) values ('00000000-0000-0000-0000-0000000000d1', 'Disciplina de A');
insert into public.tasks (title, discipline_id) values ('Tarefa de A', '00000000-0000-0000-0000-0000000000d1');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$
declare n int;
begin
  if (select count(*) from public.disciplines) <> 0 then raise exception 'FALHA: B lê disciplinas de A'; end if;
  if (select count(*) from public.tasks) <> 0 then raise exception 'FALHA: B lê tarefas de A'; end if;

  update public.disciplines set name = 'hack'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHA: B alterou dados de A'; end if;
  delete from public.disciplines; get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHA: B apagou dados de A'; end if;

  begin
    insert into public.disciplines (user_id, name) values ('00000000-0000-0000-0000-0000000000a1', 'x');
    raise exception 'FALHA: B inseriu como A';
  exception when insufficient_privilege then null; end;

  begin
    insert into public.tasks (title, discipline_id) values ('x', '00000000-0000-0000-0000-0000000000d1');
    raise exception 'FALHA: B referenciou disciplina de A';
  exception when foreign_key_violation then null; end;

  raise notice 'RLS OK';
end $$;
rollback;
