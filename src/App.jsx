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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal SETA - Erro capturado pela ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070d1e] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-5 rounded-2xl border border-amber-500/25 bg-[#091024] p-8 shadow-2xl">
            <div className="mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-amber-400/50 p-1 bg-[#070d1e]">
              <img src="/portal_seta_symbol.png" alt="Portal SETA" className="h-full w-full object-contain" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-100">Portal SETA</h2>
            <p className="text-sm text-slate-300">
              Ocorreu uma pequena instabilidade no carregamento da tela.
            </p>
            {this.state.error?.message && (
              <p className="text-xs font-mono bg-black/40 text-rose-300 p-3 rounded-lg overflow-x-auto text-left">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition cursor-pointer"
              >
                Recarregar Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('seta-session-v5');
                  window.location.reload();
                }}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
              >
                Sair da Sessão Atual
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          <MainRouter />
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
