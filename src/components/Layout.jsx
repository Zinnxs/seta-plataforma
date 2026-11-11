import { useState, useEffect } from 'react';
import { LogOut, ShieldCheck, Menu, X, ChevronRight } from 'lucide-react';
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
        'group flex cursor-pointer items-center gap-3 rounded-lg text-[13px] transition-colors text-left font-medium',
        compact ? 'h-10 w-full px-3.5' : 'h-9.5 w-full px-3',
        active
          ? 'bg-stone-200/60 text-[#1D1B18] border-l-2 border-[#B48636] font-semibold dark:bg-white/[0.08] dark:text-[#EDEDE8] dark:border-[#E0A94E]'
          : 'text-[#6E6A63] hover:bg-black/[0.03] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:bg-white/[0.04] dark:hover:text-[#EDEDE8]'
      )}
    >
      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" strokeWidth={1.5} />
      <span className="truncate flex-1">{item.label}</span>
      {item.count > 0 && (
        <span className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums bg-stone-200/80 text-[#1D1B18] dark:bg-white/[0.1] dark:text-[#EDEDE8]">
          {item.count}
        </span>
      )}
      {compact && (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-30 group-hover:opacity-70 dark:opacity-40" strokeWidth={1.5} />
      )}
    </button>
  );
}

export function Layout({ nav = [], page, onNavigate, roleLabel, children }) {
  const { currentUser, logout } = useStore();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const name = personName(currentUser);

  // Contagem total de pendências/notificações para o ícone do menu
  const totalBadges = nav.reduce((sum, item) => sum + (item.count || 0), 0);

  // Bloqueia rolagem do fundo enquanto o menu hamburguer estiver aberto no celular
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1D1B18] dark:bg-[#131417] dark:text-[#EDEDE8] transition-colors overflow-x-hidden">
      {/* Barra lateral fixa (Desktop: md em diante) */}
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
              <p className="truncate text-xs font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{name || 'Usuário SETA'}</p>
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

      {/* Cabeçalho Superior Mobile com Botão Hamburguer */}
      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-[#FAF9F5]/90 px-4 backdrop-blur-md md:hidden dark:border-white/[0.08] dark:bg-[#16171C]/90">
        <Brand showSubtitle={false} size="sm" />
        
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu de navegação e opções"
          className="relative flex h-9.5 items-center gap-2 rounded-lg border border-black/[0.08] bg-black/[0.02] px-3 text-[#1D1B18] transition-all hover:bg-black/[0.05] active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#EDEDE8] dark:hover:bg-white/[0.08]"
        >
          <Menu className="h-4.5 w-4.5" strokeWidth={1.6} />
          <span className="text-xs font-medium tracking-wide">Menu</span>
          {totalBadges > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B48636] px-1 text-[9px] font-bold text-white dark:bg-[#E0A94E] dark:text-[#131417]">
              {totalBadges}
            </span>
          )}
        </button>
      </header>

      {/* Backdrop do Menu Mobile */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Gaveta / Drawer Lateral Mobile (Hamburguer Menu) */}
      <aside
        className={cn(
          'no-print fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-[320px] flex-col bg-[#FAF9F5] shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-[#16171C] border-l border-black/[0.08] dark:border-white/[0.08]',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-modal="true"
        aria-label="Menu acadêmico do usuário"
      >
        {/* Topo do Drawer: Título e Botão Fechar */}
        <div className="flex h-14 items-center justify-between border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
          <span className="font-serif text-[15px] font-semibold tracking-wider text-[#1D1B18] dark:text-[#EDEDE8]">
            PORTAL <span className="text-[#9E6C1B] dark:text-[#E0A94E] font-medium">SETA</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6E6A63] hover:bg-black/[0.05] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:bg-white/[0.08] dark:hover:text-[#EDEDE8] transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Perfil do Usuário no Celular */}
        <div className="border-b border-black/[0.06] bg-black/[0.02] p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">
                {name || 'Usuário SETA'}
              </p>
              <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Lista de Opções de Ensino (Navegação Acadêmica Completa) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#98948C] dark:text-[#686762]">
            Opções de Ensino & Gestão
          </p>
          {nav.map((item) => (
            <NavItem
              key={item.id}
              compact
              item={item}
              active={page === item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
            />
          ))}
        </div>

        {/* Rodapé do Menu Hamburguer: Modo de Cor + LGPD + Logout */}
        <div className="border-t border-black/[0.06] p-4 space-y-2.5 bg-[#FAF9F5] dark:border-white/[0.08] dark:bg-[#16171C]">
          {/* Alternador de Modo de Cor (Claro / Escuro) */}
          <div className="rounded-lg border border-black/[0.06] bg-black/[0.02] p-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
            <p className="px-1 pb-1.5 text-[11px] font-medium text-[#6E6A63] dark:text-[#9E9C96]">
              Aparência do Ambiente
            </p>
            <ThemeToggle full className="w-full justify-start h-9 px-2 text-xs" />
          </div>

          {/* Link para Privacidade & LGPD */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setLegalModalOpen(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#6E6A63] hover:bg-black/[0.04] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:bg-white/[0.04] dark:hover:text-[#EDEDE8] transition-colors"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#B48636] dark:text-[#E0A94E]" strokeWidth={1.5} />
            <span>Privacidade & LGPD</span>
          </button>

          {/* Botão de Logout */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#A04E36] hover:bg-[#A04E36]/10 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span>Sair do Portal</span>
          </button>

          <div className="pt-1 text-center text-[10px] text-[#98948C] dark:text-[#686762]">
            Seminário Teológico Aliança · v1.5
          </div>
        </div>
      </aside>

      {/* Área Central de Trabalho */}
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
