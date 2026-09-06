let currentUser = null;
let currentTrainee = null;

const form = document.getElementById("trainingForm");
const message = document.getElementById("message");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
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
  `).join("") || `<tr><td colspan="4" class="table-empty">No training records found.</td></tr>`;
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
