import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

function createSafeClient(): SupabaseClient<Database> {
  if (!url || !anonKey) {
    // Fallback placeholder when running in local/demo mode without .env configured yet.
    return createClient<Database>("https://placeholder.supabase.co", "placeholder-anon-key", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createSafeClient();

/** URL pública do app usada nos redirecionamentos de autenticação. */
export const siteUrl: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) ??
  (typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL ?? "/"}`
    : "http://localhost:5173/");

/** Retorna os dados ou lança o erro do Supabase. */
export function unwrap<T>(res: { data: T | null; error: PostgrestError | null }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

export function assertOk(res: { error: PostgrestError | null }): void {
  if (res.error) throw res.error;
}
