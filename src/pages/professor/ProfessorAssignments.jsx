import { useState } from 'react';
import { Calendar, FileText, Plus, Download, Mail, MessageSquare, Upload, ExternalLink, CheckCircle2 } from 'lucide-react';
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
  const list = data.assignments.filter((a) => a.disciplineId === discipline.id);

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
          const subType = a.submissionType || 'upload';

          return (
            <Card key={a.id}>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-stone-900 dark:text-stone-50">{a.title}</h3>
                    {subType === 'upload' && (
                      <Badge tone="blue" className="gap-1">
                        <Upload className="h-3 w-3" /> Pela Plataforma (Arquivo)
                      </Badge>
                    )}
                    {subType === 'email' && (
                      <Badge tone="brand" className="gap-1">
                        <Mail className="h-3 w-3" /> Por E-mail
                      </Badge>
                    )}
                    {subType === 'custom' && (
                      <Badge tone="neutral" className="gap-1">
                        <MessageSquare className="h-3 w-3" /> Personalizado / WhatsApp
                      </Badge>
                    )}
                    {waiting > 0 && <Badge tone="amber">{waiting} para corrigir</Badge>}
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">{a.description}</p>
                  
                  {subType === 'email' && a.destinationEmail && (
                    <p className="mt-1 text-xs text-brand-700 dark:text-brand-300">
                      Recebimento: <strong>{a.destinationEmail}</strong>
                    </p>
                  )}

                  {subType === 'custom' && a.customInstructions && (
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 italic bg-stone-50 dark:bg-stone-800/40 p-2 rounded-lg border border-stone-200 dark:border-stone-800 inline-block">
                      {a.customInstructions}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Entrega até {fmtDate(a.dueDate)}
                      {isPast(a.dueDate) && <span className="text-rose-500 font-semibold">(encerrado)</span>}
                    </span>
                    <span>
                      {evaluation ? `Vale até ${Number(evaluation.maxPoints).toFixed(1).replace('.', ',')} pts em: ${evaluation.name}` : 'Atividade formativa sem pontos'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xs text-stone-400">Entregas</p>
                  <p className="text-lg font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                    {a.submissions.length}
                    <span className="text-xs font-normal text-stone-400"> / {enrolled.length}</span>
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
                          <p className="truncate text-sm text-stone-800 dark:text-stone-100 font-medium">{st?.name}</p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                            <span>{s.fileName || 'Trabalho entregue'}</span>
                            {s.fileSize && <span>· {s.fileSize}</span>}
                            <span>· {fmtDateTime(s.submittedAt)}</span>
                          </p>
                        </div>
                        {s.grade !== null ? (
                          <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-50">{fmtGrade(s.grade)} pts</span>
                        ) : (
                          <Badge tone="amber">Aguardando correção</Badge>
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
  const { currentUser } = useStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    evaluationId: discipline.evaluations[0]?.id ?? '',
    submissionType: 'upload', // 'upload' | 'email' | 'custom'
    destinationEmail: currentUser?.email || '',
    customInstructions: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim() && form.dueDate;

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova atividade acadêmica"
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
                submissionType: form.submissionType,
                destinationEmail: form.submissionType === 'email' ? (form.destinationEmail.trim() || currentUser?.email) : null,
                customInstructions: form.submissionType === 'custom' ? form.customInstructions.trim() : null,
                submissions: [],
              })
            }
          >
            Publicar atividade
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título da Atividade">
          <Input value={form.title} onChange={set('title')} placeholder="Ex.: Ensaio Exegético — Romanos 8" required />
        </Field>

        <Field label="Orientações e Enunciado">
          <Textarea rows={3} value={form.description} onChange={set('description')} placeholder="Número de páginas, bibliografia indicada, critérios de avaliação..." />
        </Field>

        {/* Escolha da Modalidade de Entrega */}
        <Field label="Forma de Envio do Trabalho">
          <Select value={form.submissionType} onChange={set('submissionType')}>
            <option value="upload">Pela plataforma (Envio de arquivo PDF ou Word até 15MB)</option>
            <option value="email">Por E-mail (Receber no e-mail do professor)</option>
            <option value="custom">Personalizado (WhatsApp, entrega física em sala de aula, etc.)</option>
          </Select>
        </Field>

        {form.submissionType === 'email' && (
          <Field label="E-mail para recebimento dos trabalhos" hint="Os alunos receberão instruções e botão para enviar a este endereço.">
            <Input 
              type="email" 
              value={form.destinationEmail} 
              onChange={set('destinationEmail')} 
              placeholder="professor@seta.com" 
              required 
            />
          </Field>
        )}

        {form.submissionType === 'custom' && (
          <Field label="Instruções personalizadas de entrega" hint="Explique onde e como o aluno deve entregar.">
            <Textarea 
              rows={2} 
              value={form.customInstructions} 
              onChange={set('customInstructions')} 
              placeholder="Ex.: Enviar arquivo no WhatsApp do professor: (81) 98765-4321 ou entregar impresso no início da aula." 
              required 
            />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data limite de entrega" hint="Após essa data, o envio é bloqueado.">
            <Input type="date" value={form.dueDate} onChange={set('dueDate')} required />
          </Field>

          <Field label="Vinculado à atividade de" hint="A pontuação obtida é somada no diário.">
            <Select value={form.evaluationId} onChange={set('evaluationId')}>
              {discipline.evaluations.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} (até {Number(e.maxPoints).toFixed(1).replace('.', ',')} pts)
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
  const maxAllowed = evaluation ? Number(evaluation.maxPoints) : 10;
  const [grade, setGrade] = useState(submission.grade !== null ? String(submission.grade).replace('.', ',') : '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const parsed = Number(grade.replace(',', '.'));
  const valid = grade.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0 && parsed <= maxAllowed;

  const hasFile = Boolean(submission.fileUrl);

  return (
    <Modal
      open
      onClose={onClose}
      title="Correção e Atribuição de Pontos"
      description={`${student?.name} · ${assignment.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid} onClick={() => onSave(Math.round(parsed * 10) / 10, feedback.trim())}>
            Salvar pontuação
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Bloco de Informações da Entrega */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{submission.fileName || 'Arquivo entregue'}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {submission.fileSize ? `${submission.fileSize} · ` : ''}Entregue em {fmtDateTime(submission.submittedAt)}
              </p>
            </div>
          </div>

          {hasFile ? (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={submission.fileName}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 transition shadow-sm cursor-pointer"
              title="Abrir ou baixar arquivo original do aluno"
            >
              <Download className="h-4 w-4" /> Abrir / Baixar Arquivo
            </a>
          ) : (
            <Badge tone="brand">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {submission.submissionType === 'email' ? 'Confirmado via E-mail' : 'Confirmado pelo Aluno'}
            </Badge>
          )}
        </div>

        {/* Observação enviada pelo aluno */}
        {submission.studentNote && (
          <div className="p-3.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
            <span className="font-semibold text-stone-700 dark:text-stone-300 block">Observação deixada pelo aluno:</span>
            <p className="text-stone-600 dark:text-stone-300 italic">{submission.studentNote}</p>
          </div>
        )}

        <Field
          label={`Pontos obtidos pelo aluno (0 a ${maxAllowed.toFixed(1).replace('.', ',')} pts)`}
          hint={evaluation ? `Será somado na atividade “${evaluation.name}” do diário.` : 'Atividade formativa: a pontuação não entra na soma final.'}
        >
          <Input 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)} 
            inputMode="decimal" 
            placeholder={`Ex.: ${Math.min(2.5, maxAllowed).toFixed(1).replace('.', ',')}`} 
            className="w-36 tabular-nums" 
          />
        </Field>

        <Field label="Comentário pedagógico / Parecer para o aluno">
          <Textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Pontos fortes, aspectos exegéticos, referências recomendadas..."
          />
        </Field>
      </div>
    </Modal>
  );
}
