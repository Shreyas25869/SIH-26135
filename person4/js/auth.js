// Compatibility helpers. Authentication and logout are owned by /auth.
async function currentUser() { return window.SIHAuth.getCurrentUser(); }
async function requireUser() {
  const user = await currentUser();
  if (!user) { window.SIHAuth.redirectToLogin(); return null; }
  return user;
}
async function signOutAndRedirect() {
  await window.SIHAuth.signOut();
  window.SIHAuth.redirectToLogin();
}
