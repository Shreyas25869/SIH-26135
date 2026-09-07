/* Central Supabase client for the SIH-26135 authentication module. */
const SUPABASE_URL = "https://ntkbegbletsjexwcbmob.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EDcKx8xT5jLwsYa9PTJF6w_N4kcMWSN";
if (!window.supabase) throw new Error("Supabase JS library did not load.");
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
