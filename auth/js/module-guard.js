(() => {
  const db = window.supabaseClient;
  window.SIHAuth = {
    getSession: async () => {
      if (!db) throw new Error("Central Supabase client is unavailable.");
      const { data, error } = await db.auth.getSession();
      if (error) throw error;
      return data.session || null;
    },
    getCurrentUser: async () => {
      const session = await window.SIHAuth.getSession();
      return session?.user || null;
    },
    signOut: async () => {
      if (!db) return;
      const { error } = await db.auth.signOut();
      if (error) throw error;
    },
    redirectToLogin: () => { location.replace("../auth/index.html"); }
  };

  const path = location.pathname;
  const required = path.includes("/person1/") ? "trainee" :
    path.includes("/person2/") ? "provider" :
    path.includes("/person3/") ? "employer" : null;

  async function run() {
    if (!db) { window.SIHAuth.redirectToLogin(); return; }
    const session = await window.SIHAuth.getSession();
    if (!session?.user) { window.SIHAuth.redirectToLogin(); return; }
    if (!required) return;
    const role = await getAuthenticatedRole(session.user);
    if (role !== required) { window.SIHAuth.redirectToLogin(); }
  }

  run().catch(error => {
    console.error("Module auth guard failed", error);
    window.SIHAuth.redirectToLogin();
  });
})();
