import { ArrowRight, CheckCircle2, Radio } from 'lucide-react';
import { useStore } from '../../lib/store';
import { disciplineStats } from '../../lib/grades';
import { firstName, fmtDate, fmtDateTime, fmtGrade } from '../../lib/format';
import { typeLabel } from '../../data/seed';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader } from '../../components/ui';

export function ProfessorOverview({ disciplines, onNavigate }) {
  const { data, currentUser } = useStore();

  const pending = [];
  data.assignments.forEach((a) => {
    const d = disciplines.find((x) => x.id === a.disciplineId);
    if (!d) return;
    a.submissions
      .filter((s) => s.grade === null)
      .forEach((s) => pending.push({ a, s, d, st: data.students.find((x) => x.id === s.studentId) }));
  });

  const live = data.lessons
    .filter((l) => l.kind === 'ao_vivo' && disciplines.some((d) => d.id === l.disciplineId))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader
        title={`Olá, ${currentUser.title} ${firstName(currentUser.name)}`}
        subtitle={`Período letivo ${data.institution.period} · ${disciplines.length} disciplinas sob sua responsabilidade`}
      />

      {/* Banner Oficial do Professor */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#060a17] via-[#0b132b] to-[#121e3f] p-5 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/50 bg-[#070d1e] shadow-md">
              <img src="/portal_seta_symbol.png" alt="Portal SETA" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                Portal SETA · Corpo Docente
              </div>
              <h2 className="mt-1 font-serif text-lg font-bold text-white">{currentUser.name}</h2>
              <p className="text-xs text-slate-300">Seminário Teológico Aliança · Período {data.institution.period}</p>
            </div>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-amber-500/20 pt-3 sm:pt-0 sm:pl-5">
            <p className="text-xs font-semibold text-amber-300">Bacharel em Teologia</p>
            <p className="text-[11px] text-slate-400">Ambiente de Docência e Notas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {disciplines.map((d) => {
          const st = disciplineStats(d, data.grades[d.id]);
          return (
            <Card key={d.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {d.code} · {d.schedule}
                  </p>
                  <h3 className="mt-0.5 font-medium text-stone-900 dark:text-stone-50">{d.name}</h3>
                </div>
                {d.gradesClosed ? <Badge>Diário enviado</Badge> : <Badge tone="brand">Em andamento</Badge>}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500">Alunos</p>
                  <p className="mt-0.5 font-medium tabular-nums">{st.count}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500">Pontuação média</p>
                  <p className="mt-0.5 font-medium tabular-nums">{fmtGrade(st.average)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500">Recuperação (soma &lt; 7)</p>
                  <p className={`mt-0.5 font-medium tabular-nums ${st.recovery ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                    {st.recovery}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {d.evaluations.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                    title={typeLabel(e.type)}
                  >
                    {e.name} · {Number(e.maxPoints).toFixed(1).replace('.', ',')} pts
                  </span>
                ))}
              </div>

              <div className="mt-5 flex gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                <Button size="sm" onClick={() => onNavigate('notas', d.id)}>
                  Lançar notas
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onNavigate('avaliacao', d.id)}>
                  Critérios
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Correções pendentes" subtitle="Trabalhos enviados aguardando sua avaliação" />
          {pending.length ? (
            <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
              {pending.map(({ a, s, d, st }) => (
                <li key={a.id + s.studentId}>
                  <button
                    type="button"
                    onClick={() => onNavigate('trabalhos', d.id)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800/30"
                  >
                    <Avatar name={st?.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-stone-800 dark:text-stone-100">{st?.name}</span>
                      <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                        {a.title} · {fmtDateTime(s.submittedAt)}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-stone-300 dark:text-stone-600" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} title="Tudo em dia" text="Não há trabalhos aguardando correção." />
          )}
        </Card>

        <Card>
          <CardHeader title="Próximas aulas ao vivo" />
          {live.length ? (
            <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
              {live.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300">
                    <Radio className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-stone-800 dark:text-stone-100">{l.title}</span>
                    <span className="block text-xs text-stone-500 dark:text-stone-400">
                      {fmtDate(l.date, { weekday: 'long', day: '2-digit', month: 'short' })} · {l.duration}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Radio} title="Nenhuma aula ao vivo agendada" />
          )}
        </Card>
      </div>
    </>
  );
}
