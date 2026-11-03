import { useState } from 'react';
import { Info } from 'lucide-react';
import { useStore } from '../lib/store';
import { computeResult, describeFormula, isNum } from '../lib/grades';
import { fmtGrade } from '../lib/format';
import { RECOVERY_RULES, typeLabel } from '../data/seed';
import { GradeInput } from './GradeInput';
import { Avatar, Callout, Card, StatusBadge, Tabs } from './ui';

/**
 * Tabela de notas com colunas dinâmicas conforme os critérios da disciplina.
 * readOnly: visualização (ex.: direção). Diário fechado também bloqueia a edição.
 */
export function GradesTable({ discipline, readOnly = false, actions }) {
  const { data, setScore, setRecovery, setAbsences } = useStore();
  const [filter, setFilter] = useState('todos');

  const records = data.grades[discipline.id] || {};
  const rows = Object.keys(records)
    .map((id) => {
      const st = data.students.find((s) => s.id === id);
      return { st, rec: records[id], res: computeResult(discipline, records[id]) };
    })
    .filter((r) => r.st)
    .sort((a, b) => a.st.name.localeCompare(b.st.name));

  const recoveryRows = rows.filter((r) => r.res.needsRecovery || r.res.recoveryApplied);
  const visible = filter === 'recuperacao' ? recoveryRows : rows;
  const disabled = readOnly || discipline.gradesClosed;
  const rule = RECOVERY_RULES.find((r) => r.id === discipline.recoveryRule);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: 'todos', label: 'Todos', count: rows.length },
            { id: 'recuperacao', label: 'Recuperação', count: recoveryRows.length },
          ]}
        />
        {actions}
      </div>

      {filter === 'recuperacao' && (
        <Callout icon={Info} tone="amber">
          <strong className="font-medium">{rule?.label}.</strong> {rule?.description} Média mínima:{' '}
          {fmtGrade(discipline.passingGrade)}.
        </Callout>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                <th className="px-5 py-3 text-left font-medium">Aluno</th>
                {discipline.evaluations.map((e) => (
                  <th key={e.id} className="px-2 py-3 text-center font-medium">
                    <div className="text-stone-700 dark:text-stone-200">{e.name}</div>
                    <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">
                      {typeLabel(e.type)} · {e.weight}%
                    </div>
                  </th>
                ))}
                <th className="px-2 py-3 text-center font-medium">
                  <div className="text-stone-700 dark:text-stone-200">Recuperação</div>
                  <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">se necessário</div>
                </th>
                <th className="px-2 py-3 text-center font-medium">
                  <div className="text-stone-700 dark:text-stone-200">Faltas</div>
                  <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">
                    máx. {discipline.maxAbsences}
                  </div>
                </th>
                <th className="px-3 py-3 text-center font-medium text-stone-700 dark:text-stone-200">Média</th>
                <th className="px-5 py-3 text-left font-medium text-stone-700 dark:text-stone-200">Situação</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ st, rec, res }) => {
                const canRecover = res.needsRecovery || isNum(rec.recovery);
                return (
                  <tr
                    key={st.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60 dark:border-stone-800/70 dark:hover:bg-stone-800/20"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={st.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-800 dark:text-stone-100">{st.name}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">{st.enrollment}</p>
                        </div>
                      </div>
                    </td>
                    {discipline.evaluations.map((e) => (
                      <td key={e.id} className="px-2 py-2.5 text-center">
                        <GradeInput
                          label={`${e.name} — ${st.name}`}
                          value={rec.scores[e.id] ?? null}
                          disabled={disabled}
                          onCommit={(v) => setScore(discipline.id, st.id, e.id, v)}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center">
                      {canRecover ? (
                        <GradeInput
                          label={`Recuperação — ${st.name}`}
                          value={rec.recovery ?? null}
                          disabled={disabled}
                          highlight
                          onCommit={(v) => setRecovery(discipline.id, st.id, v)}
                        />
                      ) : (
                        <span className="text-stone-300 dark:text-stone-600">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <GradeInput
                        integer
                        max={99}
                        label={`Faltas — ${st.name}`}
                        value={rec.absences ?? 0}
                        disabled={disabled}
                        onCommit={(v) => setAbsences(discipline.id, st.id, v ?? 0)}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-50">{fmtGrade(res.final)}</span>
                      {res.recoveryApplied && (
                        <span className="block text-[11px] tabular-nums text-stone-400 line-through">
                          {fmtGrade(res.average)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusBadge status={res.status} />
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={discipline.evaluations.length + 5} className="px-5 py-10 text-center text-sm text-stone-500">
                    Nenhum aluno em recuperação nesta disciplina.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        {disabled ? 'Somente visualização.' : 'As notas são salvas automaticamente ao sair do campo.'} Média ={' '}
        {describeFormula(discipline.evaluations)}.
      </p>
    </div>
  );
}
