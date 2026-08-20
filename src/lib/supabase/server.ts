import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getSecretSupabaseEnv } from "./env";

export function createPublicServerClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function createSecretServerClient() {
  const { url, secretKey } = getSecretSupabaseEnv();

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
