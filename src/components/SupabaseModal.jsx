import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Lock, 
  ShieldCheck, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Modal, Button, Field, Input, Callout } from './ui';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, credentialsSource } from '../lib/supabase';

export function SupabaseModal({ open, onClose, onSaveCredentials, syncStatus, lastSyncError, session }) {
  // Se o usuário já estiver logado como admin na sessão, já inicia desbloqueado
  const isAdminLoggedIn = session?.role === 'admin';
  const [unlocked, setUnlocked] = useState(isAdminLoggedIn);

  // Credenciais do modal admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Configurações do Supabase
  const [url, setUrl] = useState(supabaseUrl || '');
  const [key, setKey] = useState(supabaseAnonKey || '');

  // Sincroniza desbloqueio caso a sessão mude
  useEffect(() => {
    if (isAdminLoggedIn) {
      setUnlocked(true);
    } else {
      setUnlocked(false);
    }
    setAuthError('');
    setAdminEmail('');
    setAdminPassword('');
  }, [open, isAdminLoggedIn]);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (cleanEmail === 'admin@seta.com' && cleanPass === 'setaadmin987') {
      setUnlocked(true);
    } else {
      setAuthError('Credenciais de administrador inválidas. Apenas a Direção pode acessar as configurações do banco.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCredentials(url, key);
  };

  const handleDisconnect = () => {
    if (confirm('Deseja realmente desconectar as credenciais locais do Supabase?')) {
      onSaveCredentials('', '');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conexão com Banco de Dados Supabase (PostgreSQL)"
      description="Gerenciamento do banco na nuvem oficial do Seminário Teológico Aliança."
      size="md"
    >
      {!unlocked ? (
        /* Tela de Bloqueio - Exige login de admin */
        <form onSubmit={handleAdminAuth} className="space-y-4">
          <Callout icon={Lock} tone="amber">
            <div>
              <strong className="block font-semibold">Acesso Restrito à Direção</strong>
              <p className="text-xs mt-0.5 opacity-90">
                A configuração e visualização das chaves do banco de dados são restritas aos administradores do SETA.
              </p>
            </div>
          </Callout>

          <Field label="E-mail de Administrador">
            <Input
              type="email"
              required
              placeholder="admin@seta.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </Field>

          <Field label="Senha de Administrador">
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </Field>

          {authError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {authError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <ShieldCheck className="h-4 w-4" /> Desbloquear Configurações
            </Button>
          </div>
        </form>
      ) : (
        /* Tela Desbloqueada - Configuração do Supabase */
        <form onSubmit={handleSave} className="space-y-4">
          {isSupabaseConfigured ? (
            <Callout icon={CheckCircle2} tone="brand">
              <div>
                <strong className="block font-semibold">Supabase Conectado!</strong>
                <p className="text-xs mt-0.5 opacity-90">
                  Origem: {credentialsSource === 'env' ? 'Variáveis de Ambiente do Vercel (.env)' : 'Configuração salva no navegador'}.
                </p>
                <p className="text-[11px] mt-1 opacity-75">
                  Status de Sincronização: {syncStatus === 'synced' ? '🟢 Sincronizado e Ativo' : syncStatus === 'syncing' ? '🟡 Sincronizando...' : '🔴 Erro de sincronização'}.
                </p>
              </div>
            </Callout>
          ) : (
            <Callout icon={AlertCircle} tone="amber">
              <div>
                <strong className="block font-semibold">Banco Supabase Não Detectado</strong>
                <p className="text-xs mt-0.5 opacity-90">
                  Este navegador ainda não está sincronizado com a nuvem. Insira as credenciais abaixo para salvar tudo no PostgreSQL.
                </p>
              </div>
            </Callout>
          )}

          {lastSyncError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de sincronização:</strong>
                <p className="mt-0.5">{lastSyncError}</p>
                <p className="text-[11px] mt-1 opacity-80">
                  Certifique-se de executar o script <strong>supabase_schema.sql</strong> no SQL Editor do Supabase para criar as tabelas.
                </p>
              </div>
            </div>
          )}

          <Field label="URL do Projeto Supabase (Project URL)">
            <Input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>

          <Field label="Chave Pública Anônima (Anon Public Key)">
            <Input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </Field>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
            {isSupabaseConfigured && credentialsSource === 'local' && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDisconnect} className="text-rose-500">
                Desconectar
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="secondary" onClick={onClose}>
                Fechar
              </Button>
              <Button type="submit">
                Salvar e Conectar
              </Button>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">Passo a passo no Supabase:</p>
            <p>1. Acesse seu painel em <strong>supabase.com</strong>.</p>
            <p>2. Vá em <strong>Project Settings ➔ API</strong> e copie a <strong>Project URL</strong> e a <strong>anon public key</strong>.</p>
            <p>3. No menu <strong>SQL Editor</strong>, cole o código do arquivo <code>supabase_schema.sql</code> e clique em <strong>RUN</strong> para criar as tabelas.</p>
          </div>
        </form>
      )}
    </Modal>
  );
}
