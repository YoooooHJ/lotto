import { createSignup } from "../lib/db.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase ????? ???? ?????." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { name, email } = body;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedName || trimmedName.length > 100) {
    return res.status(400).json({ error: "??? 1~100? ??? ??? ???." });
  }

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: "??? ??? ??? ??? ???." });
  }

  try {
    const signup = await createSignup(trimmedName, trimmedEmail);
    return res.status(201).json({
      message: "??? ???????.",
      signup,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "?? ??? ??????." });
    }

    if (error.message?.includes("row-level security")) {
      return res.status(500).json({
        error: "Supabase RLS ???? ??? ???????.",
        detail:
          "Vercel? SUPABASE_SERVICE_ROLE_KEY? service_role ?? ??? ?????, SQL Editor?? ALTER TABLE signups DISABLE ROW LEVEL SECURITY; ? ?????.",
      });
    }

    return res.status(500).json({
      error: "?? ?? ? ??? ??????.",
      detail: error.message,
    });
  }
}
