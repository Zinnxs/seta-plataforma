/**
 * Regras de cálculo de notas do SETA.
 * SISTEMA POR PONTUAÇÃO ACUMULADA (SOMA DIRETA DE PONTOS):
 * Cada disciplina distribui seus pontos (ex.: 10,0 pontos no total)
 * entre provas, trabalhos, seminários, participação, presença, etc.
 * O aluno é aprovado se a SOMA das notas atingir pelo menos a nota de corte (ex.: 7,0 pontos).
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

/** Soma dos pontos máximos distribuídos na disciplina (ex: 3.0 + 3.0 + 4.0 = 10.0 pts) */
export const pointsTotal = (evals = []) =>
  r1(evals.reduce((s, e) => s + (Number(e.maxPoints) || 0), 0));

export function computeResult(disc, record) {
  const evals = disc.evaluations || [];
  const rec = record || { scores: {}, recovery: null, absences: 0 };
  const scores = rec.scores || {};
  const pass = Number(disc.passingGrade) || 7.0;
  const maxPossible = pointsTotal(evals) || 10.0;

  const base = {
    sum: null,
    final: null,
    maxPossible,
    status: 'sem_notas',
    needsRecovery: false,
    recoveryApplied: false,
  };

  const withAbsences = (res) =>
    Number(rec.absences) > Number(disc.maxAbsences)
      ? { ...res, status: 'reprovado_falta', needsRecovery: false }
      : res;

  const filled = evals.filter((e) => isNum(scores[e.id]));
  if (!evals.length || !filled.length) return withAbsences(base);

  // Soma direta dos pontos conquistados
  const currentSum = r1(filled.reduce((s, e) => s + scores[e.id], 0));

  // Se ainda faltam avaliações a serem lançadas
  if (filled.length < evals.length) {
    return withAbsences({
      ...base,
      sum: currentSum,
      final: currentSum,
      status: 'em_andamento',
    });
  }

  // Todas as avaliações foram lançadas: verifica se atingiu os 7,0 pontos somados
  if (currentSum >= pass) {
    return withAbsences({
      ...base,
      sum: currentSum,
      final: currentSum,
      status: currentSum >= 9.0 ? 'distincao' : 'aprovado',
    });
  }

  // Soma < 7,0: aluno precisa de recuperação
  if (!isNum(rec.recovery)) {
    return withAbsences({
      ...base,
      sum: currentSum,
      final: currentSum,
      status: 'recuperacao',
      needsRecovery: true,
    });
  }

  // Lógica de recuperação em sistema de soma de pontos
  let finalScore = currentSum;

  if (disc.recoveryRule === 'substitui_menor') {
    // A nota da recuperação entra no lugar da menor pontuação obtida
    // Encontra a avaliação com pior pontuação (em pontos ou proporcionalmente)
    const worst = [...evals].sort((a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0))[0];
    const oldScore = scores[worst.id] ?? 0;
    if (rec.recovery > oldScore) {
      finalScore = r1(currentSum - oldScore + rec.recovery);
    }
  } else if (disc.recoveryRule === 'prova_substitutiva') {
    // Prova geral de recuperação (vale até 10,0 pontos): se tirar >= pass (7,0), é aprovado na recuperação
    if (rec.recovery >= pass) {
      finalScore = r1(rec.recovery);
    } else {
      finalScore = r1(Math.max(currentSum, rec.recovery));
    }
  } else if (disc.recoveryRule === 'soma_complementar') {
    // Pontos somados complementarmente com teto na nota de corte (7,0)
    finalScore = r1(Math.min(pass, currentSum + rec.recovery));
  }

  return withAbsences({
    ...base,
    sum: currentSum,
    final: finalScore,
    status: finalScore >= pass ? 'aprovado_rec' : 'reprovado',
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

export const describeFormula = (evals = []) => {
  if (!evals.length) return 'Nenhuma avaliação definida';
  const parts = evals.map((e) => `${e.name || typeLabel(e.type)} (${(Number(e.maxPoints) || 0).toFixed(1).replace('.', ',')} pts)`);
  const total = pointsTotal(evals).toFixed(1).replace('.', ',');
  return `${parts.join(' + ')} = ${total} pts totais`;
};
