const state = {
  user: null,
  trainee: null,
  selectedPrograms: new Set(),
  selectedStatus: null
};

const PROGRAMS = [
  {
    id: "PMKVY",
    title: "Pradhan Mantri Kaushal Vikas Yojana",
    desc: "Short-term vocational skill training and certification.",
    icon: "📜"
  },
  {
    id: "ITI",
    title: "Government ITI Training",
    desc: "Technical and trade-oriented Industrial Training Institute courses.",
    icon: "🏛️"
  },
  {
    id: "Apprenticeship",
    title: "NAPS / NATS Apprenticeship",
    desc: "Practical, on-the-job industrial training.",
    icon: "⚙️"
  },
  {
    id: "Other_MH_Initiative",
    title: "Other State Skill Initiative",
    desc: "Other state-sponsored skill or entrepreneurship programs.",
    icon: "🏬"
  }
];

const STATUS_META = {
  employed: ["Employed", "Currently working in an organization.", "💼"],
  unemployed: ["Unemployed", "Currently looking for work.", "⏳"],
  apprenticeship: ["Apprenticeship", "Currently in an apprenticeship.", "🛠️"],
  self_employed: ["Self-employed", "Running a business, freelance activity, or enterprise.", "🚀"],
  higher_studies: ["Higher studies", "Currently pursuing further education.", "🎓"]
};

function byId(id) {
  return document.getElementById(id);
}

function showMessage(text, type = "info") {
  const element = byId("message");
  element.textContent = text || "";
  element.className = `form-message ${type}`;
}

function setBusy(button, busy, busyText = "Saving...") {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function renderPrograms() {
  const container = byId("programList");
  container.innerHTML = PROGRAMS.map(program => `
    <button type="button"
      class="choice-card program-card"
      data-program="${program.id}"
      aria-pressed="false">
      <span class="choice-icon">${program.icon}</span>
      <span class="choice-copy">
        <strong>${program.title}</strong>
        <small>${program.desc}</small>
      </span>
      <span class="choice-check">✓</span>
    </button>
  `).join("");

  container.querySelectorAll("[data-program]").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.program;
      if (state.selectedPrograms.has(id)) {
        state.selectedPrograms.delete(id);
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
      } else {
        state.selectedPrograms.add(id);
        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");
      }
      updateProgress();
    });
  });
}

function renderStatuses() {
  const container = byId("statusList");
  container.innerHTML = Object.entries(STATUS_META).map(([id, [title, desc, icon]]) => `
    <button type="button"
      class="choice-card status-card"
      data-status="${id}"
      aria-pressed="false">
      <span class="choice-icon">${icon}</span>
      <span class="choice-copy">
        <strong>${title}</strong>
        <small>${desc}</small>
      </span>
      <span class="choice-check">✓</span>
    </button>
  `).join("");

  container.querySelectorAll("[data-status]").forEach(card => {
    card.addEventListener("click", () => {
      state.selectedStatus = card.dataset.status;
      container.querySelectorAll(".selected").forEach(x => {
        x.classList.remove("selected");
        x.setAttribute("aria-pressed", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
      byId("statusNext").disabled = false;
      updateProgress();
    });
  });
}

function updateProgress(active = state.currentStep || 1) {
  state.currentStep = active;
  const steps = document.querySelector(".steps");
  if (steps) steps.hidden = active === "success";

  document.querySelectorAll(".step").forEach(step => {
    const n = Number(step.dataset.step);
    step.classList.toggle("active", n === active);
    step.classList.toggle("completed", typeof active === "number" && n < active);
    const dot = step.querySelector(".step-dot");
    if (dot) dot.textContent = (typeof active === "number" && n < active) ? "✓" : String(n);
  });
}

function goToStep(step) {
  document.querySelectorAll(".wizard-page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === String(step));
  });
  updateProgress(step);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep1() {
  const form = byId("profileForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  if (!byId("consent_given").checked) {
    showMessage("Consent is required before continuing.", "error");
    return false;
  }
  return true;
}

function validateStep2() {
  if (state.selectedPrograms.size === 0) {
    showMessage("Select at least one training program.", "error");
    return false;
  }
  return true;
}

function validateStep3() {
  if (!state.selectedStatus) {
    showMessage("Select your current employment status.", "error");
    return false;
  }
  return true;
}

function showStatusDetails() {
  document.querySelectorAll(".status-form").forEach(form => {
    form.hidden = true;
  });
  const target = byId(`form_${state.selectedStatus}`);
  if (target) target.hidden = false;
}

function collectDetails() {
  const details = {
    employer_name: byId("emp_name")?.value.trim() || null,
    job_role: byId("emp_role")?.value.trim() || null,
    joining_date: byId("emp_joining_date")?.value || null,
    employment_type: byId("emp_type")?.value || null,
    monthly_salary: Number(byId("emp_salary")?.value) || null,
    job_location: byId("emp_location")?.value.trim() || null,
    unemployment_reason: byId("unemp_reason")?.value || null,
    desired_job_role: byId("desired_job")?.value.trim() || null,
    skill_gap_text: byId("skill_gap_input")?.value.trim() || null,
    apprenticeship_company: byId("appr_company")?.value.trim() || null,
    apprenticeship_contract_id: byId("appr_contract_id")?.value.trim() || null,
    monthly_stipend: Number(byId("appr_stipend")?.value) || null,
    business_type: byId("business_type")?.value.trim() || null,
    business_start_date: byId("business_start_date")?.value || null,
    higher_study_course: byId("hs_course")?.value.trim() || null,
    higher_study_institution: byId("hs_institution")?.value.trim() || null
  };

  return details;
}

function validateDetails() {
  const activeForm = byId(`form_${state.selectedStatus}`);
  if (!activeForm) return false;

  // Only the selected status form participates in browser constraint validation.
  document.querySelectorAll(".status-form").forEach(form => {
    const isActive = form === activeForm;
    form.querySelectorAll("input, select, textarea").forEach(input => {
      input.disabled = !isActive;
    });
  });

  if (!activeForm.checkValidity()) {
    activeForm.querySelector("input:invalid, select:invalid, textarea:invalid")?.reportValidity();
    return false;
  }
  return true;
}

function makeSkillRecords(details, traineeId) {
  const records = [];
  if (details.skill_gap_text) {
    records.push({
      trainee_id: traineeId,
      skill_name: details.skill_gap_text,
      skill_category: "Identified Skill Gap",
      proficiency_level: "Needs Improvement"
    });
  }

  const targetRole = details.desired_job_role || details.job_role;
  if (targetRole) {
    records.push({
      trainee_id: traineeId,
      skill_name: targetRole,
      skill_category: "Target Job Role",
      proficiency_level: "Aspiring"
    });
  }
  return records;
}

async function upsertTrainee(user, details) {
  const now = new Date().toISOString();

  const payload = {
    user_id: user.id,
    full_name: byId("full_name").value.trim(),
    email: user.email,
    phone: byId("phone").value.trim(),
    date_of_birth: byId("date_of_birth").value,
    gender: byId("gender").value,
    education_level: byId("education_level").value,
    district: byId("district").value.trim(),
    city: byId("city").value.trim(),
    consent_given: byId("consent_given").checked,
    consent_date: now,
    employment_status: STATUS_META[state.selectedStatus][0]
  };

  const { data, error } = await supabaseClient
    .from("trainees")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw new Error(`Trainee profile: ${error.message}`);
  return data;
}

async function saveTraining(traineeId) {
  const records = Array.from(state.selectedPrograms).map(programName => ({
    trainee_id: traineeId,
    program_name: programName,
    certification_status: "Completed"
  }));

  // Avoid duplicating records when the user revisits registration.
  const { data: existing, error: existingError } = await supabaseClient
    .from("trainee_training")
    .select("id, program_name")
    .eq("trainee_id", traineeId);

  if (existingError) {
    // If the shared schema doesn't expose program_name, report the exact DB error.
    throw new Error(`Training records: ${existingError.message}`);
  }

  const existingNames = new Set((existing || []).map(row => row.program_name));
  const newRecords = records.filter(row => !existingNames.has(row.program_name));

  if (!newRecords.length) return;

  const { error } = await supabaseClient
    .from("trainee_training")
    .insert(newRecords);

  if (error) throw new Error(`Training records: ${error.message}`);
}

async function saveSkills(traineeId, details) {
  const records = makeSkillRecords(details, traineeId);
  if (!records.length) return;

  const { error } = await supabaseClient
    .from("trainee_skills")
    .insert(records);

  if (error) throw new Error(`Skill records: ${error.message}`);
}

async function submitRegistration() {
  if (!validateDetails()) return;

  const button = byId("submitButton");
  setBusy(button, true, "Saving profile...");

  try {
    const details = collectDetails();
    state.trainee = await upsertTrainee(state.user, details);
    await saveTraining(state.trainee.id);
    await saveSkills(state.trainee.id, details);

    byId("successName").textContent = state.trainee.full_name;
    byId("successStatus").textContent = STATUS_META[state.selectedStatus][0];
    goToStep("success");
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to save the trainee profile.", "error");
  } finally {
    setBusy(button, false);
  }
}

function wireNavigation() {
  byId("step1Next").addEventListener("click", () => {
    if (validateStep1()) {
      showMessage("");
      goToStep(2);
    }
  });

  byId("step2Back").addEventListener("click", () => goToStep(1));
  byId("step2Next").addEventListener("click", () => {
    if (validateStep2()) {
      showMessage("");
      goToStep(3);
    }
  });

  byId("step3Back").addEventListener("click", () => goToStep(2));
  byId("statusNext").addEventListener("click", () => {
    if (validateStep3()) {
      showMessage("");
      showStatusDetails();
      goToStep(4);
    }
  });

  byId("step4Back").addEventListener("click", () => goToStep(3));
  byId("detailsForm").addEventListener("submit", event => {
    event.preventDefault();
    submitRegistration();
  });

  byId("successDashboard").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  byId("logoutButton").addEventListener("click", signOutAndRedirect);
}

(async function init() {
  try {
    state.user = await requireUser();
    if (!state.user) return;

    renderPrograms();
    renderStatuses();
    wireNavigation();

    const existing = await getMyTrainee(state.user.id);
    if (existing) {
      // Prefill editable profile data when the page is revisited.
      byId("full_name").value = existing.full_name || "";
      byId("email").value = state.user.email || existing.email || "";
      byId("phone").value = existing.phone || "";
      byId("date_of_birth").value = existing.date_of_birth || "";
      byId("gender").value = existing.gender || "";
      byId("education_level").value = existing.education_level || "";
      byId("district").value = existing.district || "";
      byId("city").value = existing.city || "";
      byId("consent_given").checked = Boolean(existing.consent_given);
    }

    updateProgress(1);
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to initialize registration.", "error");
  }
})();
