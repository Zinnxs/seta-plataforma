import { BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { Button, cn } from './ui';

export function Brand({ className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white dark:bg-brand-400 dark:text-stone-950">
        <BookOpen className="h-4 w-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-50">SETA</span>
        <span className="block text-[11px] text-stone-500 dark:text-stone-400">Seminário Teológico Aliança</span>
      </span>
    </div>
  );
}

export function ThemeToggle({ full = false, className }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  const Icon = dark ? Sun : Moon;
  return (
    <Button
      variant="ghost"
      size={full ? 'sm' : 'icon'}
      onClick={toggle}
      className={className}
      title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <Icon className="h-4 w-4" />
      {full && <span>{dark ? 'Modo claro' : 'Modo escuro'}</span>}
    </Button>
  );
}
