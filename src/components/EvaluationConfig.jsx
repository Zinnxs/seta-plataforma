import { useState } from 'react';
import { Check, Info, Lock, Plus, Trash2, HelpCircle } from 'lucide-react';
import { EVALUATION_TYPES, RECOVERY_RULES } from '../data/seed';
import { describeFormula, pointsTotal } from '../lib/grades';
import { Button, Callout, Card, CardHeader, Field, Input, Select, cn } from './ui';

const PRESETS = [
  { label: 'Provas + Trabalho (3 + 3 + 4)', items: [['Prova 1', 'prova', 3.0], ['Trabalho', 'trabalho', 3.0], ['Prova final', 'prova', 4.0]] },
  { label: 'Prova + Seminário + Participação', items: [['Prova', 'prova', 5.0], ['Seminário', 'seminario', 4.0], ['Participação', 'participacao', 1.0]] },
  { label: 'Com Presença/Pontualidade', items: [['Prova teórica', 'prova', 4.0], ['Trabalho', 'trabalho', 3.0], ['Presença / Frequência', 'presenca', 2.0], ['Participação', 'participacao', 1.0]] },
  { label: '4 Trabalhos (2,5 cada)', items: [['Trabalho 1', 'trabalho', 2.5], ['Trabalho 2', 'trabalho', 2.5], ['Trabalho 3', 'trabalho', 2.5], ['Trabalho 4', 'trabalho', 2.5]] },
];

const newId = () => `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Editor dos critérios de avaliação de uma disciplina no modelo por soma de pontos.
 */
export function EvaluationConfig({ discipline, onSave }) {
  if (!discipline) return null;

  const initial = {
    evaluations: discipline.evaluations || [],
    passingGrade: discipline.passingGrade ?? 7.0,
    maxAbsences: discipline.maxAbsences ?? 15,
    recoveryRule: discipline.recoveryRule ?? 'substitui_menor',
  };
  const [evals, setEvals] = useState(initial.evaluations);
  const [passingGrade, setPassingGrade] = useState(initial.passingGrade);
  const [maxAbsences, setMaxAbsences] = useState(initial.maxAbsences);
  const [recoveryRule, setRecoveryRule] = useState(initial.recoveryRule);
  const [saved, setSaved] = useState(false);

  const locked = discipline.gradesClosed;
  const total = pointsTotal(evals);
  const valid = evals.length > 0 && Math.abs(total - 10.0) < 0.05 && evals.every((e) => e.name.trim());
  const current = { evaluations: evals, passingGrade, maxAbsences, recoveryRule };
  const dirty = JSON.stringify(current) !== JSON.stringify(initial);
  const removed = discipline.evaluations.filter((e) => !evals.some((x) => x.id === e.id));

  const updateEval = (id, patch) => setEvals((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEval = (id) => setEvals((list) => list.filter((e) => e.id !== id));
  
  const addEval = () =>
    setEvals((list) => [
      ...list, 
      { id: newId(), name: '', type: 'trabalho', maxPoints: Math.max(0.5, Math.round((10.0 - pointsTotal(list)) * 10) / 10) }
    ]);

  const applyPreset = (p) =>
    setEvals(p.items.map(([name, type, maxPoints]) => ({ id: newId(), name, type, maxPoints })));

  const distribute = () =>
    setEvals((list) => {
      const base = Math.floor((10.0 / list.length) * 10) / 10;
      return list.map((e, i) => ({
        ...e,
        maxPoints: i === list.length - 1 ? Math.round((10.0 - base * (list.length - 1)) * 10) / 10 : base,
      }));
    });

  const reset = () => {
    setEvals(initial.evaluations);
    setPassingGrade(initial.passingGrade);
    setMaxAbsences(initial.maxAbsences);
    setRecoveryRule(initial.recoveryRule);
  };

  const save = () => {
    onSave({
      ...current,
      evaluations: evals.map((e) => ({ ...e, name: e.name.trim(), maxPoints: Number(e.maxPoints) })),
      passingGrade: Number(passingGrade),
      maxAbsences: Number(maxAbsences),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const barColor = total === 10.0 ? 'bg-brand-500' : total > 10.0 ? 'bg-rose-400' : 'bg-amber-400';

  return (
    <div className="space-y-6">
      {/* Alerta explicativo do modelo por soma */}
      <Callout icon={Info} tone="brand">
        <strong>Sistema por Soma de Pontos:</strong> No SETA a nota final é a <strong>soma direta</strong> das notas obtidas pelo aluno. O professor distribui os 10,0 pontos da disciplina entre as atividades, e o aluno precisa somar no mínimo <strong>7,0 pontos</strong> para ser aprovado.
      </Callout>

      {locked && (
        <Callout icon={Lock} tone="neutral">
          O diário desta disciplina foi enviado à secretaria. Os critérios ficam bloqueados até a direção reabri-lo.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Distribuição dos Pontos */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Distribuição dos 10,0 pontos da matéria"
            subtitle="Adicione provas, trabalhos, presença, participação ou outras atividades e defina quanto vale cada uma."
          />
          <div className="space-y-5 p-5">
            {!locked && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-stone-400">Modelos rápidos:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="cursor-pointer rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-stone-700 dark:text-stone-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="hidden grid-cols-12 gap-2 px-1 text-xs text-stone-400 sm:grid dark:text-stone-500">
                <span className="col-span-6">Nome da avaliação</span>
                <span className="col-span-3">Tipo</span>
                <span className="col-span-2">Pontos</span>
              </div>
              {evals.map((e) => (
                <div key={e.id} className="grid grid-cols-12 items-center gap-2">
                  <Input
                    className="col-span-12 sm:col-span-6"
                    value={e.name}
                    disabled={locked}
                    placeholder="Ex.: Prova 1, Presença, Seminário..."
                    onChange={(ev) => updateEval(e.id, { name: ev.target.value })}
                  />
                  <Select
                    className="col-span-6 sm:col-span-3"
                    value={e.type}
                    disabled={locked}
                    onChange={(ev) => updateEval(e.id, { type: ev.target.value })}
                  >
                    {EVALUATION_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                  <div className="relative col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      className="pr-7 tabular-nums"
                      value={e.maxPoints}
                      disabled={locked}
                      onChange={(ev) => updateEval(e.id, { maxPoints: ev.target.value === '' ? '' : Number(ev.target.value) })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">pts</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-2 sm:col-span-1"
                    disabled={locked || evals.length === 1}
                    onClick={() => removeEval(e.id)}
                    aria-label="Remover avaliação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {!locked && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={addEval}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar avaliação
                </Button>
                <Button variant="ghost" size="sm" onClick={distribute} disabled={!evals.length}>
                  Distribuir 10,0 pontos igualmente
                </Button>
              </div>
            )}

            <div className="space-y-1.5 border-t border-stone-100 pt-4 dark:border-stone-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Total de pontos distribuídos</span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    total === 10.0 ? 'text-brand-600 dark:text-brand-300 font-bold' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {total.toFixed(1).replace('.', ',')} / 10,0 pts
                  {total < 10.0 && ` · faltam ${(10.0 - total).toFixed(1).replace('.', ',')} pts`}
                  {total > 10.0 && ` · excede em ${(total - 10.0).toFixed(1).replace('.', ',')} pts`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min((total / 10.0) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Regras de Aprovação e Recuperação */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Critérios de aprovação direta" />
            <div className="grid grid-cols-2 gap-3 p-5">
              <Field label="Nota somada mínima" hint="Total somado necessário">
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={passingGrade}
                  disabled={locked}
                  onChange={(e) => setPassingGrade(e.target.value)}
                />
              </Field>
              <Field label="Limite de faltas" hint="Máximo de faltas no período">
                <Input
                  type="number"
                  min="0"
                  value={maxAbsences}
                  disabled={locked}
                  onChange={(e) => setMaxAbsences(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Regra de recuperação" subtitle="Aplicada caso a soma final fique abaixo de 7,0." />
            <div className="space-y-2 p-5">
              {RECOVERY_RULES.map((r) => {
                const active = recoveryRule === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={locked}
                    onClick={() => setRecoveryRule(r.id)}
                    className={cn(
                      'w-full cursor-pointer rounded-xl border p-3 text-left transition disabled:cursor-not-allowed',
                      active
                        ? 'border-brand-300 bg-brand-50/70 dark:border-brand-700 dark:bg-brand-900/25'
                        : 'border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700'
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-stone-800 dark:text-stone-100">
                      <span
                        className={cn(
                          'grid h-4 w-4 place-items-center rounded-full border',
                          active ? 'border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-stone-950' : 'border-stone-300 dark:border-stone-600'
                        )}
                      >
                        {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </span>
                      {r.label}
                    </span>
                    <span className="mt-1 block pl-6 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Resumo da fórmula somada */}
      <Card className="p-5">
        <p className="text-xs text-stone-500 dark:text-stone-400">Fórmula de soma da disciplina</p>
        <p className="mt-1 text-sm font-semibold text-stone-800 dark:text-stone-100">
          {describeFormula(evals)}
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Aprovação direta: Aluno com soma &ge; {Number(passingGrade).toFixed(1).replace('.', ',')} pontos.
        </p>

        {removed.length > 0 && (
          <Callout icon={Info} tone="amber" className="mt-4">
            As notas já lançadas em <strong>{removed.map((e) => e.name).join(', ')}</strong> serão descartadas ao salvar.
          </Callout>
        )}
        {!locked && (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            {saved && (
              <span className="mr-auto flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 font-medium">
                <Check className="h-4 w-4" /> Critérios de soma salvos com sucesso
              </span>
            )}
            {!valid && evals.length > 0 && (
              <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">
                {Math.abs(total - 10.0) >= 0.05
                  ? `Os pontos precisam somar exatamente 10,0 (atualmente somam ${total.toFixed(1).replace('.', ',')} pts).`
                  : 'Dê um nome a todas as avaliações.'}
              </span>
            )}
            <Button variant="ghost" onClick={reset} disabled={!dirty}>
              Descartar
            </Button>
            <Button onClick={save} disabled={!valid || !dirty}>
              Salvar critérios de pontuação
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
