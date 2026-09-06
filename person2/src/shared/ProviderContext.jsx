import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  courseFromRow, courseToRow,
  batchFromRow, batchToRow,
  traineeFromRow, traineeToRow,
  assessmentToRow,
  certificationToRow,
  outcomeToRow,
} from "../lib/mappers";

const ProviderContext = createContext(null);

export function ProviderProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    const [coursesRes, batchesRes, traineesRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("batches").select("*").order("created_at"),
      supabase.from("trainees").select("*").order("created_at"),
    ]);

    const firstError = coursesRes.error || batchesRes.error || traineesRes.error
      || assessmentsRes.error || certificationsRes.error || outcomesRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setCourses((coursesRes.data || []).map(courseFromRow));
    setBatches((batchesRes.data || []).map(batchFromRow));
    const [assessmentsRes, certificationsRes, outcomesRes] = await Promise.all([
      optionalRows("assessments"),
      optionalRows("certifications"),
      optionalRows("outcomes"),
    ]);
    const assessmentsByTrainee = groupBy(assessmentsRes.data || [], "trainee_id");
    const certificationsByTrainee = groupBy(certificationsRes.data || [], "trainee_id");
    const outcomesByTrainee = groupBy(outcomesRes.data || [], "trainee_id");
    setTrainees((traineesRes.data || []).map((trainee) => traineeFromRow({
      ...trainee,
      assessments: assessmentsByTrainee[trainee.id] || [],
      certifications: certificationsByTrainee[trainee.id] || [],
      outcomes: outcomesByTrainee[trainee.id] || [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Courses ----
  const addCourse = async (course) => {
    const { error: err } = await supabase.from("courses").insert(courseToRow(course));
    if (err) return setError(err.message);
    await fetchAll();
  };
  const updateCourse = async (id, patch) => {
    const { error: err } = await supabase.from("courses").update(courseToRow(patch)).eq("id", id);
    if (err) return setError(err.message);
    await fetchAll();
  };
  const archiveCourse = async (id) => {
    const current = courses.find((c) => c.id === id);
    if (!current) return;
    const nextStatus = current.status === "Archived" ? "Active" : "Archived";
    const { error: err } = await supabase.from("courses").update({ status: nextStatus }).eq("id", id);
    if (err) return setError(err.message);
    await fetchAll();
  };

  // ---- Batches ----
  const addBatch = async (batch) => {
    const { error: err } = await supabase.from("batches").insert(batchToRow(batch));
    if (err) return setError(err.message);
    await fetchAll();
  };
  const updateBatch = async (id, patch) => {
    const { error: err } = await supabase.from("batches").update(batchToRow(patch)).eq("id", id);
    if (err) return setError(err.message);
    await fetchAll();
  };

  // ---- Trainees ----
  const addTrainee = async (trainee) => {
    const { error: err } = await supabase.from("trainees").insert(traineeToRow(trainee));
    if (err) return setError(err.message);
    await fetchAll();
  };
  const updateTrainee = async (id, patch) => {
    const current = trainees.find((t) => t.id === id);
    const { error: err } = await supabase
      .from("trainees")
      .update(traineeToRow({ ...current, ...patch }))
      .eq("id", id);
    if (err) return setError(err.message);
    await fetchAll();
  };

  // ---- Assessments ----
  const addAssessment = async (traineeId, assessment) => {
    const { error: err } = await supabase.from("assessments").insert(assessmentToRow(assessment, traineeId));
    if (err) return setError(err.message);
    await fetchAll();
  };

  // ---- Certifications ----
  const issueCertification = async (traineeId, cert) => {
    const { error: certErr } = await supabase
      .from("certifications")
      .upsert(certificationToRow(cert, traineeId), { onConflict: "trainee_id" });
    if (certErr) return setError(certErr.message);
    const { error: statusErr } = await supabase.from("trainees").update({ status: "Completed" }).eq("id", traineeId);
    if (statusErr) return setError(statusErr.message);
    await fetchAll();
  };

  // ---- Outcomes ----
  const setOutcome = async (traineeId, outcome) => {
    const { error: err } = await supabase
      .from("outcomes")
      .upsert(outcomeToRow(outcome, traineeId), { onConflict: "trainee_id" });
    if (err) return setError(err.message);
    await fetchAll();
  };

  // ---- Dropouts ----
  const markDropout = async (traineeId, reason, notes) => {
    const { error: err } = await supabase
      .from("trainees")
      .update({ status: "Dropped Out", dropout_reason: reason, dropout_notes: notes })
      .eq("id", traineeId);
    if (err) return setError(err.message);
    await fetchAll();
  };

  const value = useMemo(
    () => ({
      courses,
      batches,
      trainees,
      loading,
      error,
      refetch: fetchAll,
      addCourse,
      updateCourse,
      archiveCourse,
      addBatch,
      updateBatch,
      addTrainee,
      updateTrainee,
      addAssessment,
      issueCertification,
      setOutcome,
      markDropout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses, batches, trainees, loading, error]
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const group = row[key];
    if (!groups[group]) groups[group] = [];
    groups[group].push(row);
    return groups;
  }, {});
}

async function optionalRows(table) {
  const { data } = await supabase.from(table).select("*").order("created_at");
  return { data: data || [] };
}

export function useProviderData() {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProviderData must be used within ProviderProvider");
  return ctx;
}
