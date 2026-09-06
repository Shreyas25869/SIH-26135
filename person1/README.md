# SIH 26135 — Person 1: Trainee Profile & Training

Professional, Supabase-connected Person 1 module for SIH 26135.

## Modules
- Auth/login
- Trainee profile + consent
- Training program records
- Trainee skills
- Employment-status capture on `trainees`
- Dashboard / profile / training / skills views

## Supabase
Edit `js/supabase.js` and set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Only use the Supabase anon/public key in browser code. Never put a service-role key in this folder.

## Expected shared tables
- `trainees`
- `trainee_training`
- `trainee_skills`

The implementation uses the existing ownership model where trainee child rows are protected through the parent trainee's `user_id`.

## Run locally
From the repository root:

```bash
python3 -m http.server 5500
```

Open:

`http://localhost:5500/person1/`

## Important integration note
Person 1 owns trainee profile/training/skills collection. Person 3 owns employer/job/application/employment entities, while Person 4 owns follow-ups, employment history, skill gaps, outcome analytics and notifications. The modules intentionally do not duplicate those tables.
