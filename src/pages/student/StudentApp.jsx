import React, { useState } from 'react';
import { 
  Award, 
  FileText, 
  Video, 
  Bell, 
  Printer, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useStore } from '../../lib/store';
import { computeResult, describeFormula, isNum, pointsTotal } from '../../lib/grades';
import { fmtDate, fmtDateTime, fmtGrade, fmtSize, isPast, personName } from '../../lib/format';
import { typeLabel } from '../../data/seed';
import { 
  Avatar, 
  Badge, 
  Button, 
  Card, 
  CardHeader, 
  EmptyState, 
  Field, 
  Input, 
  Modal, 
  PageHeader, 
  StatusBadge, 
  Tabs,
  Callout 
} from '../../components/ui';
import { LessonList } from '../../components/LessonList';

export function StudentApp() {
  const { data, currentUser, submitWork } = useStore();
  const [page, setPage] = useState('boletim');
  const [uploadingAssignment, setUploadingAssignment] = useState(null);

  const student = currentUser;

  // Disciplinas e pontuações do aluno
  const studentRows = data.disciplines.map(d => {
    const prof = data.professors.find(p => p.id === d.professorId);
    const rec = data.grades[d.id]?.[student.id] || { scores: {}, recovery: null, absences: 0 };
    const res = computeResult(d, rec);
    return { discipline: d, professor: prof, rec, res };
  });

  // Trabalhos do aluno
  const assignments = data.assignments.map(a => {
    const disc = data.disciplines.find(d => d.id === a.disciplineId);
    const sub = a.submissions.find(s => s.studentId === student.id);
    const evalItem = disc?.evaluations.find(e => e.id === a.evaluationId);
    return { ...a, discipline: disc, submission: sub || null, evalItem };
  });

  const pendingAssignments = assignments.filter(a => !a.submission);

  const nav = [
    { id: 'boletim', label: 'Boletim oficial', icon: Award },
    { id: 'trabalhos', label: 'Trabalhos', icon: FileText, count: pendingAssignments.length },
    { id: 'aulas', label: 'Aulas e materiais', icon: Video },
    { id: 'avisos', label: 'Mural de avisos', icon: Bell },
  ];

  return (
    <Layout nav={nav} page={page} onNavigate={setPage} roleLabel="Aluno">
      {page === 'boletim' && (
        <StudentReportCard 
          student={student} 
          rows={studentRows} 
          period={data.institution.period} 
        />
      )}

      {page === 'trabalhos' && (
        <StudentAssignments 
          assignments={assignments} 
          onOpenSubmit={(a) => setUploadingAssignment(a)} 
        />
      )}

      {page === 'aulas' && (
        <StudentLessons 
          lessons={data.lessons} 
          disciplines={data.disciplines} 
        />
      )}

      {page === 'avisos' && (
        <StudentAnnouncements 
          announcements={data.announcements} 
        />
      )}

      {uploadingAssignment && (
        <UploadWorkModal
          assignment={uploadingAssignment}
          student={student}
          onClose={() => setUploadingAssignment(null)}
          onSubmit={(submission) => {
            submitWork(uploadingAssignment.id, submission);
            setUploadingAssignment(null);
          }}
        />
      )}
    </Layout>
  );
}

function StudentReportCard({ student, rows, period }) {
  const finals = rows.map(r => r.res.final).filter(isNum);
  const overallAvg = finals.length ? (finals.reduce((a, b) => a + b, 0) / finals.length).toFixed(1).replace('.', ',') : '—';
  const inRecovery = rows.filter(r => r.res.needsRecovery).length;

  return (
    <>
      <PageHeader
        title="Boletim Acadêmico"
        subtitle={`${student.course} · Matrícula ${student.enrollment} · Período ${period}`}
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir boletim
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs text-stone-500 dark:text-stone-400">Pontuação Média Acumulada</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{overallAvg} <span className="text-sm font-normal text-stone-400">/ 10,0</span></p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Média das somas das disciplinas</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-stone-500 dark:text-stone-400">Disciplinas Cursadas</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{rows.length}</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Neste período letivo</p>
        </Card>
        <Card className="p-5 col-span-2 sm:col-span-1">
          <p className="text-xs text-stone-500 dark:text-stone-400">Em Recuperação</p>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${inRecovery ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-stone-50'}`}>
            {inRecovery}
          </p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            {inRecovery ? 'Soma < 7,0 em alguma matéria' : 'Todas as somas &ge; 7,0 pts'}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {rows.map(({ discipline, professor, rec, res }) => {
          const totalPoints = pointsTotal(discipline.evaluations);
          return (
            <Card key={discipline.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{discipline.code}</span>
                    <span className="text-xs text-stone-400">· {discipline.workload}h</span>
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 mt-0.5">{discipline.name}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Docente: {personName(professor)} · {discipline.schedule}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 dark:text-stone-500 block">Nota Somada</span>
                    <span className={`text-xl font-bold tabular-nums ${
                      res.final >= 7.0 
                        ? 'text-stone-900 dark:text-stone-50' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {fmtGrade(res.final)}
                      <span className="text-xs font-normal text-stone-400"> / {totalPoints.toFixed(1).replace('.', ',')} pts</span>
                    </span>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
              </div>

              {/* Critérios dinâmicos da matéria com pontos máximos */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-center text-xs">
                {discipline.evaluations.map(e => (
                  <div key={e.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                    <span className="text-stone-400 dark:text-stone-500 block truncate" title={e.name}>{e.name}</span>
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-100 my-0.5 block">
                      {fmtGrade(rec.scores[e.id])}
                    </span>
                    <span className="text-[10px] text-stone-400">vale até {Number(e.maxPoints).toFixed(1).replace('.', ',')} pts</span>
                  </div>
                ))}

                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-stone-400 dark:text-stone-500 block">Recuperação</span>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 my-0.5 block">
                    {fmtGrade(rec.recovery)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {res.recoveryApplied ? 'Aplicada na soma' : 'se soma < 7,0'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-stone-400 dark:text-stone-500 block">Faltas</span>
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-100 my-0.5 block">
                    {rec.absences}
                  </span>
                  <span className="text-[10px] text-stone-400">Máx. {discipline.maxAbsences}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
                <span>Composição: {describeFormula(discipline.evaluations)}</span>
                <span className="font-medium text-stone-600 dark:text-stone-300">
                  Nota mínima somada para aprovação: {fmtGrade(discipline.passingGrade)} pontos
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function StudentAssignments({ assignments, onOpenSubmit }) {
  const [filter, setFilter] = useState('todos');

  const pending = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission);
  const visible = filter === 'pendentes' ? pending : filter === 'entregues' ? submitted : assignments;

  return (
    <>
      <PageHeader
        title="Trabalhos e Atividades"
        subtitle="Envie seus ensaios, exegeses e fichamentos teológicos e acompanhe a pontuação atribuída pelo professor."
      />

      <div className="mb-6">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: 'todos', label: 'Todos', count: assignments.length },
            { id: 'pendentes', label: 'Pendentes', count: pending.length },
            { id: 'entregues', label: 'Entregues', count: submitted.length },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="Nenhuma atividade neste filtro" />
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map(a => {
            const sub = a.submission;
            const maxPts = a.evalItem?.maxPoints ? Number(a.evalItem.maxPoints).toFixed(1).replace('.', ',') : null;
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{a.discipline?.code}</span>
                      <span className="text-xs text-stone-400">· {a.discipline?.name}</span>
                    </div>
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 mt-0.5">{a.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Prazo final: <strong>{fmtDate(a.dueDate)}</strong>
                      {isPast(a.dueDate) && !sub && <span className="text-rose-500">(prazo expirado)</span>}
                    </p>
                  </div>

                  <div>
                    {sub ? (
                      sub.grade !== null ? (
                        <div className="text-right">
                          <span className="text-xs text-stone-400 block">Pontos Obtidos</span>
                          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                            {fmtGrade(sub.grade)} {maxPts && <span className="text-xs font-normal text-stone-400">/ {maxPts} pts</span>}
                          </span>
                        </div>
                      ) : (
                        <Badge tone="amber">Aguardando correção</Badge>
                      )
                    ) : (
                      <Badge tone="red">Pendente de envio</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
                  {a.description}
                </p>

                {sub ? (
                  <div className="mt-4 space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-xs text-stone-600 dark:text-stone-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <div>
                          <span className="font-medium text-stone-800 dark:text-stone-100">{sub.fileName}</span>
                          <span className="text-stone-400 block text-[11px]">Enviado em {fmtDateTime(sub.submittedAt)} · {sub.fileSize}</span>
                        </div>
                      </div>
                      <Badge tone="green">Arquivo entregue</Badge>
                    </div>

                    {sub.feedback && (
                      <div className="p-3.5 rounded-xl bg-brand-50/60 dark:bg-brand-900/20 border border-brand-200/50 dark:border-brand-800/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 dark:text-brand-200">
                          <MessageSquare className="h-3.5 w-3.5" /> Parecer do Professor:
                        </div>
                        <p className="text-xs text-stone-700 dark:text-stone-300 italic pl-5">
                          "{sub.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => onOpenSubmit(a)}>
                      <Upload className="h-4 w-4" /> Enviar trabalho
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function UploadWorkModal({ assignment, student, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const simulateSelect = () => {
    setFile({
      name: `Exegese_${student.name.split(' ')[0]}_${assignment.title.slice(0, 15).replace(/\s+/g, '_')}.pdf`,
      size: '2,1 MB'
    });
  };

  const handleConfirm = () => {
    if (!file) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        studentId: student.id,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
      });
      setSubmitting(false);
    }, 600);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Enviar trabalho"
      description={`${assignment.discipline?.name} · ${assignment.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={!file || submitting} onClick={handleConfirm}>
            {submitting ? 'Enviando...' : 'Confirmar entrega'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-xs text-stone-500 space-y-1 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          <p>Prazo de entrega: <strong className="text-stone-800 dark:text-stone-100">{fmtDate(assignment.dueDate)}</strong></p>
          <p>Formatos aceitos: PDF ou DOCX (até 25 MB)</p>
        </div>

        <div
          onClick={simulateSelect}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            file 
              ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-900/20' 
              : 'border-stone-300 dark:border-stone-700 hover:border-brand-400'
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{file.name}</p>
                <p className="text-xs text-stone-400">{file.size} · Pronto para envio</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-stone-400" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Clique para selecionar seu arquivo acadêmico
              </p>
              <p className="text-xs text-stone-400">(Simulação: clica para anexar o PDF formatado)</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function StudentLessons({ lessons, disciplines }) {
  return (
    <>
      <PageHeader
        title="Salas de Aula e Materiais"
        subtitle="Assista às videoaulas gravadas, acesse as transmissões ao vivo e baixe as apostilas de estudo."
      />
      <LessonList lessons={lessons} showDiscipline disciplines={disciplines} />
    </>
  );
}

function StudentAnnouncements({ announcements }) {
  return (
    <>
      <PageHeader
        title="Mural de Avisos Acadêmicos"
        subtitle="Comunicados oficiais da direção e secretaria do Seminário Teológico Aliança."
      />
      <div className="space-y-4">
        {announcements.map(ann => (
          <Card key={ann.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{ann.author}</span>
              <span className="text-xs text-stone-400">{fmtDate(ann.date)}</span>
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{ann.title}</h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{ann.content}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
