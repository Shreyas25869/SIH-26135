const dashboardState = { user: null, trainee: null };

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function statusClass(status) {
  return String(status || "").toLowerCase().replace(/[^a-z]+/g, "-");
}

async function loadDashboard() {
  dashboardState.user = await requireUser();
  if (!dashboardState.user) return;

  dashboardState.trainee = await getMyTrainee(dashboardState.user.id);

  if (!dashboardState.trainee) {
    document.getElementById("emptyProfile").hidden = false;
    document.getElementById("dashboardContent").hidden = true;
    return;
  }

  document.getElementById("emptyProfile").hidden = true;
  document.getElementById("dashboardContent").hidden = false;

  const traineeId = dashboardState.trainee.id;

  const [training, skills] = await Promise.all([
    supabaseClient.from("trainee_training").select("*").eq("trainee_id", traineeId),
    supabaseClient.from("trainee_skills").select("*").eq("trainee_id", traineeId)
  ]);

  if (training.error) throw training.error;
  if (skills.error) throw skills.error;

  setText("welcomeName", dashboardState.trainee.full_name || "Trainee");
  setText("profileStatus", dashboardState.trainee.employment_status || "Not set");
  setText("trainingCount", training.data?.length || 0);
  setText("skillsCount", skills.data?.length || 0);
  setText("profileDistrict", dashboardState.trainee.district || "—");
  setText("profileEducation", dashboardState.trainee.education_level || "—");
  setText("profileUpdated", formatDate(dashboardState.trainee.updated_at || dashboardState.trainee.created_at));

  const badge = document.getElementById("statusBadge");
  badge.textContent = dashboardState.trainee.employment_status || "Not set";
  badge.className = `status-badge ${statusClass(dashboardState.trainee.employment_status)}`;

  const trainingList = document.getElementById("trainingList");
  trainingList.innerHTML = (training.data || []).map(row => `
    <li>
      <strong>${escapeHtml(row.program_name || row.course_id || "Training")}</strong>
      <span>${escapeHtml(row.certification_status || "Recorded")}</span>
    </li>
  `).join("") || `<li class="empty-inline">No training records yet.</li>`;

  const skillList = document.getElementById("skillList");
  skillList.innerHTML = (skills.data || []).map(row => `
    <li>
      <strong>${escapeHtml(row.skill_name || "Skill")}</strong>
      <span>${escapeHtml(row.proficiency_level || row.skill_category || "Recorded")}</span>
    </li>
  `).join("") || `<li class="empty-inline">No skills recorded yet.</li>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

document.getElementById("logoutButton").addEventListener("click", signOutAndRedirect);
loadDashboard().catch(error => {
  console.error(error);
  const message = document.getElementById("dashboardError");
  message.hidden = false;
  message.textContent = error.message || "Unable to load dashboard.";
});
