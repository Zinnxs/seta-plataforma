export const fmtGrade = (v) =>
  typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(1).replace('.', ',') : '—';

const toDate = (iso) => new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);

export const fmtDate = (iso, opts = { day: '2-digit', month: 'short' }) =>
  iso ? toDate(iso).toLocaleDateString('pt-BR', opts).replace('.', '') : '—';

export const fmtDateLong = (iso) => fmtDate(iso, { day: '2-digit', month: 'long', year: 'numeric' });

export const fmtDateTime = (iso) =>
  iso ? toDate(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '') : '—';

export const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

export const isPast = (iso) => toDate(`${iso.slice(0, 10)}T23:59:59`) < new Date();

export const initials = (name = '') => {
  const words = name.split(/\s+/).filter((w) => w && !/^(da|de|do|dos|das|e)$/i.test(w) && !w.endsWith('.'));
  if (!words.length) return '?';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};

export const personName = (p) => (p ? `${p.title ? `${p.title} ` : ''}${p.name}` : '—');

export const firstName = (name = '') => name.split(' ')[0];
