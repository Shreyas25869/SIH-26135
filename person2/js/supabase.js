// Compatibility shim. The single Supabase client is owned by /auth/js/supabase.js.
window.supabaseReady = Boolean(window.supabaseClient);
