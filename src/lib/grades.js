/**
 * Regras de cálculo de notas do SETA.
 * Cada disciplina define suas próprias avaliações (provas, trabalhos, seminários...)
 * com pesos em %, a média mínima, o limite de faltas e a regra de recuperação.
 */
import { typeLabel } from '../data/seed';

export const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const r1 = (v) => Math.round(v * 10) / 10;

export const STATUS = {
  sem_notas: { label: 'Sem notas', tone: 'neutral' },
  em_andamento: { label: 'Em andamento', tone: 'neutral' },
  aprovado: { label: 'Aprovado', tone: 'green' },
  distincao: { label: 'Aprovado com distinção', tone: 'green' },
  recuperacao: { label: 'Em recuperação', tone: 'amber' },
  aprovado_rec: { label: 'Aprovado na recuperação', tone: 'green' },
  reprovado: { label: 'Reprovado', tone: 'red' },
  reprovado_falta: { label: 'Reprovado por falta', tone: 'red' },
};

export const APPROVED = ['aprovado', 'distincao', 'aprovado_rec'];

export const weightTotal = (evals) => evals.reduce((s, e) => s + (Number(e.weight) || 0), 0);

export function computeResult(disc, record) {
  const evals = disc.evaluations || [];
  const rec = record || { scores: {}, recovery: null, absences: 0 };
  const scores = rec.scores || {};
  const total = weightTotal(evals) || 1;
  const pass = Number(disc.passingGrade);
  const base = { average: null, final: null, status: 'sem_notas', needsRecovery: false, recoveryApplied: false };

  const withAbsences = (res) =>
    Number(rec.absences) > Number(disc.maxAbsences) ? { ...res, status: 'reprovado_falta', needsRecovery: false } : res;

  const filled = evals.filter((e) => isNum(scores[e.id]));
  if (!evals.length || !filled.length) return withAbsences(base);

  const filledWeight = filled.reduce((s, e) => s + Number(e.weight), 0) || 1;
  const sum = filled.reduce((s, e) => s + scores[e.id] * Number(e.weight), 0);

  // Ainda faltam notas: mostra média parcial
  if (filled.length < evals.length) {
    const partial = r1(sum / filledWeight);
    return withAbsences({ ...base, average: partial, final: partial, status: 'em_andamento' });
  }

  const average = r1(sum / total);
  if (average >= pass) {
    return withAbsences({ ...base, average, final: average, status: average >= 9 ? 'distincao' : 'aprovado' });
  }

  if (!isNum(rec.recovery)) {
    return withAbsences({ ...base, average, final: average, status: 'recuperacao', needsRecovery: true });
  }

  let final = average;
  if (disc.recoveryRule === 'substitui_menor') {
    // menor nota; em caso de empate, a de maior peso (mais favorável ao aluno)
    const target = [...evals].sort((a, b) => scores[a.id] - scores[b.id] || b.weight - a.weight)[0];
    if (rec.recovery > scores[target.id]) {
      final = r1(evals.reduce((s, e) => s + (e.id === target.id ? rec.recovery : scores[e.id]) * e.weight, 0) / total);
    }
  } else if (disc.recoveryRule === 'media_simples') {
    final = r1((average + rec.recovery) / 2);
  } else if (disc.recoveryRule === 'nota_minima') {
    final = rec.recovery >= pass ? pass : r1(Math.max(average, rec.recovery));
  }

  return withAbsences({
    ...base,
    average,
    final,
    status: final >= pass ? 'aprovado_rec' : 'reprovado',
    recoveryApplied: true,
  });
}

export function disciplineStats(disc, gradesByStudent = {}) {
  const results = Object.values(gradesByStudent).map((r) => computeResult(disc, r));
  const finals = results.map((r) => r.final).filter(isNum);
  return {
    count: results.length,
    average: finals.length ? r1(finals.reduce((a, b) => a + b, 0) / finals.length) : null,
    recovery: results.filter((r) => r.needsRecovery).length,
    approved: results.filter((r) => APPROVED.includes(r.status)).length,
  };
}

export const describeFormula = (evals) =>
  evals.map((e) => `${e.name || typeLabel(e.type)} × ${Number(e.weight) || 0}%`).join(' + ');
