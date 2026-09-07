# SIH-26135 — Skilling & Employment Outcome Platform

Integrated frontend + Supabase implementation for tracking trainees, training, job applications, employment and verified outcomes.

## Modules

- **Auth:** centralized Supabase authentication, role detection, profile persistence and module guards.
- **Person 1 — Trainee:** profile, skills, training, open jobs and trainee applications.
- **Person 2 — Training Provider:** provider profile, courses, batches, trainee enrollment, attendance/dropout and analytics.
- **Person 3 — Employer:** employer profiles, jobs, applications, employment records and employment verification.
- **Person 4 — Outcomes:** employment history, skill gaps, follow-ups, notifications and outcome analytics.

## End-to-end flow

`Trainee profile → Training → Provider enrollment → Jobs → Application → Employment → Verification → Outcome analytics`

## Supabase setup

After the shared 17-table schema and baseline RLS policies are present, run these migrations in order:

1. `supabase/migrations/202609070030_person1_person2_training_flow.sql`
2. `supabase/migrations/202609070045_trainee_job_application_flow.sql`
3. `supabase/migrations/202609070100_person4_outcome_access.sql`

The migrations are committed to GitHub but are not automatically executed by this static repository.

## Security

All application requests use the authenticated Supabase session. Module guards enforce application roles, while database RLS remains the final authorization boundary. Admin outcome access is restricted to users whose `app_metadata.role` is `admin`; user-editable metadata is not used to grant admin privileges. Never put a Supabase service-role key in frontend code.

## Run locally

From the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/auth/index.html`.
