import { useEffect } from 'react';
import { X } from 'lucide-react';
import { STATUS } from '../lib/grades';
import { initials } from '../lib/format';

export const cn = (...c) => c.filter(Boolean).join(' ');

/* ---------- Superfícies ---------- */
export function Card({ className, children, ...p }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-black/[0.06] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors dark:border-white/[0.08] dark:bg-[#1B1C22] dark:shadow-none',
        className
      )}
      {...p}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 pb-1', className)}>
      <div>
        <h2 className="text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#6E6A63] dark:text-[#9E9C96]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Botões ---------- */
const BTN = {
  primary:
    'bg-[#B48636] text-white hover:bg-[#9B7028] active:bg-[#865E1E] shadow-sm dark:bg-[#E0A94E] dark:text-[#131417] dark:hover:bg-[#D59837] dark:active:bg-[#C28526]',
  secondary:
    'border border-black/[0.08] bg-[#FFFFFF] text-[#1D1B18] hover:bg-stone-50 active:bg-stone-100 dark:border-white/[0.08] dark:bg-[#1B1C22] dark:text-[#EDEDE8] dark:hover:bg-white/[0.04]',
  ghost:
    'text-[#6E6A63] hover:bg-black/[0.04] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:bg-white/[0.05] dark:hover:text-[#EDEDE8]',
  danger:
    'text-[#A04E36] hover:bg-[#A04E36]/10 dark:text-rose-400 dark:hover:bg-rose-950/40',
  dangerSolid:
    'bg-[#A04E36] text-white hover:bg-[#893E29] dark:bg-[#A04E36] dark:hover:bg-[#893E29]',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...p }) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48636] focus-visible:ring-offset-2 dark:focus-visible:ring-[#E0A94E] dark:focus-visible:ring-offset-[#131417]',
        size === 'sm' ? 'h-8 px-3 text-xs' : size === 'icon' ? 'h-9 w-9' : 'h-10 px-4 text-sm',
        BTN[variant],
        className
      )}
      {...p}
    >
      {children}
    </button>
  );
}

/* ---------- Badges ---------- */
const TONES = {
  neutral: 'bg-stone-100 text-[#1D1B18] border border-black/[0.05] dark:bg-white/[0.06] dark:text-[#EDEDE8] dark:border-white/[0.08]',
  green: 'bg-emerald-50 text-emerald-800 border border-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20',
  amber: 'bg-amber-50 text-amber-800 border border-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/20',
  red: 'bg-rose-50 text-rose-800 border border-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20',
  blue: 'bg-sky-50 text-sky-800 border border-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-500/20',
  brand: 'bg-[#FAF5EB] text-[#8C6422] border border-[#B48636]/20 dark:bg-[#1F1C18] dark:text-[#E0A94E] dark:border-[#E0A94E]/25',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, result, res }) {
  const resolvedStatus = status || result?.status || res?.status;
  const s = STATUS[resolvedStatus] || STATUS.sem_notas;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ---------- Formulários ---------- */
const FIELD =
  'w-full rounded-lg border border-black/[0.08] bg-white px-3 text-sm text-[#1D1B18] outline-none transition placeholder:text-[#98948C] focus:border-[#B48636] focus:ring-2 focus:ring-[#B48636]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.1] dark:bg-[#15161B] dark:text-[#EDEDE8] dark:placeholder:text-[#686762] dark:focus:border-[#E0A94E] dark:focus:ring-[#E0A94E]/20';

export function Input({ className, ...p }) {
  return <input className={cn(FIELD, 'h-10', className)} {...p} />;
}

export function Select({ className, children, ...p }) {
  return (
    <select className={cn(FIELD, 'h-10 pr-8', className)} {...p}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...p }) {
  return <textarea className={cn(FIELD, 'py-2.5 leading-relaxed', className)} {...p} />;
}

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-xs font-medium text-[#6E6A63] dark:text-[#9E9C96]">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#98948C] dark:text-[#686762]">{hint}</span>}
    </label>
  );
}

/* ---------- Abas segmentadas ---------- */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-lg bg-stone-100/90 dark:bg-[#16171C] p-1 border border-black/[0.04] dark:border-white/[0.06]', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48636] dark:focus-visible:ring-[#E0A94E]',
            value === t.id
              ? 'bg-white text-[#1D1B18] shadow-xs dark:bg-[#22242B] dark:text-[#EDEDE8] font-medium'
              : 'text-[#6E6A63] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:text-[#EDEDE8]'
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="text-xs tabular-nums text-[#98948C] dark:text-[#686762]">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Cabeçalho de página ---------- */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1D1B18] dark:text-[#EDEDE8]">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-[#6E6A63] dark:text-[#9E9C96]">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Indicadores Estatísticos Limpos ---------- */
export function Stat({ label, value, hint, className }) {
  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:border-black/[0.1] dark:hover:border-white/[0.15] transition-colors', className)}>
      <div>
        <p className="text-xs font-medium text-[#6E6A63] dark:text-[#9E9C96]">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[#1D1B18] dark:text-[#EDEDE8]">
          {value}
        </p>
      </div>
      {hint && <p className="mt-2 text-[11px] text-[#98948C] dark:text-[#686762] leading-snug">{hint}</p>}
    </Card>
  );
}

export function Avatar({ name, size = 'md' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-[#F4ECE1] font-semibold text-[#7A551E] dark:bg-[#28241D] dark:text-[#E0A94E]',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs'
      )}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-[#98948C] dark:bg-white/[0.05] dark:text-[#686762]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      )}
      <p className="text-sm font-medium text-[#1D1B18] dark:text-[#EDEDE8]">{title}</p>
      {text && <p className="mt-1 max-w-sm text-xs text-[#6E6A63] dark:text-[#9E9C96]">{text}</p>}
    </div>
  );
}

export function Callout({ icon: Icon, tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-stone-50 border border-black/[0.04] text-[#1D1B18] dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-[#EDEDE8]',
    amber: 'bg-[#FAF5EB] border border-[#B48636]/15 text-[#8C6422] dark:bg-[#1F1C18] dark:border-[#E0A94E]/20 dark:text-[#E0A94E]',
    brand: 'bg-[#FAF5EB] border border-[#B48636]/15 text-[#8C6422] dark:bg-[#1F1C18] dark:border-[#E0A94E]/20 dark:text-[#E0A94E]',
    red: 'bg-rose-50 border border-rose-600/10 text-rose-800 dark:bg-rose-950/30 dark:border-rose-500/20 dark:text-rose-200',
  };
  return (
    <div className={cn('flex gap-3 rounded-lg px-4 py-3 text-xs sm:text-sm leading-relaxed', tones[tone], className)}>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" strokeWidth={1.5} />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/70 transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-xl border border-black/[0.08] bg-[#FFFFFF] shadow-xl shadow-black/5 dark:border-white/[0.08] dark:bg-[#1B1C22] dark:shadow-none transition-all',
          size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-md' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 id="modal-title" className="font-serif text-lg font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{title}</h3>
            {description && <p className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E9C96]">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-1">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-6 border-t border-black/[0.04] dark:border-white/[0.06] pt-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, text, confirmLabel = 'Confirmar', danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={danger ? 'dangerSolid' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-xs sm:text-sm leading-relaxed text-[#6E6A63] dark:text-[#9E9C96]">{text}</p>
    </Modal>
  );
}

/* ---------- Seletor de disciplina ---------- */
export function DisciplineSelect({ disciplines, value, onChange }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className="w-full sm:w-80 font-mono text-xs">
      {disciplines.map((d) => {
        const st = d.status || (d.gradesClosed ? 'concluida' : 'em_andamento');
        const prefix = st === 'concluida' ? '✓' : st === 'futura' ? '○' : '•';
        return (
          <option key={d.id} value={d.id}>
            [{prefix}] {d.code} · {d.name}
          </option>
        );
      })}
    </Select>
  );
}
