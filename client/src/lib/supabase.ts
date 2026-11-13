import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Sem as variáveis, o app abre em modo demonstração (dados de exemplo, sem login real). */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url ?? "https://nao-configurado.invalid", anonKey ?? "nao-configurado", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "nadgol-auth" },
});
