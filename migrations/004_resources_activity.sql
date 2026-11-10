-- ShiningBulbs Studio — Risorse per progetto e Cronologia delle attività.
-- Da eseguire nel SQL Editor dopo database.sql (richiede la tabella todos). Si può rieseguire.
begin;

-- ===== Risorse: link utili per ogni progetto (repository, Figma, store…). Solo link, niente password.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  url text not null check (url ~ '^https?://' and length(url) <= 2000),
  kind text not null default 'other' check (kind in ('repo','design','store','docs','folder','other')),
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resources_project_idx on public.resources(project_id);
alter table public.resources enable row level security;
revoke all on public.resources from anon, authenticated;
grant select, insert, update, delete on public.resources to authenticated;
drop policy if exists workspace_access on public.resources;
create policy workspace_access on public.resources for all to authenticated
  using ((select public.is_member())) with check ((select public.is_member()));
drop trigger if exists stamp_record on public.resources;
create trigger stamp_record before insert or update on public.resources
  for each row execute function public.stamp_record();
alter table public.resources replica identity full;

-- ===== Cronologia: scritta solo dal database, il browser può soltanto leggerla.
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.members(id) on delete cascade,
  verb text not null,
  title text not null,
  context text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists activity_created_idx on public.activity(created_at desc);
alter table public.activity enable row level security;
revoke all on public.activity from anon, authenticated;
grant select on public.activity to authenticated;
drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity for select to authenticated using ((select public.is_member()));

create or replace function public.log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  v text; t text; ctx text := '';
  par public.todos; who text;
begin
  -- Ignora le operazioni senza utente e quelle innescate da altri trigger.
  if actor is null or pg_trigger_depth() > 1 then return null; end if;

  if TG_TABLE_NAME = 'todos' then
    if TG_OP = 'DELETE' then
      -- Eliminata a cascata insieme al progetto o alla task principale: non serve una riga in più.
      if old.project_id is not null and not exists (select 1 from public.projects where id = old.project_id) then return null; end if;
      if old.parent_id is not null and not exists (select 1 from public.todos where id = old.parent_id) then return null; end if;
      t := old.title; v := case when old.parent_id is null then 'ha eliminato la task' else 'ha eliminato il passo' end;
      if old.parent_id is not null then select * into par from public.todos where id = old.parent_id; ctx := coalesce(par.title, ''); end if;
    else
      t := new.title;
      if new.parent_id is not null then select * into par from public.todos where id = new.parent_id; ctx := coalesce(par.title, ''); end if;
      if new.parent_id is null then select coalesce(name, '') into ctx from public.projects where id = new.project_id; ctx := coalesce(nullif(ctx, ''), 'Studio · generale'); end if;
      if TG_OP = 'INSERT' then
        -- I passi scritti insieme alla task non generano una riga ciascuno.
        if new.parent_id is not null and par.created_at > now() - interval '1 minute' then return null; end if;
        v := case when new.parent_id is null then 'ha creato la task' else 'ha aggiunto il passo' end;
      elsif old.done is distinct from new.done then
        v := case when new.done then 'ha completato' else 'ha riaperto' end;
      elsif old.owner_id is distinct from new.owner_id then
        select display_name into who from public.members where id = new.owner_id;
        v := 'ha assegnato a ' || coalesce(who, 'entrambi');
      else return null; end if;
    end if;

  elsif TG_TABLE_NAME = 'tasks' then
    if TG_OP <> 'UPDATE' or old.done is not distinct from new.done then return null; end if;
    t := new.title; v := case when new.done then 'ha completato l’attività' else 'ha riaperto l’attività' end;
    select name into ctx from public.projects where id = new.project_id;

  elsif TG_TABLE_NAME = 'projects' then
    if TG_OP = 'INSERT' then t := new.name; v := 'ha creato il progetto';
    elsif TG_OP = 'DELETE' then t := old.name; v := 'ha eliminato il progetto';
    else return null; end if;

  elsif TG_TABLE_NAME = 'events' then
    if TG_OP = 'INSERT' then t := new.title; v := 'ha pianificato';
    elsif TG_OP = 'UPDATE' and old.start_at is distinct from new.start_at then t := new.title; v := 'ha spostato';
    elsif TG_OP = 'DELETE' then t := old.title; v := 'ha annullato';
    else return null; end if;
    if TG_OP <> 'DELETE' then select name into ctx from public.projects where id = new.project_id; end if;

  elsif TG_TABLE_NAME = 'ideas' then
    if TG_OP <> 'INSERT' then return null; end if;
    t := new.title; v := 'ha scritto l’idea';

  elsif TG_TABLE_NAME = 'transactions' then
    if TG_OP <> 'INSERT' then return null; end if;
    t := new.description; v := case when new.type = 'revenue' then 'ha registrato il ricavo' else 'ha registrato il costo' end;
    select name into ctx from public.projects where id = new.project_id;

  elsif TG_TABLE_NAME = 'resources' then
    if TG_OP <> 'INSERT' then return null; end if;
    t := new.title; v := 'ha aggiunto il link';
    select name into ctx from public.projects where id = new.project_id;

  else return null; end if;

  insert into public.activity(actor_id, verb, title, context) values (actor, v, t, coalesce(ctx, ''));
  delete from public.activity where created_at < now() - interval '120 days';
  return null;
end;
$$;
revoke all on function public.log_activity() from public, anon, authenticated;

do $$
declare tb text;
begin
  foreach tb in array array['projects','tasks','todos','ideas','events','transactions','resources'] loop
    execute format('drop trigger if exists log_activity on public.%I', tb);
    execute format('create trigger log_activity after insert or update or delete on public.%I for each row execute function public.log_activity()', tb);
  end loop;
  -- Realtime per le risorse (la cronologia si ricarica insieme agli altri dati).
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'resources') then
    alter publication supabase_realtime add table public.resources;
  end if;
end;
$$;
commit;
