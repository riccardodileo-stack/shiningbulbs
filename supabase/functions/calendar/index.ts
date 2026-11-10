// @ts-nocheck
// ShiningBulbs Studio — calendario in abbonamento (formato iCalendar, RFC 5545).
// URL: https://<progetto>.supabase.co/functions/v1/calendar?token=<token personale>
// Da pubblicare con "Verify JWT" DISATTIVATO: la protezione è il token nel link.

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/\r/g, '').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
const utc = (s) => new Date(s).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const safeURL = (v) => { try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };

function fold(line) {
  let out = '', part = '', len = 0;
  for (const ch of line) {
    const size = new TextEncoder().encode(ch).length;
    if (len + size > 73) { out += part + '\r\n '; part = ''; len = 1; }
    part += ch; len += size;
  }
  return out + part;
}

export function buildICS(feed, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShiningBulbs//Studio//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:ShiningBulbs', `X-WR-CALDESC:${esc('Incontri e task dello studio · link personale di ' + feed.member)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M', 'X-PUBLISHED-TTL:PT15M',
  ];
  for (const e of feed.events) {
    const url = safeURL(e.meeting_url);
    const desc = [e.project ? 'Progetto: ' + e.project : '', e.agenda || '', url ? 'Call: ' + url : ''].filter(Boolean).join('\n\n');
    lines.push(
      'BEGIN:VEVENT', `UID:${e.id}@shiningbulbs`, `DTSTAMP:${utc(e.updated_at || now)}`,
      `LAST-MODIFIED:${utc(e.updated_at || now)}`, `SEQUENCE:${Math.max(0, (Number(e.version) || 1) - 1)}`,
      `DTSTART:${utc(e.start_at)}`, `DTEND:${utc(e.end_at)}`, `SUMMARY:${esc(e.title)}`,
      ...(desc ? [`DESCRIPTION:${esc(desc)}`] : []), ...(url ? [`URL:${url}`] : []),
      'END:VEVENT',
    );
  }
  // Task con scadenza: eventi di un giorno intero, spariscono quando vengono completate.
  for (const t of feed.todos || []) {
    const day = new Date(t.due_date + 'T00:00:00Z'), next = new Date(day.getTime() + 86400000);
    const d = (x) => x.toISOString().slice(0, 10).replace(/-/g, '');
    const desc = [t.parent ? 'Fa parte di: ' + t.parent : '', t.project ? 'Progetto: ' + t.project : 'Studio · generale', t.shared ? 'Assegnata a entrambi' : ''].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT', `UID:todo-${t.id}@shiningbulbs`, `DTSTAMP:${utc(t.updated_at || now)}`,
      `DTSTART;VALUE=DATE:${d(day)}`, `DTEND;VALUE=DATE:${d(next)}`, `SUMMARY:${esc('Task · ' + t.title)}`,
      `DESCRIPTION:${esc(desc)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

function apiKey() {
  const direct = Deno.env.get('CALENDAR_API_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  if (direct) return direct;
  try { const keys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}'); return keys.default || Object.values(keys)[0]; } catch { return undefined; }
}

const text = (body, status) => new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

if (typeof Deno !== 'undefined' && Deno.serve) {
  Deno.serve(async (req) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return text('Metodo non consentito', 405);
    const token = new URL(req.url).searchParams.get('token') || '';
    if (!/^[0-9a-f]{64}$/.test(token)) return text('Link del calendario non valido', 404);
    const key = apiKey();
    if (!key) return text('Configurazione mancante: chiave pubblicabile non disponibile', 500);
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/calendar_feed`, {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_token: token }),
    });
    if (!res.ok) return text('Calendario non disponibile. Controlla che migrations/003_calendar_feed.sql sia stato eseguito.', 502);
    const feed = await res.json();
    if (!feed) return text('Link del calendario non valido o revocato', 404);
    return new Response(req.method === 'HEAD' ? null : buildICS(feed), {
      headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'inline; filename="shiningbulbs.ics"', 'Cache-Control': 'no-store' },
    });
  });
}
