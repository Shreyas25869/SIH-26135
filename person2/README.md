# Rozgaar Mitra — Training Provider Portal

No login/signup screens — it opens straight to the dashboard. All data now
lives in Supabase instead of in-memory mock data.

## 1. Set up Supabase

1. Create a project at supabase.com (or use an existing one shared with
   Person 1's trainee-facing app).
2. Open the SQL editor and run `supabase/schema.sql` — this creates
   `training_providers`, `courses`, `batches`, `trainees`, `assessments`,
   `certifications`, `outcomes`, with permissive demo RLS policies (see the
   note at the bottom of that file about tightening them later).
3. Optionally run `supabase/seed.sql` afterwards to load a few sample
   courses/batches/trainees so the portal isn't empty on first load.
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (Project Settings → API in the Supabase dashboard).

## 2. Run the app

```
npm install
npm run dev
```

## What's inside

- `src/features/provider/` — one folder per feature (profile, dashboard,
  courses, batches, trainees, attendance, assessments, certifications,
  outcomes, dropouts, analytics), matching the requested code layout. None
  of these files needed to change when the backend moved to Supabase — they
  only talk to `useProviderData()`.
- `src/shared/ProviderContext.jsx` — fetches courses/batches/trainees (with
  their nested assessments/certifications/outcomes) from Supabase on load,
  and every mutation (`addCourse`, `addBatch`, `addAssessment`,
  `issueCertification`, `setOutcome`, `markDropout`, etc.) writes to Supabase
  and refetches.
- `src/lib/supabaseClient.js` — the Supabase client, built from your `.env`.
- `src/lib/mappers.js` — translates between Supabase's snake_case columns
  and the camelCase shapes the UI uses (e.g. `training_mode` ↔
  `trainingMode`).
- `src/features/provider/profile/ProviderProfile.jsx` — reads/writes a
   single row in the `training_providers` table directly (create it the first time you
  edit and save).
- `supabase/schema.sql` — table definitions, foreign keys, and RLS policies.
- `supabase/seed.sql` — optional sample data.

## Sharing data with Person 1

Point their trainee-facing app at the same Supabase project and the same
`trainees` table (and `assessments` / `certifications` / `outcomes`, which
reference it by `trainee_id`) — no schema changes needed on either side.

## Security note

The RLS policies in `schema.sql` are wide open (`using (true)`) so the app
works without a login page, as requested. Before this goes anywhere beyond a
demo, add provider authentication and scope each policy to
`auth.uid() = provider_id` (or similar) so one provider can't read or edit
another's data.
