import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { Button, cn } from './ui';

export function Brand({ className, showSubtitle = true, size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div 
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/50 shadow-md shadow-amber-950/20 bg-[#070d1e]',
          isLarge ? 'h-14 w-14' : 'h-10 w-10'
        )}
      >
        <img 
          src="/portal_seta_symbol.png" 
          alt="Selo Oficial SETA" 
          className="h-full w-full object-contain select-none" 
        />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[15px] font-bold tracking-wider text-slate-900 dark:text-slate-100">
            PORTAL <span className="text-gold-gradient font-black">SETA</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="block text-[11px] font-medium tracking-tight text-slate-500 dark:text-amber-200/70">
            Seminário Teológico Aliança
          </span>
        )}
      </div>
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
