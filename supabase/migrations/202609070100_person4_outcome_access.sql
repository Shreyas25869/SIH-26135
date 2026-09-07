-- SIH 26135: narrow government/admin read access for Person 4 outcome analytics.
-- Admin authorization is based only on auth.users app_metadata.role.

create policy "admins can read trainees for outcome analytics" on public.trainees for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read trainee skills for outcome analytics" on public.trainee_skills for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read trainee training for outcome analytics" on public.trainee_training for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read enrollments for outcome analytics" on public.enrollments for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read applications for outcome analytics" on public.applications for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read employment for outcome analytics" on public.employment for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read employment verifications for outcome analytics" on public.employment_verifications for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read skill gaps for outcome analytics" on public.skill_gaps for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "admins can read trainee followups for outcome analytics" on public.trainee_followups for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
