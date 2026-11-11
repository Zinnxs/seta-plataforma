import { useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { personName } from '../lib/format';
import { Avatar, Button, cn } from './ui';
import { Brand, ThemeToggle } from './Brand';
import { LegalModal } from './Legal/LegalModal';
import { CookieConsentBanner } from './Legal/CookieConsentBanner';

function NavItem({ item, active, onClick, compact }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-lg text-[13px] transition-colors text-left font-medium',
        compact ? 'h-9 shrink-0 px-3' : 'h-9.5 w-full px-3',
        active
          ? 'bg-stone-200/50 text-[#1D1B18] border-l-2 border-[#B48636] dark:bg-white/[0.08] dark:text-[#EDEDE8] dark:border-[#E0A94E]'
          : 'text-[#6E6A63] hover:bg-black/[0.03] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:bg-white/[0.04] dark:hover:text-[#EDEDE8]'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span className={compact ? "truncate" : "whitespace-nowrap"}>{item.label}</span>
      {item.count > 0 && (
        <span className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums bg-stone-200/70 text-[#1D1B18] dark:bg-white/[0.1] dark:text-[#EDEDE8]">
          {item.count}
        </span>
      )}
    </button>
  );
}

export function Layout({ nav, page, onNavigate, roleLabel, children }) {
  const { currentUser, logout } = useStore();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const name = personName(currentUser);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1D1B18] dark:bg-[#131417] dark:text-[#EDEDE8] transition-colors overflow-x-hidden">
      {/* Barra lateral (desktop com largura otimizada para micro-tipografia) */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-[272px] flex-col border-r border-black/[0.06] bg-[#FAF9F5] px-4 py-6 md:flex dark:border-white/[0.08] dark:bg-[#16171C]">
        <Brand className="px-2" />

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
          {nav.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </nav>

        {/* Rodapé da Sidebar: Usuário + Ajustes + Links Jurídicos Discretos */}
        <div className="space-y-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={currentUser?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{name}</p>
              <p className="text-[11px] text-[#6E6A63] dark:text-[#9E9C96]">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle full className="flex-1 justify-start h-8 px-2" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              className="h-8 w-8 text-[#6E6A63] hover:text-[#A04E36] dark:text-[#9E9C96]"
              title="Sair do Portal SETA" 
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Gatilho compacto para Documentos Legais e LGPD */}
          <div className="px-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[11px] text-[#98948C] dark:text-[#686762]">
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              className="hover:text-[#B48636] dark:hover:text-[#E0A94E] flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
              <span>Privacidade & LGPD</span>
            </button>
            <span>v1.5</span>
          </div>
        </div>
      </aside>

      {/* Cabeçalho (mobile) */}
      <header className="no-print sticky top-0 z-30 border-b border-black/[0.06] bg-[#FAF9F5]/90 backdrop-blur-md md:hidden dark:border-white/[0.08] dark:bg-[#16171C]/90">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map((item) => (
            <NavItem key={item.id} compact item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </nav>
      </header>

      {/* Área Central de Trabalho (Sem rodapé poluído) */}
      <main className="md:pl-[272px] min-h-screen">
        <div className="mx-auto max-w-6xl w-full px-4 py-6 sm:px-8 lg:py-8">
          {children}
        </div>
      </main>

      <CookieConsentBanner />

      <LegalModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab="privacidade"
      />
    </div>
  );
}
