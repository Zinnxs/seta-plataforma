import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { Brand, ThemeToggle } from '../components/Brand';
import { Button, Field, Input } from '../components/ui';

export function Login() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
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
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Seminário Teológico Aliança
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Ambiente Acadêmico Oficial · Bacharel em Teologia
          </p>
        </div>
      </aside>

      {/* Formulário de Acesso */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Portal Acadêmico</h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Digite seu e-mail e senha para acessar sua conta.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="E-mail">
                <div className="relative">
                  <Input
                    type="email"
                    autoComplete="username"
                    placeholder="ex: admin@seta.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Entrar no Sistema
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="pt-4 text-center">
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Dúvidas ou perda de acesso? Entre em contato com a secretaria do SETA.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
