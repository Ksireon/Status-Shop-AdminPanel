import fs from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local like dev script
const envPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) {
      const key = m[1]
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  })
}

const conn = process.env.SUPABASE_DB_URL || ''
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ''
if (!conn) {
  console.error('SUPABASE_DB_URL is not set')
  process.exit(1)
}

const sql = `
  create extension if not exists pgcrypto;
  create table if not exists public.chat_rooms (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    assigned_role text check (assigned_role in ('owner','director','manager')),
    status text not null default 'open',
    last_message_at timestamptz,
    created_at timestamptz not null default now()
  );
  create index if not exists idx_chat_rooms_user on public.chat_rooms(user_id);
  create index if not exists idx_chat_rooms_last on public.chat_rooms(last_message_at);
  create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    room_id uuid not null references public.chat_rooms(id) on delete cascade,
    sender_type text not null check (sender_type in ('user','staff')),
    sender_id uuid,
    content text not null,
    created_at timestamptz not null default now()
  );
  create index if not exists idx_chat_messages_room on public.chat_messages(room_id);
  create index if not exists idx_chat_messages_created on public.chat_messages(created_at);

  alter table public.chat_rooms enable row level security;
  alter table public.chat_messages enable row level security;
  do $$ begin
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_rooms' and policyname='chat_rooms_read_all') then
      create policy chat_rooms_read_all on public.chat_rooms for select to anon using (true);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read_all') then
      create policy chat_messages_read_all on public.chat_messages for select to anon using (true);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_all') then
      create policy chat_messages_insert_all on public.chat_messages for insert to anon with check (true);
    end if;
  end $$;

  do $$ begin
    begin
      alter publication supabase_realtime add table public.chat_messages;
    exception when others then null;
    end;
  end $$;

  alter table if exists public.chat_rooms
    add column if not exists assigned_staff_id uuid,
    add column if not exists closed_at timestamptz;
  create index if not exists idx_chat_rooms_role on public.chat_rooms(assigned_role);
  create index if not exists idx_chat_rooms_staff on public.chat_rooms(assigned_staff_id);
  create index if not exists idx_chat_rooms_closed on public.chat_rooms(closed_at);
`

async function run() {
  // Try PG first
  if (conn) {
    try {
      const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
      await client.connect()
      await client.query(sql)
      await client.end()
      console.log(JSON.stringify({ ok: true, via: 'pg' }))
      return
    } catch (e) {
      console.error(JSON.stringify({ error: e?.message || 'PG failed', stack: e?.stack }))
    }
  }
  // Fallback to Supabase SQL over HTTP
  const ref = (() => {
    try {
      const u = new URL(supabaseUrl)
      return (u.hostname || '').split('.')[0]
    } catch { return '' }
  })()
  if (ref && accessToken) {
    try {
      const resp = await fetch(`https://api.supabase.com/v1/projects/${ref}/sql`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      })
      const text = await resp.text()
      if (resp.ok) {
        console.log(JSON.stringify({ ok: true, via: 'sql-http' }))
        return
      }
      console.error(text || JSON.stringify({ error: 'SQL HTTP failed' }))
      process.exitCode = 1
      return
    } catch (e) {
      console.error(JSON.stringify({ error: e?.message || 'SQL HTTP failed', stack: e?.stack }))
      process.exitCode = 1
      return
    }
  }
  console.error(JSON.stringify({ error: 'No path to initialize (missing SUPABASE_DB_URL and SUPABASE_ACCESS_TOKEN)' }))
  process.exitCode = 1
}

run()
