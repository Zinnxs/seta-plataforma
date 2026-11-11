import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { Button, cn } from './ui';
import { SetaSymbol } from './SetaLogo';

export function Brand({ className, showSubtitle = true, size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div 
        className={cn(
          'relative shrink-0 flex items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#FAF9F5] dark:bg-[#1B1C22] text-[#B48636] dark:text-[#E0A94E]',
          isLarge ? 'h-11 w-11 p-2' : 'h-8.5 w-8.5 p-1.5'
        )}
      >
        <SetaSymbol className="w-full h-full" strokeWidth={1.6} />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[15px] font-semibold tracking-wider text-[#1D1B18] dark:text-[#EDEDE8]">
            PORTAL <span className="text-[#B48636] dark:text-[#E0A94E] font-medium">SETA</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="block text-[10px] font-medium tracking-wide text-[#6E6A63] dark:text-[#9E9C96] uppercase">
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
      className={cn('text-[#6E6A63] dark:text-[#9E9C96] hover:text-[#1D1B18] dark:hover:text-[#EDEDE8]', className)}
      title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {full && <span className="text-xs font-normal">{dark ? 'Modo claro' : 'Modo escuro'}</span>}
    </Button>
  );
}
