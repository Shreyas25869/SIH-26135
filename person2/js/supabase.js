(function () {
  const cfg = window.APP_CONFIG || {};
  const ready = Boolean(
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")
  );
  window.supabaseReady = ready;
  window.supabaseClient = ready ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
})();
