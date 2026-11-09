-- ShiningBulbs Studio — sezione Task (task con sotto-task assegnabili).
-- Da eseguire UNA volta nel SQL Editor di un database già creato con database.sql.
-- Per una nuova installazione non serve: database.sql include già questa tabella.
begin;

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  parent_id uuid references public.todos(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 200),
  notes text not null default '' check (length(notes) <= 4000),
  done boolean not null default false,
  owner_id uuid references public.members(id) on delete set null, -- null = entrambi
  due_date date,
  position integer not null default 0,
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);
create index on public.todos(project_id);
create index on public.todos(parent_id);
create index on public.todos(owner_id);

alter table public.todos enable row level security;
revoke all on public.todos from anon, authenticated;
grant select, insert, update, delete on public.todos to authenticated;
create policy workspace_access on public.todos for all to authenticated
  using ((select public.is_member())) with check ((select public.is_member()));
create trigger stamp_record before insert or update on public.todos
  for each row execute function public.stamp_record();
alter table public.todos replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'todos') then
    alter publication supabase_realtime add table public.todos;
  end if;
end;
$$;
commit;
