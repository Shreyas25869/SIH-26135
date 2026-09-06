// Shared enums used across the provider feature pages. Actual records
// (courses, batches, trainees, assessments, certifications, outcomes) now
// live in Supabase — see src/shared/ProviderContext.jsx and supabase/schema.sql.

export const DROPOUT_REASONS = [
  "Personal / family",
  "Financial",
  "Migration",
  "Attendance",
  "Skill gap",
  "No suitable job",
  "Salary expectations",
  "Location",
  "Qualification mismatch",
  "Lack of experience",
  "Other",
];

export const SECTORS = [
  "Electronics & Hardware",
  "Healthcare",
  "Retail",
  "Construction",
  "IT-ITeS",
  "Apparel & Textile",
  "Automotive",
  "Food Processing",
];

export const TRAINING_MODES = ["In-person", "Hybrid", "Online"];
export const LEVELS = ["NSQF Level 3", "NSQF Level 4", "NSQF Level 5", "NSQF Level 6"];
