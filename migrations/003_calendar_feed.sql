-- ShiningBulbs Studio — calendario in abbonamento per iPhone / Mac / Google Calendar.
-- Da eseguire nel SQL Editor dopo database.sql (richiede la tabella todos). Si può rieseguire senza problemi:
-- serve anche per aggiornare le funzioni dopo una nuova versione del gestionale. I link già creati restano validi.
-- Ogni founder ha un link personale con un token segreto, revocabile in qualsiasi momento.
begin;

create table if not exists public.calendar_feeds (
  member_id uuid primary key references public.members(id) on delete cascade,
  token text not null unique default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
  created_at timestamptz not null default now()
);
-- Nessun accesso diretto dal browser: si passa solo dalle funzioni qui sotto.
alter table public.calendar_feeds enable row level security;
revoke all on public.calendar_feeds from anon, authenticated;

-- Restituisce il token del founder collegato, creandolo se manca.
create or replace function public.my_calendar_token() returns text
language plpgsql security definer set search_path = '' as $$
declare t text;
begin
  if auth.uid() is null or not public.is_member() then raise exception 'Workspace membership required'; end if;
  insert into public.calendar_feeds(member_id) values (auth.uid()) on conflict (member_id) do nothing;
  select token into t from public.calendar_feeds where member_id = auth.uid();
  return t;
end;
$$;

-- Genera un nuovo token: il link precedente smette subito di funzionare.
create or replace function public.rotate_calendar_token() returns text
language plpgsql security definer set search_path = '' as $$
declare t text;
begin
  if auth.uid() is null or not public.is_member() then raise exception 'Workspace membership required'; end if;
  insert into public.calendar_feeds(member_id, token)
  values (auth.uid(), replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-',''))
  on conflict (member_id) do update set token = excluded.token, created_at = now()
  returning token into t;
  return t;
end;
$$;

-- Usata dalla Edge Function "calendar": con un token valido restituisce gli incontri
-- (ultimi 6 mesi e futuri) e le task aperte con scadenza assegnate al founder o a entrambi.
-- Con un token sbagliato restituisce null.
create or replace function public.calendar_feed(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare who text; mid uuid;
begin
  if p_token is null or length(p_token) <> 64 then return null; end if;
  select m.display_name, m.id into who, mid from public.calendar_feeds f join public.members m on m.id = f.member_id where f.token = p_token;
  if who is null then return null; end if;
  return jsonb_build_object(
    'member', who,
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'title', e.title, 'start_at', e.start_at, 'end_at', e.end_at,
        'agenda', e.agenda, 'meeting_url', e.meeting_url, 'project', p.name,
        'version', e.version, 'updated_at', e.updated_at, 'created_at', e.created_at
      ) order by e.start_at)
      from public.events e left join public.projects p on p.id = e.project_id
      where e.end_at > now() - interval '180 days'
    ), '[]'::jsonb),
    -- Un passo, oppure la task stessa se non ha passi.
    'todos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id, 'title', t.title, 'due_date', t.due_date, 'parent', par.title,
        'project', pr.name, 'shared', t.owner_id is null, 'updated_at', t.updated_at
      ) order by t.due_date)
      from public.todos t
      left join public.todos par on par.id = t.parent_id
      left join public.projects pr on pr.id = coalesce(par.project_id, t.project_id)
      where not t.done and t.due_date is not null
        and t.due_date > current_date - 60
        and (t.owner_id is null or t.owner_id = mid)
        and (t.parent_id is not null or not exists (select 1 from public.todos c where c.parent_id = t.id))
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.my_calendar_token() from public, anon;
revoke all on function public.rotate_calendar_token() from public, anon;
grant execute on function public.my_calendar_token() to authenticated;
grant execute on function public.rotate_calendar_token() to authenticated;
revoke all on function public.calendar_feed(text) from public;
grant execute on function public.calendar_feed(text) to anon, authenticated;
commit;
