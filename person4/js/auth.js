// Compatibility shim. Authentication is owned by the centralized /auth module.
async function currentUser(){ return window.SIHAuth.getCurrentUser(); }
async function requireUser(){
  const user = await currentUser();
  if(!user){ window.SIHAuth.redirectToLogin(); return null; }
  return user;
}
