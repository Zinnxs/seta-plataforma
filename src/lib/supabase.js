import { createClient } from '@supabase/supabase-js';

// Tenta obter as credenciais do ambiente Vite (.env ou Vercel)
// Ou de uma configuração salva no localStorage pelo usuário
const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  try {
    const local = localStorage.getItem('seta-supabase-credentials');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key, source: 'local' };
      }
    }
  } catch (e) {
    /* ignore */
  }

  return { url: '', key: '', source: 'none' };
};

export const { url: supabaseUrl, key: supabaseAnonKey, source: credentialsSource } = getCredentials();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    })
  : null;

/** Salva credenciais do Supabase no navegador e recarrega */
export function saveSupabaseCredentials(url, key) {
  if (!url || !key) {
    localStorage.removeItem('seta-supabase-credentials');
  } else {
    localStorage.setItem(
      'seta-supabase-credentials',
      JSON.stringify({ url: url.trim(), key: key.trim() })
    );
  }
  window.location.reload();
}
