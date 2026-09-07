-- SIH 26135: Person 1 <-> Person 2 training integration
-- Run after the existing shared 17-table schema and its baseline RLS policies.
-- This migration does NOT create duplicate trainee/course/batch/enrollment tables.

create schema if not exists private;

create or replace function private.is_provider_for_trainee(target_trainee_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.batches b on b.id = e.batch_id
    join public.courses c on c.id = b.course_id
    join public.training_providers p on p.id = c.provider_id
    where e.trainee_id = target_trainee_id
      and p.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_trainee_for_batch(target_batch_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.trainees t on t.id = e.trainee_id
    where e.batch_id = target_batch_id
      and t.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_trainee_for_course(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.batches b on b.id = e.batch_id
    join public.trainees t on t.id = e.trainee_id
    where b.course_id = target_course_id
      and t.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_provider_for_trainee(uuid) from public;
revoke execute on function private.is_trainee_for_batch(uuid) from public;
revoke execute on function private.is_trainee_for_course(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_provider_for_trainee(uuid) to authenticated;
grant execute on function private.is_trainee_for_batch(uuid) to authenticated;
grant execute on function private.is_trainee_for_course(uuid) to authenticated;

-- Provider can see a trainee only after that trainee is connected to one of the provider's batches.
create policy "providers can view enrolled trainees"
on public.trainees
for select
to authenticated
using ((select private.is_provider_for_trainee(id)));

-- A trainee can see only the batches they are enrolled in.
create policy "trainees can view enrolled batches"
on public.batches
for select
to authenticated
using ((select private.is_trainee_for_batch(id)));

-- A trainee can see only courses attached to their enrolled batches.
create policy "trainees can view enrolled courses"
on public.courses
for select
to authenticated
using ((select private.is_trainee_for_course(id)));

-- Keep the existing ownership policies for writes. This migration intentionally
-- does not grant providers broad access to all trainees or trainees broad access
-- to all provider catalog data.
