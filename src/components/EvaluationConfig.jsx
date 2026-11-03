import { useState } from 'react';
import { Check, Info, Lock, Plus, Trash2 } from 'lucide-react';
import { EVALUATION_TYPES, RECOVERY_RULES } from '../data/seed';
import { describeFormula, weightTotal } from '../lib/grades';
import { Button, Callout, Card, CardHeader, Field, Input, Select, cn } from './ui';

const PRESETS = [
  { label: '2 provas + trabalho', items: [['Prova 1', 'prova', 30], ['Trabalho', 'trabalho', 30], ['Prova 2', 'prova', 40]] },
  { label: 'Prova + seminário', items: [['Prova', 'prova', 60], ['Seminário', 'seminario', 40]] },
  { label: 'Somente trabalhos', items: [['Trabalho 1', 'trabalho', 50], ['Trabalho 2', 'trabalho', 50]] },
  { label: 'Avaliação contínua', items: [['Participação', 'participacao', 20], ['Fichamento', 'fichamento', 30], ['Resenha', 'resenha', 50]] },
  { label: 'Prova única', items: [['Prova final', 'prova', 100]] },
];

const newId = () => `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Editor dos critérios de avaliação de uma disciplina.
 * Use com key={discipline.id} para reiniciar ao trocar de disciplina.
 */
export function EvaluationConfig({ discipline, onSave }) {
  const initial = {
    evaluations: discipline.evaluations,
    passingGrade: discipline.passingGrade,
    maxAbsences: discipline.maxAbsences,
    recoveryRule: discipline.recoveryRule,
  };
  const [evals, setEvals] = useState(initial.evaluations);
  const [passingGrade, setPassingGrade] = useState(initial.passingGrade);
  const [maxAbsences, setMaxAbsences] = useState(initial.maxAbsences);
  const [recoveryRule, setRecoveryRule] = useState(initial.recoveryRule);
  const [saved, setSaved] = useState(false);

  const locked = discipline.gradesClosed;
  const total = weightTotal(evals);
  const valid = evals.length > 0 && total === 100 && evals.every((e) => e.name.trim());
  const current = { evaluations: evals, passingGrade, maxAbsences, recoveryRule };
  const dirty = JSON.stringify(current) !== JSON.stringify(initial);
  const removed = discipline.evaluations.filter((e) => !evals.some((x) => x.id === e.id));

  const updateEval = (id, patch) => setEvals((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEval = (id) => setEvals((list) => list.filter((e) => e.id !== id));
  const addEval = () =>
    setEvals((list) => [...list, { id: newId(), name: '', type: 'trabalho', weight: Math.max(0, 100 - weightTotal(list)) }]);
  const applyPreset = (p) => setEvals(p.items.map(([name, type, weight]) => ({ id: newId(), name, type, weight })));
  const distribute = () =>
    setEvals((list) => {
      const base = Math.floor(100 / list.length);
      return list.map((e, i) => ({ ...e, weight: i === list.length - 1 ? 100 - base * (list.length - 1) : base }));
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
      evaluations: evals.map((e) => ({ ...e, name: e.name.trim(), weight: Number(e.weight) })),
      passingGrade: Number(passingGrade),
      maxAbsences: Number(maxAbsences),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const barColor = total === 100 ? 'bg-brand-500' : total > 100 ? 'bg-rose-400' : 'bg-amber-400';

  return (
    <div className="space-y-6">
      {locked && (
        <Callout icon={Lock} tone="neutral">
          O diário desta disciplina foi enviado à secretaria. Os critérios ficam bloqueados até a direção reabri-lo.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Composição da média */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Composição da média"
            subtitle="Adicione provas, trabalhos, seminários ou outras avaliações e defina o peso de cada uma."
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
                <span className="col-span-2">Peso</span>
              </div>
              {evals.map((e) => (
                <div key={e.id} className="grid grid-cols-12 items-center gap-2">
                  <Input
                    className="col-span-12 sm:col-span-6"
                    value={e.name}
                    disabled={locked}
                    placeholder="Ex.: Prova 1, Resenha..."
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
                      min="0"
                      max="100"
                      className="pr-7 tabular-nums"
                      value={e.weight}
                      disabled={locked}
                      onChange={(ev) => updateEval(e.id, { weight: ev.target.value === '' ? '' : Number(ev.target.value) })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">%</span>
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
                  Distribuir pesos igualmente
                </Button>
              </div>
            )}

            <div className="space-y-1.5 border-t border-stone-100 pt-4 dark:border-stone-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Soma dos pesos</span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    total === 100 ? 'text-brand-600 dark:text-brand-300' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {total}%
                  {total < 100 && ` · faltam ${100 - total}%`}
                  {total > 100 && ` · excede em ${total - 100}%`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min(total, 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Regras */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Aprovação e frequência" />
            <div className="grid grid-cols-2 gap-3 p-5">
              <Field label="Média mínima">
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
              <Field label="Limite de faltas">
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
            <CardHeader title="Regra de recuperação" subtitle="Aplicada a quem ficar abaixo da média mínima." />
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

      {/* Resumo e ações */}
      <Card className="p-5">
        <p className="text-xs text-stone-500 dark:text-stone-400">Fórmula da média</p>
        <p className="mt-1 text-sm text-stone-800 dark:text-stone-100">
          {evals.length ? describeFormula(evals) : 'Nenhuma avaliação definida'}
        </p>
        {removed.length > 0 && (
          <Callout icon={Info} tone="amber" className="mt-4">
            As notas já lançadas em <strong>{removed.map((e) => e.name).join(', ')}</strong> serão descartadas ao salvar.
          </Callout>
        )}
        {!locked && (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            {saved && (
              <span className="mr-auto flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300">
                <Check className="h-4 w-4" /> Critérios salvos
              </span>
            )}
            {!valid && evals.length > 0 && (
              <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">
                {total !== 100 ? 'A soma dos pesos precisa ser 100%.' : 'Dê um nome a todas as avaliações.'}
              </span>
            )}
            <Button variant="ghost" onClick={reset} disabled={!dirty}>
              Descartar
            </Button>
            <Button onClick={save} disabled={!valid || !dirty}>
              Salvar critérios
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
