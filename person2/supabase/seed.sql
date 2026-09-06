-- Optional demo data — run after schema.sql if you want the portal to open
-- with sample courses/batches/trainees instead of empty tables.

with prov as (
    insert into training_providers (organization_name, provider_type, district, address, phone, email, verification_status)
    values ('Rozgaar Mitra Training Institute', 'Training Provider', 'Bengaluru Urban',
      '44, Industrial Layout, Peenya, Bengaluru - 560058', '+91 98450 21134',
      'admin@rozgaarmitra.in', 'Verified')
  returning id
),
c1 as (
  insert into courses (provider_id, course_name, sector, description, duration_hours, level, certification_available)
  select id, 'Electronics Hardware Assembly', 'Electronics & Hardware', 'Class 10 pass, age 18-35', 360, 'NSQF Level 4', true
  from prov returning id
),
c2 as (
  insert into courses (provider_id, course_name, sector, description, duration_hours, level, certification_available)
  select id, 'General Duty Assistant (Healthcare)', 'Healthcare', 'Class 12 pass, age 18-45', 480, 'NSQF Level 4', true
  from prov returning id
),
c3 as (
  insert into courses (provider_id, course_name, sector, description, duration_hours, level, certification_available)
  select id, 'Retail Sales Associate', 'Retail', 'Class 8 pass, age 18-35', 240, 'NSQF Level 3', true
  from prov returning id
),
b1 as (
  insert into batches (course_id, batch_name, start_date, end_date, location, capacity, status)
  select id, 'EHA Batch — Jan 2026', '2026-01-12', '2026-04-10', 'Peenya Training Centre', 30, 'Ongoing' from c1
  returning id
),
b2 as (
  insert into batches (course_id, batch_name, start_date, end_date, location, capacity, status)
  select id, 'GDA Batch — Feb 2026', '2026-02-01', '2026-05-30', 'Peenya Training Centre', 25, 'Ongoing' from c2
  returning id
),
b3 as (
  insert into batches (course_id, batch_name, start_date, end_date, location, capacity, status)
  select id, 'RSA Batch — Nov 2025', '2025-11-03', '2026-01-02', 'Peenya Training Centre', 35, 'Completed' from c3
  returning id
),
t1 as (
  insert into trainees (batch_id, name, phone, district, status, attendance_pct, progress_pct)
  select id, 'Aarav Mehta', '9700000137', 'Bengaluru Urban', 'Ongoing', 88, 62 from b1 returning id
),
t2 as (
  insert into trainees (batch_id, name, phone, district, status, attendance_pct, progress_pct)
  select id, 'Priya Sharma', '9700000274', 'Pune', 'Ongoing', 91, 70 from b1 returning id
),
t3 as (
  insert into trainees (batch_id, name, phone, district, status, attendance_pct, progress_pct, dropout_reason, dropout_notes)
  select id, 'Rohan Das', '9700000411', 'Jaipur', 'Dropped Out', 42, 25, 'Financial', 'Flagged during monthly review call.' from b2 returning id
),
t4 as (
  insert into trainees (batch_id, name, phone, district, status, attendance_pct, progress_pct)
  select id, 'Sneha Iyer', '9700000548', 'Coimbatore', 'Completed', 95, 100 from b3 returning id
)
insert into assessments (trainee_id, skill, score, max_score, assessor, date)
select id, 'Core Practical', 78, 100, 'R. Subramaniam', '2026-01-20' from t1
union all
select id, 'Theory Test', 82, 100, 'R. Subramaniam', '2026-02-18' from t1
union all
select id, 'Core Practical', 85, 100, 'R. Subramaniam', '2026-01-20' from t2;

-- Certification + outcome for the completed trainee (Sneha Iyer)
with completed as (select id from trainees where name = 'Sneha Iyer' limit 1)
insert into certifications (trainee_id, name, level, issue_date, reference_id)
select id, 'Retail Sales Associate', 'NSQF Level 3', '2026-01-05', 'CERT-2026-00001' from completed;

with completed as (select id from trainees where name = 'Sneha Iyer' limit 1)
insert into outcomes (trainee_id, placed, employer, role, salary, follow_up_status)
select id, true, 'Local retail chain', 'Sales Associate', 15500, 'Completed' from completed;
