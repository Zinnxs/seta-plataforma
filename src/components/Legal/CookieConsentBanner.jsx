import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui';
import { LegalModal } from './LegalModal';

const STORAGE_KEY = 'seta_cookie_consent_v1';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Exibe após 800ms para uma entrada suave
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Caso localStorage esteja indisponível (modo anônimo restritivo)
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        acceptedAt: new Date().toISOString(),
        version: '1.0',
        essentialCookies: true,
        analyticsCookies: false, // Zero trackers invasivos
      }));
    } catch {
      // Ignora falha de gravação local
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <aside
        role="region"
        aria-label="Aviso de Cookies e Privacidade LGPD"
        className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:max-w-4xl lg:mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="p-4 md:p-5 rounded-xl bg-[#FFFFFF]/95 dark:bg-[#1B1C22]/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-xl text-[#1D1B18] dark:text-[#EDEDE8]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-white/[0.05] text-[#B48636] dark:text-[#E0A94E] shrink-0 mt-0.5">
                <Cookie className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-semibold text-[#1D1B18] dark:text-[#EDEDE8] text-sm">
                    Privacidade & Cookies Estritamente Essenciais
                  </h4>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" strokeWidth={1.5} /> LGPD 13.709/18
                  </span>
                </div>
                <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96] leading-relaxed max-w-2xl">
                  O Portal SETA utiliza apenas dados estritamente necessários para manter sua sessão conectada com segurança e salvar seu tema visual. <strong>Não utilizamos rastreadores de anúncios</strong> nem comercializamos dados acadêmicos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setLegalModalOpen(true)}
                className="text-xs text-[#6E6A63] dark:text-[#9E9C96] hover:text-[#B48636] dark:hover:text-[#E0A94E] underline underline-offset-2 px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-[#B48636] rounded transition-colors"
              >
                Ler Políticas
              </button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAccept}
                className="flex items-center gap-1.5"
              >
                <span>Aceitar & Prosseguir</span>
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <LegalModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab="privacidade"
      />
    </>
  );
}
