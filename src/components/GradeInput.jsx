import { useEffect, useState } from 'react';
import { cn } from './ui';

/**
 * Campo de nota editável direto na tabela.
 * Aceita vírgula ou ponto, salva ao sair do campo (ou Enter) e limita entre 0 e o máximo.
 */
export function GradeInput({ value, onCommit, disabled, max = 10, integer = false, highlight = false, label }) {
  const toText = (v) => (v === null || v === undefined ? '' : integer ? String(v) : v.toFixed(1).replace('.', ','));
  const [text, setText] = useState(toText(value));

  useEffect(() => {
    setText(toText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = () => {
    const t = text.trim().replace(',', '.');
    if (t === '') {
      if (value !== null && value !== undefined) onCommit(null);
      return;
    }
    let n = Number(t);
    if (Number.isNaN(n)) {
      setText(toText(value));
      return;
    }
    n = Math.min(max, Math.max(0, n));
    n = integer ? Math.round(n) : Math.round(n * 10) / 10;
    setText(toText(n));
    if (n !== value) onCommit(n);
  };

  return (
    <input
      inputMode="decimal"
      aria-label={label}
      value={text}
      disabled={disabled}
      placeholder="—"
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setText(toText(value));
          e.currentTarget.blur();
        }
      }}
      className={cn(
        'h-9 w-16 rounded-lg border border-transparent text-center text-sm tabular-nums text-stone-800 outline-none transition placeholder:text-stone-300',
        'hover:border-stone-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100',
        'dark:text-stone-100 dark:placeholder:text-stone-600 dark:hover:border-stone-700 dark:focus:border-brand-500 dark:focus:bg-stone-900 dark:focus:ring-brand-900/40',
        'disabled:cursor-not-allowed disabled:hover:border-transparent',
        highlight ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-stone-50 dark:bg-stone-800/50'
      )}
    />
  );
}
