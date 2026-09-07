-- SIH 26135: trainee job discovery and application flow
-- Run after the existing shared schema/RLS migrations.
-- Trainees may discover only open jobs and submit applications for themselves.

create policy "trainees can view open jobs"
on public.jobs
for select
to authenticated
using (
  status = 'Open'
  and exists (select 1 from public.trainees t where t.id is not null and t.user_id = (select auth.uid()))
);

create policy "trainees can create own job applications"
on public.applications
for insert
to authenticated
with check (
  trainee_id = (select id from public.trainees where user_id = (select auth.uid()) limit 1)
  and exists (
    select 1 from public.jobs j
    where j.id = job_id and j.status = 'Open'
  )
);

create policy "trainees can view own job applications"
on public.applications
for select
to authenticated
using (
  trainee_id = (select id from public.trainees where user_id = (select auth.uid()) limit 1)
);
