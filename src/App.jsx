import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './lib/theme';
import { StoreProvider, useStore } from './lib/store';
import { Login } from './pages/Login';
import { ProfessorApp } from './pages/professor/ProfessorApp';
import { StudentApp } from './pages/student/StudentApp';
import { AdminApp } from './pages/admin/AdminApp';
import { SupabaseModal } from './components/SupabaseModal';
import { SetaSymbol } from './components/SetaLogo';
import { Database, Lock, RefreshCw, Trash2 } from 'lucide-react';

function MainRouter() {
  const { session, currentUser, isSupabaseConfigured, syncStatus, lastSyncError, saveSupabaseCredentials, logout } = useStore();
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Alunos e professores não devem ver nem ter acesso ao botão de configuração do banco
  const isStudentOrProfessor = session && session.role !== 'admin';

  // Se houver sessão salva no localStorage mas o usuário não foi localizado após o carregamento inicial, limpa a sessão inconsistente
  useEffect(() => {
    if (session && !currentUser && syncStatus !== 'syncing') {
      console.warn('Sessão ativa com usuário não encontrado no banco. Limpando sessão inconsistente...');
      logout();
    }
  }, [session, currentUser, syncStatus, logout]);

  // Enquanto os dados estiverem sendo sincronizados com o Supabase
  if (session && !currentUser && syncStatus === 'syncing') {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#131417] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#B48636] border-t-transparent mx-auto dark:border-[#E0A94E]" />
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">Portal SETA</h2>
            <p className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E9C96]">Carregando ambiente acadêmico...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="min-h-screen bg-[#FAF9F5] text-[#1D1B18] dark:bg-[#131417] dark:text-[#EDEDE8] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-5 rounded-2xl border border-black/[0.08] bg-[#FFFFFF] p-8 shadow-xl dark:border-white/[0.08] dark:bg-[#1B1C22]">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full border border-black/[0.08] bg-[#FAF9F5] p-3 text-[#9E6C1B] dark:border-white/[0.1] dark:bg-[#131417] dark:text-[#E0A94E]">
              <SetaSymbol className="w-full h-full" strokeWidth={1.5} />
            </div>
            
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1D1B18] dark:text-[#EDEDE8]">Portal SETA</h2>
              <p className="mt-1 text-sm text-[#6E6A63] dark:text-[#9E9C96]">
                Ocorreu uma pequena instabilidade no carregamento da tela.
              </p>
            </div>

            {this.state.error?.message && (
              <p className="text-xs font-mono bg-black/[0.04] text-[#A04E36] p-3 rounded-lg overflow-x-auto text-left dark:bg-black/30 dark:text-rose-300">
                {this.state.error.message}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-[#B48636] hover:bg-[#9B7028] text-white dark:bg-[#E0A94E] dark:text-[#131417] transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <RefreshCw className="h-4 w-4" /> Recarregar Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('seta-session-v5');
                    localStorage.removeItem('seta-data-v5');
                  } catch (e) {
                    console.error(e);
                  }
                  window.location.reload();
                }}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-[#6E6A63] hover:text-[#A04E36] dark:text-[#9E9C96] dark:hover:text-rose-400 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar Sessão e Cache Local
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
