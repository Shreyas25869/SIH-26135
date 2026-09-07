let currentUser = null;
let currentTrainee = null;

const form = document.getElementById("trainingForm");
const message = document.getElementById("message");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

async function loadProviderTraining() {
  const rowsEl = document.getElementById("providerTrainingRows");
  if (!rowsEl || !currentTrainee) return;

  const { data: enrollments, error: enrollmentError } = await supabaseClient
    .from("enrollments")
    .select("id, batch_id, enrollment_date, status, created_at")
    .eq("trainee_id", currentTrainee.id)
    .order("created_at", { ascending: false });

  if (enrollmentError) throw enrollmentError;

  const batchIds = [...new Set((enrollments || []).map(row => row.batch_id).filter(Boolean))];
  if (!batchIds.length) {
    rowsEl.innerHTML = `<tr><td colspan="6" class="table-empty">No provider enrollments yet.</td></tr>`;
    return;
  }

  const { data: batches, error: batchError } = await supabaseClient
    .from("batches")
    .select("id, course_id, batch_name, start_date, end_date, location, status")
    .in("id", batchIds);

  if (batchError) throw batchError;

  const courseIds = [...new Set((batches || []).map(row => row.course_id).filter(Boolean))];
  let courses = [];
  if (courseIds.length) {
    const { data, error } = await supabaseClient
      .from("courses")
      .select("id, course_name, sector, level")
      .in("id", courseIds);
    if (error) throw error;
    courses = data || [];
  }

  const batchMap = new Map((batches || []).map(row => [row.id, row]));
  const courseMap = new Map(courses.map(row => [row.id, row]));

  rowsEl.innerHTML = (enrollments || []).map(enrollment => {
    const batch = batchMap.get(enrollment.batch_id);
    const course = batch ? courseMap.get(batch.course_id) : null;
    return `
      <tr>
        <td><strong>${escapeHtml(course?.course_name || "—")}</strong><div class="small muted">${escapeHtml(course?.sector || course?.level || "")}</div></td>
        <td>${escapeHtml(batch?.batch_name || enrollment.batch_id || "—")}</td>
        <td>${escapeHtml(batch?.location || "—")}</td>
        <td>${escapeHtml(enrollment.status || batch?.status || "—")}</td>
        <td>${escapeHtml(batch?.start_date || "—")} → ${escapeHtml(batch?.end_date || "—")}</td>
        <td>${escapeHtml(enrollment.enrollment_date || enrollment.created_at || "—")}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="6" class="table-empty">No provider enrollments yet.</td></tr>`;
}

async function loadTraining() {
  currentTrainee = await requireTrainee(currentUser.id);
  if (!currentTrainee) return;

  const { data, error } = await supabaseClient
    .from("trainee_training")
    .select("*")
    .eq("trainee_id", currentTrainee.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  document.getElementById("trainingRows").innerHTML = (data || []).map(row => `
    <tr>
      <td>${escapeHtml(row.program_name || row.course_id || "—")}</td>
      <td>${escapeHtml(row.certification_status || "—")}</td>
      <td>${escapeHtml(row.course_id || "—")}</td>
      <td>${escapeHtml(row.batch_id || "—")}</td>
    </tr>
  `).join("") || `<tr><td colspan="4" class="table-empty">No self-recorded training records found.</td></tr>`;

  await loadProviderTraining();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.getElementById("saveButton");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  button.disabled = true;
  button.textContent = "Adding...";

  try {
    const payload = {
      trainee_id: currentTrainee.id,
      program_name: document.getElementById("program_name").value,
      certification_status: document.getElementById("certification_status").value
    };

    const courseId = document.getElementById("course_id").value.trim();
    const batchId = document.getElementById("batch_id").value.trim();

    if (courseId) payload.course_id = courseId;
    if (batchId) payload.batch_id = batchId;

    const { error } = await supabaseClient
      .from("trainee_training")
      .insert(payload);

    if (error) throw error;

    message.className = "form-message success";
    message.textContent = "Training record added.";
    form.reset();
    await loadTraining();
  } catch (error) {
    console.error(error);
    message.className = "form-message error";
    message.textContent = error.message || "Unable to add training record.";
  } finally {
    button.disabled = false;
    button.textContent = "Add training";
  }
});

document.getElementById("logoutButton").addEventListener("click", signOutAndRedirect);

(async () => {
  try {
    currentUser = await requireUser();
    if (currentUser) await loadTraining();
  } catch (error) {
    console.error(error);
    message.className = "form-message error";
    message.textContent = error.message;
  }
})();
