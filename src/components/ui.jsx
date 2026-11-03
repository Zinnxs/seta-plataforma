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
        'rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900/50',
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
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div>
        <h2 className="text-sm font-medium text-stone-900 dark:text-stone-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Botões ---------- */
const BTN = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-400 dark:text-stone-950 dark:hover:bg-brand-300',
  secondary:
    'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
  danger: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40',
  dangerSolid: 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...p }) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-45',
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
  neutral: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.sem_notas;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ---------- Formulários ---------- */
const FIELD =
  'w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-brand-500 dark:focus:ring-brand-900/40';

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
      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-400 dark:text-stone-500">{hint}</span>}
    </label>
  );
}

/* ---------- Abas segmentadas ---------- */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('inline-flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800/60', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
            value === t.id
              ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-white'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Cabeçalho de página ---------- */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{hint}</p>}
    </Card>
  );
}

export function Avatar({ name, size = 'md' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-brand-100 font-medium text-brand-700 dark:bg-brand-900/60 dark:text-brand-200',
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
        <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{text}</p>}
    </div>
  );
}

export function Callout({ icon: Icon, tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-stone-50 text-stone-600 dark:bg-stone-900 dark:text-stone-300',
    amber: 'bg-amber-50/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    brand: 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-100',
    red: 'bg-rose-50/70 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200',
  };
  return (
    <div className={cn('flex gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed', tones[tone], className)}>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-stone-900/25 backdrop-blur-[2px] dark:bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900',
          size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-md' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
            {description && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-6">{footer}</div>}
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
      <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{text}</p>
    </Modal>
  );
}

/* ---------- Seletor de disciplina ---------- */
export function DisciplineSelect({ disciplines, value, onChange }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className="w-full sm:w-80">
      {disciplines.map((d) => (
        <option key={d.id} value={d.id}>
          {d.code} · {d.name}
        </option>
      ))}
    </Select>
  );
}
