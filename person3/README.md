# Person 3 — Employer & Employment Module

Plain HTML + CSS + JavaScript + Supabase implementation for SIH 26135.

## Files
- `index.html` — application UI
- `styles.css` — shared module styling
- `js/config.js` — Supabase project URL and public anon/publishable key
- `js/supabase.js` — browser Supabase client
- `js/app.js` — authentication, CRUD, navigation and rendering

## Supabase
Uses the shared SIH-26135 tables:
- `employers`
- `jobs`
- `applications`
- `employment`
- `employment_verifications`

Put only the public anon/publishable key in `js/config.js`. Never put the Supabase service-role key in frontend code.

## Run
From the repository root:
`python3 -m http.server 5500`
Then open:
`http://localhost:5500/person3/`

## Note
The UI expects the shared schema already created in the SIH-26135 Supabase project. Column names must match the finalized shared schema. Employer ownership is enforced by Supabase RLS.
