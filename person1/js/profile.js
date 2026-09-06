const form = document.getElementById("profileForm");
let user = null;
let trainee = null;

function fillProfile(row, currentUser) {
  document.getElementById("full_name").value = row?.full_name || "";
  document.getElementById("email").value = currentUser.email || row?.email || "";
  document.getElementById("phone").value = row?.phone || "";
  document.getElementById("date_of_birth").value = row?.date_of_birth || "";
  document.getElementById("gender").value = row?.gender || "";
  document.getElementById("education_level").value = row?.education_level || "";
  document.getElementById("district").value = row?.district || "";
  document.getElementById("city").value = row?.city || "";
  document.getElementById("consent_given").checked = Boolean(row?.consent_given);
  document.getElementById("employment_status").value = row?.employment_status || "";
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = document.getElementById("saveButton");
  button.disabled = true;
  button.textContent = "Saving...";

  try {
    const payload = {
      user_id: user.id,
      full_name: document.getElementById("full_name").value.trim(),
      email: user.email,
      phone: document.getElementById("phone").value.trim(),
      date_of_birth: document.getElementById("date_of_birth").value,
      gender: document.getElementById("gender").value,
      education_level: document.getElementById("education_level").value,
      district: document.getElementById("district").value.trim(),
      city: document.getElementById("city").value.trim(),
      consent_given: document.getElementById("consent_given").checked,
      consent_date: document.getElementById("consent_given").checked
        ? (trainee?.consent_date || new Date().toISOString())
        : null,
      employment_status: document.getElementById("employment_status").value || null
    };

    const { data, error } = await supabaseClient
      .from("trainees")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;

    trainee = data;
    document.getElementById("message").className = "form-message success";
    document.getElementById("message").textContent = "Profile updated successfully.";
  } catch (error) {
    console.error(error);
    document.getElementById("message").className = "form-message error";
    document.getElementById("message").textContent = error.message || "Unable to update profile.";
  } finally {
    button.disabled = false;
    button.textContent = "Save changes";
  }
});

document.getElementById("logoutButton").addEventListener("click", signOutAndRedirect);

(async () => {
  try {
    user = await requireUser();
    if (!user) return;
    trainee = await getMyTrainee(user.id);
    if (trainee) fillProfile(trainee, user);
  } catch (error) {
    console.error(error);
    document.getElementById("message").className = "form-message error";
    document.getElementById("message").textContent = error.message;
  }
})();
