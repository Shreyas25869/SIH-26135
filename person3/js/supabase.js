// Compatibility shim. The single Supabase client is owned by /auth/js/supabase.js.
if (!window.supabaseClient) console.error("Central Supabase client is not loaded.");
