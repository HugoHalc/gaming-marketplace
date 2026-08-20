import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./env";

export function createAuthBrowserClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
