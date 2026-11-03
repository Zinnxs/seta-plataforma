import React, { useState } from 'react';
import { ThemeProvider } from './lib/theme';
import { StoreProvider, useStore } from './lib/store';
import { Login } from './pages/Login';
import { ProfessorApp } from './pages/professor/ProfessorApp';
import { StudentApp } from './pages/student/StudentApp';
import { AdminApp } from './pages/admin/AdminApp';
import { SupabaseModal } from './components/SupabaseModal';
import { Database, Lock } from 'lucide-react';

function MainRouter() {
  const { session, isSupabaseConfigured, syncStatus, lastSyncError, saveSupabaseCredentials } = useStore();
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Alunos e professores não devem ver nem ter acesso ao botão de configuração do banco
  const isStudentOrProfessor = session && session.role !== 'admin';

  return (
    <>
      {!session ? (
        <Login />
      ) : (
        <>
          {session.role === 'professor' && <ProfessorApp />}
          {session.role === 'aluno' && <StudentApp />}
          {session.role === 'admin' && <AdminApp onOpenSupabaseConfig={() => setSupabaseModalOpen(true)} />}
        </>
      )}

      {/* Botão protegido de acesso ao banco (visível apenas na tela de login e no perfil de admin) */}
      {!isStudentOrProfessor && (
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
            title="Acesso restrito à Direção para configuração do banco"
          >
            {session?.role === 'admin' ? (
              <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-stone-500" />
            )}
            <span className="font-medium">
              {isSupabaseConfigured 
                ? (session?.role === 'admin' ? 'Supabase Conectado' : 'Banco Nuvem') 
                : 'Configurar Banco (Direção)'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </button>
        </aside>
      )}

      {/* Modal de Configuração do Supabase com Bloqueio Administrativo */}
      <SupabaseModal
        open={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onSaveCredentials={saveSupabaseCredentials}
        syncStatus={syncStatus}
        lastSyncError={lastSyncError}
        session={session}
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
