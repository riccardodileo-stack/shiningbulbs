-- ShiningBulbs Studio — eseguire una volta nel SQL Editor di un NUOVO progetto Supabase.
-- Nessun account e nessun dato di esempio vengono creati da questo script.
-- Dopo l'esecuzione, creare i due utenti in Authentication e autorizzarli in members.
begin;

create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null unique check (display_name in ('Riccardo','Stefano')),
  created_at timestamptz not null default now()
);

create function public.is_member() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (select 1 from public.members where id = (select auth.uid()));
$$;
revoke all on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 80),
  description text not null default '' check (length(description) <= 800),
  owner_id uuid references public.members(id) on delete set null,
  due_date date,
  platform text not null default 'iOS e Android' check (platform in ('iOS','Android','iOS e Android','Web','Da definire')),
  color text not null default 'blue' check (color in ('blue','purple','green','amber')),
  icon text not null default 'code' check (icon in ('code','book','heart','wallet','globe','sparkles')),
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage integer not null check (stage between 0 and 2),
  position integer not null check (position between 0 and 10),
  title text not null check (length(btrim(title)) between 1 and 160),
  done boolean not null default false,
  owner_id uuid references public.members(id) on delete set null,
  due_date date,
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,position)
);
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  content text not null default '' check (length(content) <= 20000),
  project_id uuid references public.projects(id) on delete set null,
  color text not null default 'blue' check (color in ('blue','purple','green','amber')),
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  start_at timestamptz not null,
  end_at timestamptz not null,
  agenda text not null default '' check (length(agenda) <= 6000),
  meeting_url text not null default '' check (meeting_url = '' or meeting_url ~ '^https?://'),
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at and end_at - start_at <= interval '24 hours')
);
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('revenue','cost')),
  description text not null check (length(btrim(description)) between 1 and 160),
  amount numeric(12,2) not null check (amount > 0),
  date date not null,
  project_id uuid references public.projects(id) on delete set null,
  member_id uuid not null references public.members(id),
  category text not null check (category in ('revenue','ai','developer','hosting','marketing','other')),
  created_by uuid not null references public.members(id),
  updated_by uuid not null references public.members(id),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((type = 'revenue' and category = 'revenue') or (type = 'cost' and category <> 'revenue'))
);

create index on public.tasks(project_id);
create index on public.ideas(project_id);
create index on public.events(start_at);
create index on public.transactions(date);
create index on public.transactions(project_id);

-- L'autore non può essere falsificato dal browser; version e data sono server-side.
create function public.stamp_record() returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_member() then
    raise exception 'Workspace membership required';
  end if;
  if TG_OP = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
    new.version := 1;
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.version := old.version + 1;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.stamp_record() from public, anon, authenticated;

alter table public.members enable row level security;
revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;
create policy members_select on public.members for select to authenticated
using ((select public.is_member()));

do $$
declare t text;
begin
  foreach t in array array['projects','tasks','ideas','events','transactions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy workspace_access on public.%I for all to authenticated using ((select public.is_member())) with check ((select public.is_member()))', t);
    execute format('create trigger stamp_record before insert or update on public.%I for each row execute function public.stamp_record()', t);
    execute format('alter table public.%I replica identity full', t);
  end loop;
end;
$$;

-- Progetto e 11 attività nascono nella stessa transazione: nessuna roadmap parziale.
create function public.create_project_with_tasks(
  p_name text, p_description text, p_owner uuid, p_due date,
  p_platform text, p_color text, p_icon text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare pid uuid;
begin
  if not public.is_member() then raise exception 'Workspace membership required'; end if;
  insert into public.projects(name,description,owner_id,due_date,platform,color,icon)
  values (p_name,p_description,p_owner,p_due,p_platform,p_color,p_icon) returning id into pid;
  insert into public.tasks(project_id,stage,position,title,owner_id)
  select pid, x.stage, x.position, x.title, p_owner from (values
    (0,0,'Ideas sharing'),
    (0,1,'Prima realizzazione'),
    (0,2,'Prima fase di test'),
    (0,3,'Risoluzione errori e miglioramenti'),
    (0,4,'Seconda fase di test'),
    (0,5,'Consolidamento'),
    (0,6,'Capire come monetizzare l’app'),
    (1,7,'Porting su iOS / Android'),
    (1,8,'Terza e ultima fase di test'),
    (2,9,'Pubblicazione'),
    (2,10,'Gestione vendita')
  ) as x(stage,position,title);
  return pid;
end;
$$;
revoke all on function public.create_project_with_tasks(text,text,uuid,date,text,text,text) from public, anon;
grant execute on function public.create_project_with_tasks(text,text,uuid,date,text,text,text) to authenticated;

-- Attiva gli aggiornamenti Realtime per ogni tabella dati.
do $$
declare t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  foreach t in array array['projects','tasks','ideas','events','transactions'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end;
$$;
commit;

-- PASSO SUCCESSIVO (NON rimuovere i commenti prima di avere gli UUID reali):
-- Creare due utenti in Authentication → Users, quindi eseguire separatamente:
-- insert into public.members(id,display_name) values
-- ('UUID_REALE_ACCOUNT_RICCARDO', 'Riccardo'),
-- ('UUID_REALE_ACCOUNT_STEFANO', 'Stefano');
-- Solo il proprietario del database può modificare members; il browser può leggerla.
