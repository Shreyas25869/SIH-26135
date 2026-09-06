async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

async function signOutAndRedirect() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error(error);
    alert(error.message || "Unable to sign out.");
    return;
  }
  window.location.href = "login.html";
}

async function getMyTrainee(userId) {
  const { data, error } = await supabaseClient
    .from("trainees")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function requireTrainee(userId) {
  const trainee = await getMyTrainee(userId);
  if (!trainee) {
    window.location.href = "register.html";
    return null;
  }
  return trainee;
}
