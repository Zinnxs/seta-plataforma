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
        <div className="p-4 md:p-5 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-500/30 shadow-2xl shadow-stone-950/20 text-stone-800 dark:text-stone-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Privacidade & Cookies Estritamente Essenciais
                  </h4>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> LGPD 13.709/18
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                  O Portal SETA utiliza apenas cookies e dados estritamente necessários para manter você conectado com segurança e salvar seu tema visual. <strong>Não utilizamos rastreadores de terceiros</strong> nem vendemos informações pessoais.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setLegalModalOpen(true)}
                className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 rounded transition-colors"
              >
                Ler Políticas
              </button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAccept}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <span>Aceitar & Prosseguir</span>
                <ChevronRight className="h-4 w-4" />
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
