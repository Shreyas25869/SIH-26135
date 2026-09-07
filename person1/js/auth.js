// Compatibility helpers for Person 1 pages.
// Authentication is owned by /auth and guarded by auth/js/module-guard.js.
async function getCurrentUser() { return window.SIHAuth.getCurrentUser(); }
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) { window.SIHAuth.redirectToLogin(); return null; }
  return user;
}
async function signOutAndRedirect() {
  await window.SIHAuth.signOut();
  window.SIHAuth.redirectToLogin();
}
async function getMyTrainee(userId) {
  const { data, error } = await window.supabaseClient.from("trainees").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
async function requireTrainee(userId) {
  const trainee = await getMyTrainee(userId);
  if (!trainee) { window.location.replace("register.html"); return null; }
  return trainee;
}
