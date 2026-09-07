/* Central Supabase client for the SIH-26135 authentication module. */
const SUPABASE_URL = "https://ntkbegbletsjexwcbmob.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50a2JlZ2JsZXRzamV4d2NibW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTk0MDMsImV4cCI6MjA0NDk1NTg3MX0.X7N7c1B_TP4lNnlfEqQT1HSUbkIJPC3dHHSJw9irs";
if (!window.supabase) throw new Error("Supabase JS library did not load.");
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
