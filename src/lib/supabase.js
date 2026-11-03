import { createClient } from '@supabase/supabase-js';

/**
 * Corrige e padroniza a URL do Supabase para o formato esperado pelo SDK:
 * https://<project-ref>.supabase.co
 * Remove automaticamente caminhos extras como /rest/v1 ou URLs do dashboard
 */
export function formatSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let clean = rawUrl.trim();

  // 1. Se o usuário colou a URL do dashboard: https://supabase.com/dashboard/project/xyzabcdef/...
  const dashboardMatch = clean.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    clean = `https://${dashboardMatch[1]}.supabase.co`;
  }

  // 2. Remove caminhos da API colados por engano (/rest/v1, /auth/v1, etc.)
  clean = clean.replace(/\/(rest|auth|storage)\/v[0-9]+(\/.*)?$/i, '');

  // 3. Remove quaisquer barras no final
  clean = clean.replace(/\/+$/, '');

  // 4. Garante o protocolo https:// se não tiver
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  return clean;
}

// Tenta obter as credenciais do ambiente Vite (.env ou Vercel)
// Ou de uma configuração salva no localStorage pelo usuário
const getCredentials = () => {
  const envUrl = formatSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  try {
    const local = localStorage.getItem('seta-supabase-credentials');
    if (local) {
      const parsed = JSON.parse(local);
      const formattedLocalUrl = formatSupabaseUrl(parsed.url);
      const cleanLocalKey = (parsed.key || '').trim();
      if (formattedLocalUrl && cleanLocalKey) {
        return { url: formattedLocalUrl, key: cleanLocalKey, source: 'local' };
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
  const cleanUrl = formatSupabaseUrl(url);
  const cleanKey = (key || '').trim();

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem('seta-supabase-credentials');
  } else {
    localStorage.setItem(
      'seta-supabase-credentials',
      JSON.stringify({ url: cleanUrl, key: cleanKey })
    );
  }
  window.location.reload();
}
