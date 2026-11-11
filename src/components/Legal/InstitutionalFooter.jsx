import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  RotateCcw, 
  MapPin, 
  Phone, 
  Mail, 
  Building2,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { LegalModal } from './LegalModal';
import { useStore } from '../../lib/store';

export function InstitutionalFooter({ compact = false }) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacidade');
  const { data } = useStore();
  const inst = data?.institution || {
    name: 'Seminário Teológico Aliança',
    portalName: 'Portal SETA',
    acronym: 'SETA',
    course: 'Bacharel em Teologia',
    cnpj: '07.396.459/0001-03',
    address: 'Av. Antônio de Almeida, 2238 - Retiro, Volta Redonda - RJ, 27277-330',
    phone: '(24) 99906-5611',
    phoneSecondary: '(24) 99837-2729',
    dpoEmail: 'privacidade@seta.edu.br',
  };

  const openLegal = (tab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  if (compact) {
    return (
      <>
        <footer className="mt-8 pt-4 pb-6 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button
              onClick={() => openLegal('privacidade')}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
            >
              Privacidade & LGPD
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('termos')}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('reembolso')}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
            >
              Cancelamento & Reembolso
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('dpo')}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
            >
              Canal do Titular LGPD
            </button>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            © {new Date().getFullYear()} {inst.name} • CNPJ: {inst.cnpj} • Todos os direitos reservados.
          </p>
        </footer>

        <LegalModal
          open={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalTab}
        />
      </>
    );
  }

  return (
    <>
      <footer className="mt-12 pt-8 pb-8 border-t border-stone-200 dark:border-stone-800/80 text-stone-600 dark:text-stone-400 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Coluna 1: Dados Institucionais & CNPJ */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  {inst.name}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {inst.course} • Formação Ministerial & Teológica
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
              <p className="flex items-start gap-1.5">
                <span className="font-semibold text-stone-700 dark:text-stone-300 shrink-0">CNPJ:</span>
                <span>{inst.cnpj}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-stone-400 dark:text-stone-500" />
                <span>{inst.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                <span>Secretaria: {inst.phone} | {inst.phoneSecondary}</span>
              </p>
            </div>
          </div>

          {/* Coluna 2: Documentos e Termos Legais */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-semibold text-stone-900 dark:text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-amber-500" />
              Conformidade Jurídica & LGPD
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('privacidade')}
                  className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Política de Privacidade (Lei 13.709/18)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('termos')}
                  className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Termos de Uso da Plataforma</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('reembolso')}
                  className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Cancelamento, Trancamento & Reembolso</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('dpo')}
                  className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
                >
                  <Mail className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span>Canal do Titular de Dados (DPO/Encarregado)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Selo de Segurança e Proteção */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-semibold text-stone-900 dark:text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              Segurança & Ética
            </h5>
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Zero Trackers Invasivos</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                Não utilizamos cookies de publicidade de terceiros. Seus dados acadêmicos são sigilosos e protegidos por criptografia.
              </p>
              <div className="pt-1 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-400 flex items-center gap-1">
                <HeartHandshake className="h-3 w-3 text-amber-500" />
                <span>Compromisso e Integridade Cristã</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior / Copyright */}
        <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400 dark:text-stone-500">
          <p>
            © {new Date().getFullYear()} {inst.name}. CNPJ: {inst.cnpj}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ambiente Acadêmico Seguro e Acessível (WCAG AA)</span>
          </div>
        </div>
      </footer>

      <LegalModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </>
  );
}
