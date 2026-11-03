import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, ExternalLink } from 'lucide-react';
import { Modal, Button, Field, Input, Callout } from './ui';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, credentialsSource } from '../lib/supabase';

export function SupabaseModal({ open, onClose, onSaveCredentials, syncStatus }) {
  const [url, setUrl] = useState(supabaseUrl || '');
  const [key, setKey] = useState(supabaseAnonKey || '');

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCredentials(url, key);
  };

  const handleDisconnect = () => {
    onSaveCredentials('', '');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conexão com Banco Supabase (PostgreSQL)"
      description="Conecte seu projeto gratuito do Supabase para ter persistência real na nuvem."
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {isSupabaseConfigured ? (
          <Callout icon={CheckCircle2} tone="brand">
            <div>
              <strong className="block font-semibold">Supabase Conectado!</strong>
              <p className="text-xs mt-0.5 opacity-90">
                Origem das credenciais: {credentialsSource === 'env' ? 'Variáveis de Ambiente (.env / Vercel)' : 'Configuração salva no navegador'}.
              </p>
              <p className="text-[11px] mt-1 opacity-75">
                Status de sincronização: {syncStatus === 'synced' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Conectado'}.
              </p>
            </div>
          </Callout>
        ) : (
          <Callout icon={AlertCircle} tone="amber">
            <div>
              <strong className="block font-semibold">Modo Demonstração Local Ativo</strong>
              <p className="text-xs mt-0.5 opacity-90">
                Os dados estão sendo salvos na memória do seu navegador. Conecte o Supabase abaixo para salvar tudo na nuvem.
              </p>
            </div>
          </Callout>
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
          {isSupabaseConfigured && (
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

        <div className="text-[11px] text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
          <p className="font-semibold text-stone-600 dark:text-stone-300">Como obter no Supabase gratuito:</p>
          <p>1. Crie seu projeto em <strong>supabase.com</strong>.</p>
          <p>2. No menu lateral, clique em <strong>Project Settings</strong> ➔ <strong>API</strong>.</p>
          <p>3. Copie o <strong>Project URL</strong> e a chave <strong>anon public</strong> e cole aqui!</p>
        </div>
      </form>
    </Modal>
  );
}
