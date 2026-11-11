import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Scale, FileText } from 'lucide-react';
import { useStore } from '../lib/store';
import { Brand, ThemeToggle } from '../components/Brand';
import { Button, Field, Input } from '../components/ui';
import { SetaSymbol } from '../components/SetaLogo';
import { InstitutionalFooter } from '../components/Legal/InstitutionalFooter';
import { CookieConsentBanner } from '../components/Legal/CookieConsentBanner';
import { LegalModal } from '../components/Legal/LegalModal';

export function Login() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacidade');

  const openLegal = (tab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* Painel Institucional Acadêmico Oficial (Desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-[#16171C] p-12 lg:flex text-[#EDEDE8]">
        <div className="relative z-10 flex items-center justify-between">
          <Brand />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#E0A94E]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Portal Acadêmico Oficial
          </span>
        </div>

        {/* Brasão Oficial do SETA em Destaque Sereno */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center">
          <div className="relative mb-6 h-36 w-36 flex items-center justify-center rounded-full border border-white/[0.12] bg-[#1B1C22] text-[#E0A94E] shadow-2xl p-6">
            <SetaSymbol className="w-full h-full" strokeWidth={1.4} />
          </div>

          <h2 className="font-serif text-3xl font-semibold tracking-wider text-[#EDEDE8]">
            PORTAL <span className="text-[#E0A94E]">SETA</span>
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-widest text-[#9E9C96] uppercase">
            Seminário Teológico Aliança
          </p>
          <p className="mt-2 text-[11px] font-mono tracking-[0.25em] text-[#E0A94E]/80">
            CONHECER · SERVIR · GLORIFICAR
          </p>

          <blockquote className="mt-8 max-w-md rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-left">
            <p className="font-serif text-sm font-normal italic leading-relaxed text-[#EDEDE8]/90">
              “Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a
              palavra da verdade.”
            </p>
            <footer className="mt-3 text-xs font-medium text-[#E0A94E] tracking-wider">
              2 Timóteo 2:15
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#9E9C96] font-mono">
          <span>Bacharel em Teologia</span>
          <span>Período Letivo 2026.2</span>
        </div>
      </aside>

      {/* Formulário de Acesso */}
      <main className="flex flex-col bg-[#FAF9F5] dark:bg-[#131417] transition-colors">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="text-center lg:text-left mb-8">
              <div className="mx-auto lg:mx-0 mb-4 h-12 w-12 flex items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1B1C22] text-[#B48636] dark:text-[#E0A94E] p-2.5 lg:hidden">
                <SetaSymbol className="w-full h-full" strokeWidth={1.6} />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1B18] dark:text-[#EDEDE8]">
                Acesso ao <span className="text-[#B48636] dark:text-[#E0A94E]">Portal SETA</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6E6A63] dark:text-[#9E9C96]">
                Entre com seu e-mail e senha institucional para acessar o ambiente acadêmico.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Field label="E-mail Institucional">
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="ex: admin@seta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field label="Senha de Acesso">
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-[#98948C] hover:text-[#1D1B18] dark:hover:text-[#EDEDE8]"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-10 bg-[#B48636] hover:bg-[#9B7028] dark:bg-[#E0A94E] dark:hover:bg-[#D59837] text-white dark:text-[#131417] font-medium shadow-sm border-none"
              >
                <span>Acessar o Sistema</span>
                <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
              </Button>

              {/* Aviso Legal de Consentimento e LGPD */}
              <p className="text-[11px] text-center text-[#6E6A63] dark:text-[#9E9C96] leading-relaxed pt-2">
                Ao entrar, você concorda com os nossos{' '}
                <button
                  type="button"
                  onClick={() => openLegal('termos')}
                  className="font-medium text-[#B48636] dark:text-[#E0A94E] hover:underline underline-offset-2"
                >
                  Termos de Uso
                </button>{' '}
                e a nossa{' '}
                <button
                  type="button"
                  onClick={() => openLegal('privacidade')}
                  className="font-medium text-[#B48636] dark:text-[#E0A94E] hover:underline underline-offset-2"
                >
                  Política de Privacidade (LGPD)
                </button>.
              </p>

              <div className="pt-3 text-center border-t border-black/[0.04] dark:border-white/[0.06] mt-4">
                <p className="text-xs text-[#98948C] dark:text-[#686762]">
                  Dúvidas ou suporte de acesso? Procure a secretaria acadêmica do SETA.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Rodapé Institucional Legal Compacto na Tela de Login */}
        <div className="px-6 pb-6">
          <InstitutionalFooter compact />
        </div>
      </main>

      <CookieConsentBanner />

      <LegalModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
