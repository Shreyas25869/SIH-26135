let user = null;
let trainee = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

async function loadSkills() {
  trainee = await requireTrainee(user.id);
  if (!trainee) return;

  const { data, error } = await supabaseClient
    .from("trainee_skills")
    .select("*")
    .eq("trainee_id", trainee.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  document.getElementById("skillRows").innerHTML = (data || []).map(row => `
    <tr>
      <td>${escapeHtml(row.skill_name || "—")}</td>
      <td>${escapeHtml(row.skill_category || "—")}</td>
      <td>${escapeHtml(row.proficiency_level || "—")}</td>
    </tr>
  `).join("") || `<tr><td colspan="3" class="table-empty">No skill records found.</td></tr>`;
}

document.getElementById("skillsForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("saveButton");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  button.disabled = true;
  button.textContent = "Adding...";

  try {
    const { error } = await supabaseClient.from("trainee_skills").insert({
      trainee_id: trainee.id,
      skill_name: document.getElementById("skill_name").value.trim(),
      skill_category: document.getElementById("skill_category").value.trim() || null,
      proficiency_level: document.getElementById("proficiency_level").value
    });

    if (error) throw error;

    document.getElementById("message").className = "form-message success";
    document.getElementById("message").textContent = "Skill added successfully.";
    form.reset();
    await loadSkills();
  } catch (error) {
    console.error(error);
    document.getElementById("message").className = "form-message error";
    document.getElementById("message").textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Add skill";
  }
});

document.getElementById("logoutButton").addEventListener("click", signOutAndRedirect);

(async () => {
  try {
    user = await requireUser();
    if (user) await loadSkills();
  } catch (error) {
    console.error(error);
    document.getElementById("message").className = "form-message error";
    document.getElementById("message").textContent = error.message;
  }
})();
