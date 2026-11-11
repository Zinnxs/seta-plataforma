import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Scale, FileText } from 'lucide-react';
import { useStore } from '../lib/store';
import { Brand, ThemeToggle } from '../components/Brand';
import { Button, Field, Input } from '../components/ui';
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
      {/* Painel Institucional Oficial (Desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-amber-500/20 bg-gradient-to-b from-[#060a17] via-[#0b132b] to-[#070d1e] p-12 lg:flex text-slate-100">
        {/* Efeito de iluminação dourada ambiente */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Brand />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Portal Acadêmico Oficial
          </span>
        </div>

        {/* Brasão Oficial do SETA em Destaque */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center">
          <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-full p-1 ring-4 ring-amber-400/40 shadow-2xl shadow-amber-950/60 bg-[#070d1e]">
            <img
              src="/portal_seta_crest.jpg"
              alt="Brasão de Armas Oficial do Seminário Teológico Aliança - Conhecer, Servir, Glorificar"
              className="h-full w-full rounded-full object-contain"
            />
          </div>

          <h2 className="font-serif text-3xl font-extrabold tracking-wider text-slate-100">
            PORTAL <span className="text-gold-gradient font-black">SETA</span>
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-widest text-amber-200/80 uppercase">
            Seminário Teológico Aliança
          </p>
          <p className="mt-2 text-xs font-medium tracking-[0.3em] text-amber-400/90">
            CONHECER · SERVIR · GLORIFICAR
          </p>

          <blockquote className="mt-8 max-w-md rounded-2xl border border-amber-500/15 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm font-light italic leading-relaxed text-slate-300">
              “Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a
              palavra da verdade.”
            </p>
            <footer className="mt-3 text-xs font-semibold text-amber-300 tracking-wider">
              2 Timóteo 2:15
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>Bacharel em Teologia</span>
          <span>Período Letivo 2026.2</span>
        </div>
      </aside>

      {/* Formulário de Acesso */}
      <main className="flex flex-col bg-[#faf9f6] dark:bg-[#070d1e] transition-colors">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="text-center lg:text-left mb-8">
              <div className="mx-auto lg:mx-0 mb-4 h-14 w-14 overflow-hidden rounded-full ring-2 ring-amber-400/50 shadow-md lg:hidden">
                <img 
                  src="/portal_seta_symbol.png" 
                  alt="Emblema Oficial do Seminário Teológico Aliança (SETA)" 
                  className="h-full w-full object-contain" 
                />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Acesso ao <span className="text-gold-gradient">Portal SETA</span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold shadow-md shadow-amber-950/20 active:scale-[0.99] border-none"
              >
                Acessar o Sistema
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              {/* Aviso Legal de Consentimento e LGPD */}
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                Ao entrar, você concorda com os nossos{' '}
                <button
                  type="button"
                  onClick={() => openLegal('termos')}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
                >
                  Termos de Uso
                </button>{' '}
                e a nossa{' '}
                <button
                  type="button"
                  onClick={() => openLegal('privacidade')}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
                >
                  Política de Privacidade (LGPD)
                </button>.
              </p>

              <div className="pt-3 text-center border-t border-slate-200/80 dark:border-slate-800/80 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dúvidas ou suporte de acesso? Procure a secretaria acadêmica do SETA.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Rodapé Institucional Legal */}
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
