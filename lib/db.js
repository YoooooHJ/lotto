import { createClient } from "@supabase/supabase-js";

let supabase = null;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("SUPABASE_URL ?? SUPABASE_SERVICE_ROLE_KEY? ???? ?????.");
    }

    supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return supabase;
}

export async function createSignup(name, email) {
  const { data, error } = await getSupabase()
    .from("signups")
    .insert({ name, email })
    .select("id, name, email, created_at")
    .single();

  if (error) throw error;
  return data;
}
