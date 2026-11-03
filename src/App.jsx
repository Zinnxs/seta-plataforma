import React, { useState } from 'react';
import { ThemeProvider } from './lib/theme';
import { StoreProvider, useStore } from './lib/store';
import { Login } from './pages/Login';
import { ProfessorApp } from './pages/professor/ProfessorApp';
import { StudentApp } from './pages/student/StudentApp';
import { AdminApp } from './pages/admin/AdminApp';
import { SupabaseModal } from './components/SupabaseModal';
import { Database } from 'lucide-react';

function MainRouter() {
  const { session, isSupabaseConfigured, syncStatus, saveSupabaseCredentials } = useStore();
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  return (
    <>
      {!session ? (
        <Login />
      ) : (
        <>
          {session.role === 'professor' && <ProfessorApp />}
          {session.role === 'aluno' && <StudentApp />}
          {session.role === 'admin' && <AdminApp />}
        </>
      )}

      {/* Indicador e botão discreto de conexão do Supabase */}
      <aside 
        aria-label="Status do Banco Supabase"
        className="no-print fixed bottom-4 right-4 z-40"
      >
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition cursor-pointer border shadow-md text-xs backdrop-blur-md ${
            isSupabaseConfigured
              ? 'bg-emerald-50/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-white/90 text-stone-700 border-stone-300 hover:border-brand-500 dark:bg-stone-900/90 dark:text-stone-300 dark:border-stone-700'
          }`}
          title="Clique para ver ou configurar as credenciais do Supabase"
        >
          <Database className="h-3.5 w-3.5" />
          <span className="font-medium">
            {isSupabaseConfigured ? 'Supabase Conectado' : 'Configurar Supabase'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        </button>
      </aside>

      {/* Modal de Configuração do Supabase */}
      <SupabaseModal
        open={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onSaveCredentials={saveSupabaseCredentials}
        syncStatus={syncStatus}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <MainRouter />
      </StoreProvider>
    </ThemeProvider>
  );
}
