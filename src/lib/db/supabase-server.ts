import { createClient } from "@supabase/supabase-js";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MessageAnalysisInsert = {
  project_id?: string | null;
  raw_message: string;
  audience: string;
  tone_score: number;
  blame_score: number;
  ambiguity_score: number;
  overall_risk: number;
  decision: Json;
  ai_output: Json;
  created_at?: string;
};

function requireUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  return url;
}

export const createSupabaseAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for privileged client.");
  console.warn("[security] privileged_client_used", { client: "createSupabaseAdminClient" });
  return createClient(requireUrl(), serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
};

export const createSupabasePublicServerClient = () => {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY for unprivileged server client.");
  return createClient(requireUrl(), anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
};
