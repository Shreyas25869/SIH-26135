// Translates Supabase's snake_case rows into the camelCase shapes the
// existing feature pages already use, and back again for writes.

export const courseFromRow = (r) => ({
  id: r.id,
  name: r.course_name,
  description: r.description,
  sector: r.sector,
  duration: r.duration_hours == null ? "" : `${r.duration_hours} hours`,
  level: r.level,
  eligibility: "",
  skillsTaught: [],
  certification: r.certification_available ? "Available" : "Not available",
  trainingMode: "",
  status: r.status,
});

export const courseToRow = (c, providerId) => ({
  ...(providerId ? { provider_id: providerId } : {}),
  course_name: c.name,
  description: c.description || null,
  sector: c.sector,
  duration_hours: Number.parseInt(c.duration, 10) || null,
  level: c.level,
  certification_available: Boolean(c.certification),
  ...(c.status ? { status: c.status } : {}),
});

export const batchFromRow = (r) => ({
  id: r.id,
  courseId: r.course_id,
  name: r.batch_name,
  startDate: r.start_date,
  endDate: r.end_date,
  trainer: r.location,
  capacity: r.capacity,
  status: r.status,
});

export const batchToRow = (b) => ({
  course_id: b.courseId,
  batch_name: b.name,
  start_date: b.startDate || null,
  end_date: b.endDate || null,
  location: b.trainer || null,
  capacity: b.capacity,
  status: b.status,
});

export const assessmentFromRow = (r) => ({
  id: r.id,
  date: r.date,
  skill: r.skill,
  score: r.score,
  maxScore: r.max_score,
  assessor: r.assessor,
});

export const assessmentToRow = (a, traineeId) => ({
  trainee_id: traineeId,
  skill: a.skill,
  score: a.score,
  max_score: a.maxScore,
  assessor: a.assessor,
  date: a.date,
});

export const certificationFromRow = (r) => ({
  name: r.name,
  level: r.level,
  issueDate: r.issue_date,
  referenceId: r.reference_id,
});

export const certificationToRow = (c, traineeId) => ({
  trainee_id: traineeId,
  name: c.name,
  level: c.level,
  issue_date: c.issueDate || null,
  reference_id: c.referenceId,
});

export const outcomeFromRow = (r) => ({
  placed: r.placed,
  employer: r.employer,
  role: r.role,
  salary: r.salary,
  followUpDays: r.follow_up_days,
  followUpStatus: r.follow_up_status,
  notes: r.notes,
});

export const outcomeToRow = (o, traineeId) => ({
  trainee_id: traineeId,
  placed: !!o.placed,
  employer: o.employer || null,
  role: o.role || null,
  salary: o.salary || null,
  follow_up_days: o.followUpDays || 90,
  follow_up_status: o.followUpStatus || "Pending",
  notes: o.notes || "",
});

export const traineeFromRow = (r) => ({
  id: r.id,
  batchId: r.batch_id,
  name: r.name,
  phone: r.phone,
  district: r.district,
  status: r.status,
  attendancePct: r.attendance_pct,
  progressPct: r.progress_pct,
  dropoutReason: r.dropout_reason,
  dropoutNotes: r.dropout_notes,
  assessments: (r.assessments || [])
    .map(assessmentFromRow)
    .sort((a, b) => new Date(a.date) - new Date(b.date)),
  certification: r.certifications && r.certifications[0] ? certificationFromRow(r.certifications[0]) : null,
  outcome: r.outcomes && r.outcomes[0] ? outcomeFromRow(r.outcomes[0]) : null,
});

export const traineeToRow = (t) => ({
  batch_id: t.batchId || null,
  name: t.name,
  phone: t.phone || null,
  district: t.district || null,
  status: t.status || "Ongoing",
  attendance_pct: t.attendancePct ?? 0,
  progress_pct: t.progressPct ?? 0,
  dropout_reason: t.dropoutReason || null,
  dropout_notes: t.dropoutNotes || null,
});
