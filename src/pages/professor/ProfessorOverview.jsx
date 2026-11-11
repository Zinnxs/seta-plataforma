import { useState } from 'react';
import { ArrowRight, CheckCircle2, Radio, BookOpen } from 'lucide-react';
import { useStore } from '../../lib/store';
import { disciplineStats } from '../../lib/grades';
import { firstName, fmtDate, fmtDateTime, fmtGrade } from '../../lib/format';
import { typeLabel } from '../../data/seed';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader, cn } from '../../components/ui';

export function ProfessorOverview({ disciplines, onNavigate }) {
  const { data, currentUser } = useStore();
  const [statusFilter, setStatusFilter] = useState('em_andamento'); // 'em_andamento' | 'concluida' | 'futura' | 'todas'

  const activeDisciplines = disciplines.filter(d => (d.status || (d.gradesClosed ? 'concluida' : 'em_andamento')) === 'em_andamento');
  const concludedDisciplines = disciplines.filter(d => (d.status || (d.gradesClosed ? 'concluida' : 'em_andamento')) === 'concluida');
  const futureDisciplines = disciplines.filter(d => d.status === 'futura');

  const filteredDisciplines = statusFilter === 'todas' 
    ? disciplines 
    : statusFilter === 'concluida' 
      ? concludedDisciplines 
      : statusFilter === 'futura' 
        ? futureDisciplines 
        : activeDisciplines;

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
      {/* Saudação Tipográfica Acadêmica do Docente */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#6E6A63] dark:text-[#9E9C96]">
              Corpo Docente · {currentUser.title || 'Prof.'}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-[11px] font-medium text-[#B48636] dark:text-[#E0A94E]">
              Período {data.institution.period}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1D1B18] dark:text-[#EDEDE8]">
            Olá, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Seminário Teológico Aliança · {disciplines.length} disciplinas sob sua regência
          </p>
        </div>
      </div>

      {/* Barra de Filtro do Arquivo de Matérias */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">Disciplinas sob sua Responsabilidade</h3>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">Gerencie notas, frequências e critérios de avaliação</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 bg-stone-100/90 dark:bg-white/[0.05] rounded-lg text-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setStatusFilter('em_andamento')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-xs',
              statusFilter === 'em_andamento'
                ? 'bg-white text-[#1D1B18] shadow-xs dark:bg-[#22242B] dark:text-[#EDEDE8]'
                : 'text-[#6E6A63] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:text-[#EDEDE8]'
            )}
          >
            Em Andamento ({activeDisciplines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('concluida')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-xs',
              statusFilter === 'concluida'
                ? 'bg-white text-[#1D1B18] shadow-xs dark:bg-[#22242B] dark:text-[#EDEDE8]'
                : 'text-[#6E6A63] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:text-[#EDEDE8]'
            )}
          >
            Concluídas ({concludedDisciplines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('futura')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-xs',
              statusFilter === 'futura'
                ? 'bg-white text-[#1D1B18] shadow-xs dark:bg-[#22242B] dark:text-[#EDEDE8]'
                : 'text-[#6E6A63] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:text-[#EDEDE8]'
            )}
          >
            Futuras ({futureDisciplines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('todas')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-xs',
              statusFilter === 'todas'
                ? 'bg-white text-[#1D1B18] shadow-xs dark:bg-[#22242B] dark:text-[#EDEDE8]'
                : 'text-[#6E6A63] hover:text-[#1D1B18] dark:text-[#9E9C96] dark:hover:text-[#EDEDE8]'
            )}
          >
            Todas ({disciplines.length})
          </button>
        </div>
      </div>

      {filteredDisciplines.length === 0 ? (
        <Card className="mb-8">
          <EmptyState
            icon={BookOpen}
            title={`Nenhuma matéria ${statusFilter === 'concluida' ? 'concluída' : statusFilter === 'futura' ? 'futura' : 'em andamento'}`}
            text="Alterne as abas acima para navegar pelas outras disciplinas."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDisciplines.map((d) => {
            const st = disciplineStats(d, data.grades[d.id]);
            const isCompleted = (d.status || (d.gradesClosed ? 'concluida' : 'em_andamento')) === 'concluida';
            const isFuture = d.status === 'futura';
            return (
              <Card key={d.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
                      <span className="font-mono whitespace-nowrap font-medium text-[#B48636] dark:text-[#E0A94E]">{d.code}</span> · {d.schedule}
                    </p>
                    <h3 className="mt-0.5 font-medium text-[#1D1B18] dark:text-[#EDEDE8]">{d.name}</h3>
                  </div>
                  {isCompleted ? (
                    <Badge tone="green">Concluída / Arquivada</Badge>
                  ) : isFuture ? (
                    <Badge tone="neutral">Futura / Planejada</Badge>
                  ) : d.gradesClosed ? (
                    <Badge tone="neutral">Diário enviado</Badge>
                  ) : (
                    <Badge tone="brand">Em andamento</Badge>
                  )}
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
      )}

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
