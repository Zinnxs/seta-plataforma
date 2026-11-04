import { LogOut } from 'lucide-react';
import { useStore } from '../lib/store';
import { personName } from '../lib/format';
import { Avatar, Button, cn } from './ui';
import { Brand, ThemeToggle } from './Brand';

function NavItem({ item, active, onClick, compact }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl text-sm transition-all',
        compact ? 'h-9 shrink-0 px-3' : 'h-10 w-full px-3',
        active
          ? 'bg-amber-500/10 font-semibold text-amber-900 border-l-2 border-amber-500 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
      {item.count > 0 && (
        <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-500/30">
          {item.count}
        </span>
      )}
    </button>
  );
}

export function Layout({ nav, page, onNavigate, roleLabel, children }) {
  const { currentUser, logout } = useStore();
  const name = personName(currentUser);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 dark:bg-[#070d1e] dark:text-slate-100 transition-colors">
      {/* Barra lateral (desktop) */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-amber-500/15 bg-white/85 px-4 py-6 md:flex dark:border-amber-500/10 dark:bg-[#060a17]/95 backdrop-blur-md">
        <Brand className="px-2" />

        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={currentUser?.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">{roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle full className="flex-1 justify-start" />
            <Button variant="ghost" size="icon" onClick={logout} title="Sair do Portal SETA" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Cabeçalho (mobile) */}
      <header className="no-print sticky top-0 z-30 border-b border-amber-500/15 bg-white/90 backdrop-blur-md md:hidden dark:border-amber-500/10 dark:bg-[#060a17]/95">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map((item) => (
            <NavItem key={item.id} compact item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </nav>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
