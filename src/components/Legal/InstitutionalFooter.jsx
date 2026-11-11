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
        <footer className="mt-8 pt-4 pb-6 border-t border-black/[0.04] dark:border-white/[0.06] text-center text-xs text-[#6E6A63] dark:text-[#9E9C96] space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button
              onClick={() => openLegal('privacidade')}
              className="hover:text-[#B48636] dark:hover:text-[#E0A94E] underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
            >
              Privacidade & LGPD
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('termos')}
              className="hover:text-[#B48636] dark:hover:text-[#E0A94E] underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('reembolso')}
              className="hover:text-[#B48636] dark:hover:text-[#E0A94E] underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
            >
              Cancelamento & Reembolso
            </button>
            <span>•</span>
            <button
              onClick={() => openLegal('dpo')}
              className="hover:text-[#B48636] dark:hover:text-[#E0A94E] underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
            >
              Canal do Titular LGPD
            </button>
          </div>
          <p className="text-[11px] text-[#98948C] dark:text-[#686762]">
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
      <footer className="mt-12 pt-8 pb-8 border-t border-black/[0.06] dark:border-white/[0.08] text-[#6E6A63] dark:text-[#9E9C96] text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Coluna 1: Dados Institucionais & CNPJ */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#B48636] dark:text-[#E0A94E]">
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-sm text-[#1D1B18] dark:text-[#EDEDE8]">
                  {inst.name}
                </h4>
                <p className="text-[11px] text-[#6E6A63] dark:text-[#9E9C96]">
                  {inst.course} • Formação Ministerial & Teológica
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-[#6E6A63] dark:text-[#9E9C96] leading-normal font-mono">
              <p className="flex items-start gap-1.5">
                <span className="font-semibold text-[#1D1B18] dark:text-[#EDEDE8] shrink-0">CNPJ:</span>
                <span>{inst.cnpj}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" strokeWidth={1.5} />
                <span>{inst.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
                <span>Secretaria: {inst.phone} | {inst.phoneSecondary}</span>
              </p>
            </div>
          </div>

          {/* Coluna 2: Documentos e Termos Legais */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-semibold text-[#1D1B18] dark:text-[#EDEDE8] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-[#B48636] dark:text-[#E0A94E]" strokeWidth={1.5} />
              Conformidade Jurídica & LGPD
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('privacidade')}
                  className="flex items-center gap-1.5 hover:text-[#B48636] dark:hover:text-[#E0A94E] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
                  <span>Política de Privacidade (Lei 13.709/18)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('termos')}
                  className="flex items-center gap-1.5 hover:text-[#B48636] dark:hover:text-[#E0A94E] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
                >
                  <FileText className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" strokeWidth={1.5} />
                  <span>Termos de Uso da Plataforma</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('reembolso')}
                  className="flex items-center gap-1.5 hover:text-[#B48636] dark:hover:text-[#E0A94E] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#B48636] dark:text-[#E0A94E] shrink-0" strokeWidth={1.5} />
                  <span>Cancelamento, Trancamento & Reembolso</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('dpo')}
                  className="flex items-center gap-1.5 hover:text-[#B48636] dark:hover:text-[#E0A94E] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#B48636] rounded px-1"
                >
                  <Mail className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" strokeWidth={1.5} />
                  <span>Canal do Titular de Dados (DPO/Encarregado)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Selo de Segurança e Proteção */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-semibold text-[#1D1B18] dark:text-[#EDEDE8] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              Segurança & Ética
            </h5>
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-stone-50/70 dark:bg-white/[0.02] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>Zero Trackers Invasivos</span>
              </div>
              <p className="text-[11px] text-[#6E6A63] dark:text-[#9E9C96] leading-snug">
                Não utilizamos cookies de publicidade. Seus dados acadêmicos são sigilosos e protegidos.
              </p>
              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[10px] text-[#98948C] dark:text-[#686762] flex items-center gap-1">
                <HeartHandshake className="h-3.5 w-3.5 text-[#B48636] dark:text-[#E0A94E]" strokeWidth={1.5} />
                <span>Integridade e Rigor Acadêmico</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior / Copyright */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#98948C] dark:text-[#686762]">
          <p>
            © {new Date().getFullYear()} {inst.name}. CNPJ: {inst.cnpj}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Ambiente Acadêmico Acessível e Conforme (WCAG AA)</span>
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
