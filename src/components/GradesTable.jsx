import { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { computeResult, describeFormula, isNum, pointsTotal } from '../lib/grades';
import { fmtGrade } from '../lib/format';
import { RECOVERY_RULES, typeLabel } from '../data/seed';
import { GradeInput } from './GradeInput';
import { Avatar, Callout, Card, StatusBadge, Tabs } from './ui';

/**
 * Tabela de notas no modelo de PONTOS SOMADOS:
 * As notas lançadas em cada atividade são somadas diretamente.
 * Para ser aprovado, o aluno precisa atingir a nota somada mínima de 7,0 pontos.
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
  const totalDiscPoints = pointsTotal(discipline.evaluations);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: 'todos', label: 'Todos os alunos', count: rows.length },
            { id: 'recuperacao', label: 'Em recuperação (soma < 7,0)', count: recoveryRows.length },
          ]}
        />
        {actions}
      </div>

      {filter === 'recuperacao' && (
        <Callout icon={Info} tone="amber">
          <strong className="font-medium">Regra de Recuperação ({rule?.label}):</strong> {rule?.description}
          <span className="block mt-0.5">Nota somada mínima exigida para aprovação: <strong>{fmtGrade(discipline.passingGrade)} pontos</strong>.</span>
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
                      {typeLabel(e.type)} · até {Number(e.maxPoints).toFixed(1).replace('.', ',')} pts
                    </div>
                  </th>
                ))}
                <th className="px-2 py-3 text-center font-medium">
                  <div className="text-stone-700 dark:text-stone-200">Recuperação</div>
                  <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">se soma &lt; 7,0</div>
                </th>
                <th className="px-2 py-3 text-center font-medium">
                  <div className="text-stone-700 dark:text-stone-200">Faltas</div>
                  <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">
                    máx. {discipline.maxAbsences}
                  </div>
                </th>
                <th className="px-3 py-3 text-center font-medium text-stone-700 dark:text-stone-200">
                  <div>Nota Somada</div>
                  <div className="mt-0.5 text-[11px] font-normal text-stone-400 dark:text-stone-500">min. 7,0 / 10,0</div>
                </th>
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
                          max={Number(e.maxPoints) || 10}
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
                          max={10.0}
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
                      <span className={`font-bold tabular-nums ${
                        res.final >= 7.0 
                          ? 'text-stone-900 dark:text-stone-50' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {fmtGrade(res.final)}
                        <span className="text-[11px] font-normal text-stone-400"> / {totalDiscPoints.toFixed(1).replace('.', ',')}</span>
                      </span>
                      {res.recoveryApplied && (
                        <span className="block text-[11px] tabular-nums text-stone-400 line-through">
                          anterior: {fmtGrade(res.sum)}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-400 dark:text-stone-500 gap-2">
        <p>
          {disabled ? 'Somente visualização.' : 'As notas são somadas automaticamente ao sair do campo.'}
        </p>
        <p className="font-medium text-stone-600 dark:text-stone-400">
          Critério de aprovação: Nota somada &ge; {fmtGrade(discipline.passingGrade)} pontos.
        </p>
      </div>
    </div>
  );
}
