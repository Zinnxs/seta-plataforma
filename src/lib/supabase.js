import { createClient } from '@supabase/supabase-js';

/**
 * Corrige e padroniza a URL do Supabase para o formato estrito esperado pelo SDK:
 * https://<project-ref>.supabase.co
 * 
 * Elimina preventivamente o erro do PostgREST:
 * "Invalid path specified in request URI."
 * Removendo quaisquer caminhos extras, aspas ou links do dashboard.
 */
export function formatSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let clean = rawUrl.trim().replace(/^['"]+|['"]+$/g, '');

  // 1. Se colou apenas o ID de referência do projeto (ex: "yqgqomvz...")
  if (/^[a-z0-9_-]{12,35}$/i.test(clean)) {
    return `https://${clean}.supabase.co`;
  }

  // 2. Se colou a URL da barra de endereço do Dashboard do Supabase:
  // ex: https://supabase.com/dashboard/project/yqgqomvz.../editor
  const dashboardMatch = clean.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // 3. Garante protocolo https:// se não fornecido
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // 4. Se for subdomínio *.supabase.co, extrai ESTRITAMENTE https://<subdominio>.supabase.co
  // Qualquer path adicional como /rest/v1 gera o erro fatal do PostgREST:
  // "Invalid path specified in request URI."
  try {
    const parsed = new URL(clean);
    if (parsed.hostname.toLowerCase().endsWith('.supabase.co')) {
      return `https://${parsed.hostname.toLowerCase()}`;
    }
    // Caso de servidor Supabase self-hosted customizado: retorne a origin sem paths de API
    return parsed.origin;
  } catch {
    // Fallback caso new URL falhe
    clean = clean.replace(/\/(rest|auth|storage|graphql)\/v[0-9]+(\/.*)?$/i, '');
    clean = clean.replace(/\/+$/, '');
    return clean;
  }
}

/**
 * Normaliza as credenciais e detecta se o usuário inverteu URL e Anon Key por engano
 */
export function normalizeCredentials(rawUrl, rawKey) {
  let cleanUrl = (rawUrl || '').trim().replace(/^['"]+|['"]+$/g, '');
  let cleanKey = (rawKey || '').trim().replace(/^['"]+|['"]+$/g, '');

  // A chave Anon Key é SEMPRE um token JWT longo iniciando em "eyJ"
  // Se cleanUrl começa com "eyJ" e cleanKey tem "supabase" ou "http", o usuário inverteu os campos!
  if (cleanUrl.startsWith('eyJ') && (cleanKey.includes('supabase') || cleanKey.startsWith('http'))) {
    const temp = cleanUrl;
    cleanUrl = cleanKey;
    cleanKey = temp;
  }

  return {
    url: formatSupabaseUrl(cleanUrl),
    key: cleanKey,
  };
}

// Tenta obter as credenciais do ambiente Vite (.env ou Vercel)
// Ou de uma configuração salva no localStorage pelo usuário
const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    const norm = normalizeCredentials(envUrl, envKey);
    if (norm.url && norm.key) {
      return { url: norm.url, key: norm.key, source: 'env' };
    }
  }

  try {
    const local = localStorage.getItem('seta-supabase-credentials');
    if (local) {
      const parsed = JSON.parse(local);
      const norm = normalizeCredentials(parsed.url, parsed.key);
      if (norm.url && norm.key) {
        // Se a normalização corrigiu algo no localStorage, atualiza silenciosamente
        if (norm.url !== parsed.url || norm.key !== parsed.key) {
          localStorage.setItem(
            'seta-supabase-credentials',
            JSON.stringify({ url: norm.url, key: norm.key })
          );
        }
        return { url: norm.url, key: norm.key, source: 'local' };
      }
    }
  } catch (e) {
    /* ignore */
  }

  return { url: '', key: '', source: 'none' };
};

export const { url: supabaseUrl, key: supabaseAnonKey, source: credentialsSource } = getCredentials();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = (() => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    });
  } catch (err) {
    console.error('Falha ao instanciar cliente do Supabase:', err);
    return null;
  }
})();

/** Salva credenciais do Supabase no navegador e recarrega */
export function saveSupabaseCredentials(url, key) {
  const norm = normalizeCredentials(url, key);

  if (!norm.url || !norm.key) {
    localStorage.removeItem('seta-supabase-credentials');
  } else {
    localStorage.setItem(
      'seta-supabase-credentials',
      JSON.stringify({ url: norm.url, key: norm.key })
    );
  }
  window.location.reload();
}
