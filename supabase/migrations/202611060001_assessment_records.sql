-- Stores derived assessment measurements for each signed-in account.
-- Raw video/audio and MediaPipe landmark streams are intentionally not stored.
create table if not exists public.assessment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_type text not null check (assessment_type in ('tremor', 'tapping', 'voice')),
  completed_at timestamptz,
  quality text,
  effective_fps numeric(6,2),
  results jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists assessment_records_user_completed_idx
  on public.assessment_records (user_id, completed_at desc nulls last);

alter table public.assessment_records enable row level security;
revoke all on table public.assessment_records from anon;
grant select, insert on table public.assessment_records to authenticated;

drop policy if exists "read own assessment records" on public.assessment_records;
create policy "read own assessment records"
  on public.assessment_records for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "insert own assessment records" on public.assessment_records;
create policy "insert own assessment records"
  on public.assessment_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

