// Shared Supabase client for Person 1.
// Replace these placeholders with the project's Supabase URL and anon/public key.

const SUPABASE_URL = "https://ntkbegbletsjexwcbmob.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50a2JlZ2JsZXRzamV4d2NibW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTk4MDEsImV4cCI6MjEwNDI5NTgwMX0.X7N67d1B_TP4lNllfEeQT1HSUbkIJLPc3dDHSJw9irs";

if (!window.supabase) {
  throw new Error("Supabase JS library did not load.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
