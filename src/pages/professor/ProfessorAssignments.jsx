import { useState } from 'react';
import { Calendar, FileText, Plus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { fmtDate, fmtDateTime, fmtGrade, isPast } from '../../lib/format';
import {
  Avatar,
  Badge,
  Button,
  Card,
  DisciplineSelect,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui';

export function ProfessorAssignments({ discipline, disciplines, onChangeDiscipline }) {
  const { data, addAssignment, gradeSubmission } = useStore();
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState(null); // { assignment, submission }

  const enrolled = Object.keys(data.grades[discipline.id] || {});
  const list = data.assignments
    .filter((a) => a.disciplineId === discipline.id)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <>
      <PageHeader
        title="Trabalhos"
        subtitle="Publique atividades, receba os arquivos dos alunos e registre a correção."
        actions={
          <>
            <DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />
            <Button onClick={() => setCreating(true)} disabled={discipline.gradesClosed}>
              <Plus className="h-4 w-4" /> Nova atividade
            </Button>
          </>
        }
      />

      {list.length === 0 && (
        <Card>
          <EmptyState icon={FileText} title="Nenhuma atividade publicada" text="Crie a primeira atividade desta disciplina." />
        </Card>
      )}

      <div className="space-y-4">
        {list.map((a) => {
          const evaluation = discipline.evaluations.find((e) => e.id === a.evaluationId);
          const waiting = a.submissions.filter((s) => s.grade === null).length;
          const missing = enrolled.filter((id) => !a.submissions.some((s) => s.studentId === id));
          return (
            <Card key={a.id}>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-stone-900 dark:text-stone-50">{a.title}</h3>
                    {waiting > 0 && <Badge tone="amber">{waiting} para corrigir</Badge>}
                  </div>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">{a.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Entrega até {fmtDate(a.dueDate)}
                      {isPast(a.dueDate) && ' (encerrado)'}
                    </span>
                    <span>
                      {evaluation ? `Vale nota em: ${evaluation.name} (${evaluation.weight}%)` : 'Atividade sem nota vinculada'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xs text-stone-400 dark:text-stone-500">Entregas</p>
                  <p className="text-lg font-semibold tabular-nums text-stone-900 dark:text-stone-50">
                    {a.submissions.length}
                    <span className="text-sm font-normal text-stone-400"> / {enrolled.length}</span>
                  </p>
                </div>
              </div>

              {a.submissions.length > 0 && (
                <ul className="divide-y divide-stone-100 border-t border-stone-100 dark:divide-stone-800 dark:border-stone-800">
                  {a.submissions.map((s) => {
                    const st = data.students.find((x) => x.id === s.studentId);
                    return (
                      <li key={s.studentId} className="flex items-center gap-3 px-5 py-3">
                        <Avatar name={st?.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-stone-800 dark:text-stone-100">{st?.name}</p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {s.fileName} · {fmtDateTime(s.submittedAt)}
                          </p>
                        </div>
                        {s.grade !== null ? (
                          <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-50">{fmtGrade(s.grade)}</span>
                        ) : (
                          <Badge tone="amber">Aguardando</Badge>
                        )}
                        <Button
                          variant={s.grade === null ? 'primary' : 'ghost'}
                          size="sm"
                          disabled={discipline.gradesClosed}
                          onClick={() => setReviewing({ assignment: a, submission: s, evaluation })}
                        >
                          {s.grade === null ? 'Corrigir' : 'Revisar'}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {missing.length > 0 && (
                <p className="border-t border-stone-100 px-5 py-3 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
                  Não entregaram: {missing.map((id) => data.students.find((s) => s.id === id)?.name.split(' ')[0]).join(', ')}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {creating && (
        <NewAssignmentModal
          discipline={discipline}
          onClose={() => setCreating(false)}
          onSave={(a) => {
            addAssignment(a);
            setCreating(false);
          }}
        />
      )}

      {reviewing && (
        <ReviewModal
          {...reviewing}
          student={data.students.find((s) => s.id === reviewing.submission.studentId)}
          onClose={() => setReviewing(null)}
          onSave={(grade, feedback) => {
            gradeSubmission(reviewing.assignment.id, reviewing.submission.studentId, grade, feedback);
            setReviewing(null);
          }}
        />
      )}
    </>
  );
}

function NewAssignmentModal({ discipline, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', evaluationId: discipline.evaluations[0]?.id ?? '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim() && form.dueDate;

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova atividade"
      description={`${discipline.code} · ${discipline.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSave({
                id: `ass-${Date.now()}`,
                disciplineId: discipline.id,
                evaluationId: form.evaluationId || null,
                title: form.title.trim(),
                description: form.description.trim(),
                dueDate: form.dueDate,
                submissions: [],
              })
            }
          >
            Publicar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título">
          <Input value={form.title} onChange={set('title')} placeholder="Ex.: Resenha crítica — Calvino e os decretos" />
        </Field>
        <Field label="Orientações">
          <Textarea rows={4} value={form.description} onChange={set('description')} placeholder="Número de páginas, bibliografia, normas de citação..." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de entrega">
            <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </Field>
          <Field label="Vale nota em" hint="A correção é lançada automaticamente no diário.">
            <Select value={form.evaluationId} onChange={set('evaluationId')}>
              {discipline.evaluations.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.weight}%)
                </option>
              ))}
              <option value="">Sem nota (atividade formativa)</option>
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function ReviewModal({ assignment, submission, evaluation, student, onClose, onSave }) {
  const [grade, setGrade] = useState(submission.grade !== null ? String(submission.grade).replace('.', ',') : '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const parsed = Number(grade.replace(',', '.'));
  const valid = grade.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0 && parsed <= 10;

  return (
    <Modal
      open
      onClose={onClose}
      title="Correção"
      description={`${student?.name} · ${assignment.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid} onClick={() => onSave(Math.round(parsed * 10) / 10, feedback.trim())}>
            Salvar correção
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-800">
          <FileText className="h-5 w-5 text-stone-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-stone-800 dark:text-stone-100">{submission.fileName}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {submission.fileSize} · enviado em {fmtDateTime(submission.submittedAt)}
            </p>
          </div>
          <Button variant="ghost" size="sm" disabled title="Disponível na versão com armazenamento em nuvem">
            Abrir
          </Button>
        </div>

        <Field
          label="Nota (0 a 10)"
          hint={evaluation ? `Será lançada em “${evaluation.name}” no diário de notas.` : 'Atividade formativa: a nota não entra na média.'}
        >
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} inputMode="decimal" placeholder="Ex.: 8,5" className="w-32 tabular-nums" />
        </Field>

        <Field label="Comentário para o aluno">
          <Textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Pontos fortes, aspectos a melhorar, referências sugeridas..."
          />
        </Field>
      </div>
    </Modal>
  );
}
