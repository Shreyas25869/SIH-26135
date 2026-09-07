// Compatibility shim. The single Supabase client is owned by /auth/js/supabase.js.
if (!window.supabaseClient) throw new Error("Central Supabase client is not loaded.");
