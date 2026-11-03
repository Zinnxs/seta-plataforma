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
        'flex cursor-pointer items-center gap-3 rounded-xl text-sm transition-colors',
        compact ? 'h-9 shrink-0 px-3' : 'h-10 w-full px-3',
        active
          ? 'bg-stone-100 font-medium text-stone-900 dark:bg-stone-800/80 dark:text-white'
          : 'text-stone-500 hover:bg-stone-100/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
      {item.count > 0 && (
        <span className="ml-auto rounded-full bg-brand-100 px-1.5 text-[11px] font-medium tabular-nums text-brand-700 dark:bg-brand-900/60 dark:text-brand-200">
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
    <div className="min-h-screen">
      {/* Barra lateral (desktop) */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-stone-200/80 bg-white/70 px-4 py-6 md:flex dark:border-stone-800/80 dark:bg-stone-950/60">
        <Brand className="px-2" />

        <nav className="mt-10 flex-1 space-y-1">
          {nav.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </nav>

        <div className="space-y-3 border-t border-stone-200/80 pt-4 dark:border-stone-800">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={currentUser?.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle full className="flex-1 justify-start" />
            <Button variant="ghost" size="icon" onClick={logout} title="Sair" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Cabeçalho (mobile) */}
      <header className="no-print sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-950/85">
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
