import React from 'react';
import { ThemeProvider } from './lib/theme';
import { StoreProvider, useStore } from './lib/store';
import { Login } from './pages/Login';
import { ProfessorApp } from './pages/professor/ProfessorApp';
import { StudentApp } from './pages/student/StudentApp';
import { AdminApp } from './pages/admin/AdminApp';
import { DEMO_LOGINS } from './data/seed';
import { UserRound, GraduationCap, Building2, LogOut } from 'lucide-react';

function MainRouter() {
  const { session, login, logout } = useStore();

  if (!session) {
    return <Login />;
  }

  return (
    <>
      {session.role === 'professor' && <ProfessorApp />}
      {session.role === 'aluno' && <StudentApp />}
      {session.role === 'admin' && <AdminApp />}

      {/* Barra flutuante de demonstração para a apresentação executiva (invisível na impressão) */}
      <aside 
        aria-label="Controle de Demonstração"
        className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xl text-xs"
      >
        <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 px-2 hidden sm:inline">
          Demonstração:
        </span>
        {DEMO_LOGINS.map((l) => {
          const isActive = session.role === l.role;
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
        <button
          onClick={logout}
          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          title="Sair para tela de login"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </aside>
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
