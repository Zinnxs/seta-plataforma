import React, { useState } from 'react';
import { ThemeProvider } from './lib/theme';
import { StoreProvider, useStore } from './lib/store';
import { Login } from './pages/Login';
import { ProfessorApp } from './pages/professor/ProfessorApp';
import { StudentApp } from './pages/student/StudentApp';
import { AdminApp } from './pages/admin/AdminApp';
import { SupabaseModal } from './components/SupabaseModal';
import { DEMO_LOGINS } from './data/seed';
import { UserRound, GraduationCap, Building2, LogOut, Database } from 'lucide-react';

function MainRouter() {
  const { session, login, logout, isSupabaseConfigured, syncStatus, saveSupabaseCredentials } = useStore();
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

      {/* Barra flutuante de demonstração e status do Supabase */}
      <aside 
        aria-label="Controle de Demonstração e Banco"
        className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xl text-xs"
      >
        {/* Botão de Status / Conexão do Supabase */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer border ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700 hover:border-brand-400'
          }`}
          title="Clique para configurar o banco Supabase na nuvem"
        >
          <Database className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-semibold">
            {isSupabaseConfigured ? 'Supabase Nuvem' : 'Conectar Supabase'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
        </button>

        <span className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-0.5 hidden sm:inline" />

        {/* Switcher de Perfis */}
        <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 px-1 hidden sm:inline">
          Demonstração:
        </span>
        {DEMO_LOGINS.map((l) => {
          const isActive = session?.role === l.role;
          const Icon = l.role === 'aluno' ? GraduationCap : l.role === 'professor' ? UserRound : Building2;
          return (
            <button
              key={l.role}
              onClick={() => login(l.email, l.password)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white dark:bg-brand-400 dark:text-stone-950 font-bold shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={`Trocar para visão de ${l.label}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{l.label}</span>
            </button>
          );
        })}

        {session && (
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Sair para tela de login"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
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
