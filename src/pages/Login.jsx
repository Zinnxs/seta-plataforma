import { useState } from 'react';
import { ArrowRight, Building2, Eye, EyeOff, GraduationCap, UserRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { DEMO_LOGINS } from '../data/seed';
import { Brand, ThemeToggle } from '../components/Brand';
import { Button, Field, Input } from '../components/ui';

const ICONS = { aluno: GraduationCap, professor: UserRound, admin: Building2 };
const DESCRIPTIONS = {
  aluno: 'Boletim, trabalhos e aulas',
  professor: 'Notas, avaliações e correções',
  admin: 'Gestão acadêmica e relatórios',
};

export function Login() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!login(email, password)) setError('E-mail ou senha incorretos.');
  };

  const quickLogin = (l) => {
    setEmail(l.email);
    setPassword(l.password);
    setError('');
    login(l.email, l.password);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Painel institucional */}
      <aside className="hidden flex-col justify-between border-r border-stone-200/70 bg-brand-50/70 p-12 lg:flex dark:border-stone-800 dark:bg-stone-900/40">
        <Brand />
        <blockquote className="max-w-md">
          <p className="text-2xl font-light leading-relaxed text-stone-700 dark:text-stone-200">
            “Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a
            palavra da verdade.”
          </p>
          <footer className="mt-4 text-sm text-stone-500 dark:text-stone-400">2 Timóteo 2:15</footer>
        </blockquote>
        <p className="text-xs text-stone-400 dark:text-stone-500">Ambiente acadêmico · Período letivo 2026.2</p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Entrar</h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Acesse com seu e-mail institucional.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="E-mail">
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="nome@seta.edu.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Senha">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
              <Button type="submit" className="w-full">
                Entrar
              </Button>
              <p className="text-center text-xs text-stone-400 dark:text-stone-500">
                Esqueceu a senha? Fale com a secretaria acadêmica.
              </p>
            </form>

            <div className="mt-12">
              <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
                <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                Acessos Rápidos de Demonstração
                <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-1.5">
                (Ou digite o e-mail e senha de qualquer aluno ou professor real criado pela Direção)
              </p>
              <div className="mt-4 space-y-2">
                {DEMO_LOGINS.map((l) => {
                  const Icon = ICONS[l.role];
                  return (
                    <button
                      key={l.role}
                      type="button"
                      onClick={() => quickLogin(l)}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-brand-700 dark:hover:bg-stone-900"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{l.label}</span>
                          <span className="truncate text-xs text-stone-400 dark:text-stone-500">{DESCRIPTIONS[l.role]}</span>
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-stone-500 dark:text-stone-400">
                          {l.email} · {l.password}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-stone-600 dark:group-hover:text-brand-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
