import React, { useState, useRef } from 'react';
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
  Info,
  Mail,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  FileCheck,
  X
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
  Callout,
  Textarea,
  cn
} from '../../components/ui';
import { LessonList } from '../../components/LessonList';

export function StudentApp() {
  const { data, currentUser, submitWork, uploadAssignmentFile } = useStore();
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
    const prof = data.professors.find(p => p.id === disc?.professorId);
    const sub = a.submissions.find(s => s.studentId === student.id);
    const evalItem = disc?.evaluations.find(e => e.id === a.evaluationId);
    return { ...a, discipline: disc, professor: prof, submission: sub || null, evalItem };
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
        <SubmitWorkModal
          assignment={uploadingAssignment}
          student={student}
          professor={uploadingAssignment.professor}
          onClose={() => setUploadingAssignment(null)}
          onUploadFile={uploadAssignmentFile}
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
  // Inicialmente, seleciona disciplinas em andamento e concluídas (exceto futuras)
  const [selectedDiscIds, setSelectedDiscIds] = useState(() => 
    rows.filter(r => r.discipline.status !== 'futura').map(r => r.discipline.id)
  );

  const activeRows = rows.filter(r => selectedDiscIds.includes(r.discipline.id));
  const finals = activeRows.map(r => r.res.final ?? r.res.sum ?? r.res.total).filter(isNum);
  const overallAvg = finals.length ? (finals.reduce((a, b) => a + Number(b), 0) / finals.length).toFixed(1).replace('.', ',') : '—';
  const inRecovery = activeRows.filter(r => r.res.needsRecovery).length;

  const toggleDiscipline = (id) => {
    setSelectedDiscIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedDiscIds(rows.map(r => r.discipline.id));
  const selectConcluded = () => setSelectedDiscIds(rows.filter(r => (r.discipline.status || (r.discipline.gradesClosed ? 'concluida' : 'em_andamento')) === 'concluida').map(r => r.discipline.id));
  const selectActive = () => setSelectedDiscIds(rows.filter(r => (r.discipline.status || (r.discipline.gradesClosed ? 'concluida' : 'em_andamento')) === 'em_andamento').map(r => r.discipline.id));

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

      {/* Banner Oficial do Aluno */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#060a17] via-[#0b132b] to-[#121e3f] p-5 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/50 bg-[#070d1e] shadow-md">
              <img src="/portal_seta_symbol.png" alt="Portal SETA" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                Portal SETA · Área do Aluno
              </div>
              <h2 className="mt-1 font-serif text-lg font-bold text-white">{student.name}</h2>
              <p className="text-xs text-slate-300">Bacharel em Teologia · Matrícula: <strong>{student.enrollment}</strong></p>
            </div>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-amber-500/20 pt-3 sm:pt-0 sm:pl-5">
            <p className="text-xs font-semibold text-amber-300">Período {period}</p>
            <p className="text-[11px] text-slate-400">Seminário Teológico Aliança</p>
          </div>
        </div>
      </div>

      {/* Seletor de Matérias para o Boletim (Oculto na Impressão) */}
      <Card className="no-print mb-6 p-4 border border-amber-500/20 bg-stone-50/60 dark:bg-stone-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Personalização de Matérias no Boletim
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Escolha quais matérias devem constar no boletim e na impressão oficial ({activeRows.length} de {rows.length} selecionadas):
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 transition font-medium cursor-pointer"
            >
              Todas ({rows.length})
            </button>
            <button
              type="button"
              onClick={selectConcluded}
              className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 transition font-medium cursor-pointer"
            >
              Concluídas
            </button>
            <button
              type="button"
              onClick={selectActive}
              className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 transition font-medium cursor-pointer"
            >
              Em Andamento
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {rows.map(({ discipline }) => {
            const isSelected = selectedDiscIds.includes(discipline.id);
            const st = discipline.status || (discipline.gradesClosed ? 'concluida' : 'em_andamento');
            const stBadge = st === 'concluida' ? '🟢' : st === 'futura' ? '⚪' : '🟡';
            return (
              <button
                key={discipline.id}
                type="button"
                onClick={() => toggleDiscipline(discipline.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer',
                  isSelected
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 text-stone-400 opacity-60 hover:opacity-100'
                )}
              >
                <span>{isSelected ? '✓' : '○'}</span>
                <span>{stBadge}</span>
                <span>{discipline.code} - {discipline.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs text-stone-500 dark:text-stone-400">Pontuação Média Acumulada</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{overallAvg} <span className="text-sm font-normal text-stone-400">/ 10,0</span></p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Média das matérias selecionadas</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-stone-500 dark:text-stone-400">Disciplinas no Boletim</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{activeRows.length}</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">De {rows.length} matriculadas</p>
        </Card>
        <Card className="p-5 col-span-2 sm:col-span-1">
          <p className="text-xs text-stone-500 dark:text-stone-400">Em Recuperação</p>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${inRecovery ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-stone-50'}`}>
            {inRecovery}
          </p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            {inRecovery ? 'Soma < 7,0 nas selecionadas' : 'Todas as somas &ge; 7,0 pts'}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Disciplinas do Boletim</h3>
          <span className="text-xs text-stone-400">Nota mínima para aprovação direta: 7,0 pontos somados</span>
        </div>

        {activeRows.length === 0 ? (
          <Card>
            <EmptyState icon={Award} title="Nenhuma disciplina selecionada" text="Marque uma ou mais disciplinas no quadro acima para visualizá-las no boletim." />
          </Card>
        ) : (
          <div className="space-y-3">
            {activeRows.map(({ discipline, professor, rec, res }) => {
              const maxPossible = pointsTotal(discipline.evaluations);
              return (
                <Card key={discipline.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{discipline.code}</span>
                        <h4 className="text-base font-semibold text-stone-900 dark:text-stone-50">{discipline.name}</h4>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Docente: {personName(professor)} · {discipline.schedule} · Carga: {discipline.workload}h
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Pontos Somados</span>
                        <span className="text-xl font-bold tabular-nums text-stone-900 dark:text-stone-50">
                          {fmtGrade(res.final ?? res.sum ?? res.total)} <span className="text-xs font-normal text-stone-400">/ {maxPossible.toFixed(1).replace('.', ',')}</span>
                        </span>
                      </div>

                      <div>
                        <StatusBadge status={res.status} result={res} />
                      </div>
                    </div>
                  </div>

                  {/* Detalhamento das Avaliações */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {discipline.evaluations.map(ev => {
                      const score = rec.scores[ev.id];
                      return (
                        <div key={ev.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block truncate" title={ev.name}>{ev.name}</span>
                          <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100 mt-0.5 block">
                            {score !== undefined && score !== null ? fmtGrade(score) : '—'} 
                            <span className="text-[11px] font-normal text-stone-400"> / {Number(ev.maxPoints).toFixed(1).replace('.', ',')}</span>
                          </span>
                        </div>
                      );
                    })}

                    {isNum(rec.recovery) && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                        <span className="text-amber-700 dark:text-amber-300 block truncate font-medium">Recuperação</span>
                        <span className="text-sm font-bold tabular-nums text-amber-900 dark:text-amber-100 mt-0.5 block">
                          {fmtGrade(rec.recovery)} <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400"> / 10,0</span>
                        </span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 block">Faltas Registradas</span>
                      <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100 mt-0.5 block">
                        {rec.absences} <span className="text-[11px] font-normal text-stone-400">/ máx {discipline.maxAbsences}</span>
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
        subtitle="Envie seus ensaios, exegeses e fichamentos e acompanhe a pontuação atribuída pelo professor."
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
          <EmptyState icon={FileText} title="Nenhuma atividade neste filtro" text="Suas atividades acadêmicas aparecerão aqui." />
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map(a => {
            const sub = a.submission;
            const maxPts = a.evalItem?.maxPoints ? Number(a.evalItem.maxPoints).toFixed(1).replace('.', ',') : null;
            const expired = isPast(a.dueDate);
            const subType = a.submissionType || 'upload';

            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{a.discipline?.code}</span>
                      <span className="text-xs text-stone-400">· {a.discipline?.name}</span>

                      {subType === 'upload' && (
                        <Badge tone="blue" className="gap-1">
                          <Upload className="h-3 w-3" /> Pela Plataforma (Arquivo)
                        </Badge>
                      )}
                      {subType === 'email' && (
                        <Badge tone="brand" className="gap-1">
                          <Mail className="h-3 w-3" /> Envio por E-mail
                        </Badge>
                      )}
                      {subType === 'custom' && (
                        <Badge tone="neutral" className="gap-1">
                          <MessageSquare className="h-3 w-3" /> Personalizado / WhatsApp
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 mt-1">{a.title}</h3>
                    
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Prazo final: <strong>{fmtDate(a.dueDate)}</strong>
                      {expired && !sub && (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">(Prazo encerrado)</span>
                      )}
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
                    ) : expired ? (
                      <Badge tone="red">Prazo encerrado</Badge>
                    ) : (
                      <Badge tone="amber">Pendente de envio</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
                  {a.description}
                </p>

                {subType === 'email' && a.destinationEmail && (
                  <div className="mt-3 p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-600 shrink-0" />
                    <span>E-mail para envio: <strong>{a.destinationEmail}</strong></span>
                  </div>
                )}

                {subType === 'custom' && a.customInstructions && (
                  <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                    <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Instruções do professor:</strong>
                      <p className="mt-0.5">{a.customInstructions}</p>
                    </div>
                  </div>
                )}

                {sub ? (
                  <div className="mt-4 space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-xs text-stone-600 dark:text-stone-300">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-800 dark:text-stone-100">{sub.fileName || 'Trabalho entregue'}</span>
                          <span className="text-stone-400 block text-[11px]">
                            {sub.fileSize ? `${sub.fileSize} · ` : ''}Entregue em {fmtDateTime(sub.submittedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={sub.fileName}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600 transition"
                          >
                            <Download className="h-3.5 w-3.5" /> Ver meu arquivo
                          </a>
                        )}

                        {/* Permite substituir antes do prazo se o professor ainda não corrigiu */}
                        {!expired && sub.grade === null && (
                          <Button size="sm" variant="secondary" onClick={() => onOpenSubmit(a)}>
                            <RefreshCw className="h-3.5 w-3.5" /> Substituir envio
                          </Button>
                        )}
                      </div>
                    </div>

                    {sub.studentNote && (
                      <div className="text-xs text-stone-500 dark:text-stone-400 px-3">
                        <strong>Minha observação:</strong> <em>"{sub.studentNote}"</em>
                      </div>
                    )}

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
                    {expired ? (
                      <Button disabled variant="secondary" className="cursor-not-allowed opacity-60">
                        Prazo encerrado
                      </Button>
                    ) : (
                      <Button onClick={() => onOpenSubmit(a)}>
                        <Upload className="h-4 w-4" /> Enviar trabalho
                      </Button>
                    )}
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

function SubmitWorkModal({ assignment, student, professor, onClose, onSubmit, onUploadFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const subType = assignment.submissionType || 'upload';
  const destinationEmail = assignment.destinationEmail || professor?.email || 'direcao@seta.com';

  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho (máximo 15MB)
    const MAX_MB = 15;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMessage(`O arquivo selecionado (${(file.size / (1024 * 1024)).toFixed(1)} MB) excede o limite máximo permitido de ${MAX_MB} MB.`);
      return;
    }

    // Validação de formato (PDF, DOC, DOCX, TXT)
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Formato não suportado. Por favor envie arquivos em formato PDF ou Word (.docx / .doc).');
      return;
    }

    setSelectedFile(file);
  };

  const handleConfirmSubmit = async () => {
    setErrorMessage('');
    setUploading(true);

    try {
      if (subType === 'upload') {
        if (!selectedFile) {
          setErrorMessage('Por favor selecione o arquivo para enviar.');
          setUploading(false);
          return;
        }

        // Upload real para o Supabase Storage
        const res = await onUploadFile(selectedFile, assignment.id, student.id);
        if (!res.success) {
          setErrorMessage(res.error || 'Erro ao realizar upload do arquivo.');
          setUploading(false);
          return;
        }

        onSubmit({
          studentId: student.id,
          fileName: res.fileName,
          fileSize: res.fileSize,
          fileUrl: res.fileUrl,
          submissionType: 'upload',
          studentNote: note.trim() || null,
          submittedAt: new Date().toISOString(),
        });
      } else if (subType === 'email') {
        onSubmit({
          studentId: student.id,
          fileName: 'Trabalho enviado por e-mail',
          fileSize: null,
          fileUrl: null,
          submissionType: 'email',
          studentNote: note.trim() || null,
          submittedAt: new Date().toISOString(),
        });
      } else if (subType === 'custom') {
        onSubmit({
          studentId: student.id,
          fileName: 'Trabalho entregue conforme instruções',
          fileSize: null,
          fileUrl: null,
          submissionType: 'custom',
          studentNote: note.trim() || null,
          submittedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Falha ao enviar:', err);
      setErrorMessage('Ocorreu uma falha ao registrar o envio. Tente novamente.');
      setUploading(false);
    }
  };

  const mailtoSubject = encodeURIComponent(`[SETA] Trabalho: ${assignment.title} - ${student.name}`);
  const mailtoBody = encodeURIComponent(
    `Prezado(a) Professor(a),\n\nEstou enviando em anexo meu trabalho referente à atividade "${assignment.title}".\n\nDisciplina: ${assignment.discipline?.name}\nAluno: ${student.name}\nMatrícula: ${student.enrollment}\nCurso: Bacharel em Teologia\n\nAtenciosamente,\n${student.name}`
  );
  const mailtoHref = `mailto:${destinationEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <Modal
      open
      onClose={onClose}
      title="Entrega de Atividade Acadêmica"
      description={`${assignment.discipline?.name} · ${assignment.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button 
            disabled={uploading || (subType === 'upload' && !selectedFile)} 
            onClick={handleConfirmSubmit}
          >
            {uploading ? 'Enviando...' : 'Confirmar Entrega'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Aviso de Prazo */}
        <div className="text-xs text-stone-500 space-y-1 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          <p>Prazo final: <strong className="text-stone-800 dark:text-stone-100">{fmtDate(assignment.dueDate)}</strong></p>
          <p>Modalidade exigida pelo docente: <strong>{subType === 'upload' ? 'Upload direto de arquivo' : subType === 'email' ? 'Envio por e-mail' : 'Instruções personalizadas'}</strong></p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODALIDADE 1: UPLOAD DE ARQUIVO */}
        {subType === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                selectedFile 
                  ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-900/20' 
                  : 'border-stone-300 dark:border-stone-700 hover:border-brand-400 dark:hover:border-brand-600'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck className="h-8 w-8 text-brand-600 dark:text-brand-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-stone-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Arquivo pronto para envio
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    title="Remover e escolher outro arquivo"
                  >
                    <X className="h-4 w-4 text-stone-400" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <Upload className="h-8 w-8 mx-auto text-brand-600 dark:text-brand-400" />
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    Clique aqui para selecionar seu arquivo
                  </p>
                  <p className="text-xs text-stone-400">
                    Formatos aceitos: PDF ou Word (.docx / .doc) até 15 MB
                  </p>
                </div>
              )}
            </div>

            <Field label="Observação para o professor (opcional)">
              <Input
                placeholder="Ex.: Trabalho individual conforme as orientações de exegese."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* MODALIDADE 2: ENVIO POR E-MAIL */}
        {subType === 'email' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 space-y-2 text-xs">
              <strong className="block font-semibold text-brand-900 dark:text-brand-200 text-sm">
                Envie o trabalho para o e-mail:
              </strong>
              <div className="font-mono text-base font-bold text-brand-700 dark:text-brand-300 bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-brand-200 dark:border-brand-800 select-all">
                {destinationEmail}
              </div>
              <p className="text-stone-600 dark:text-stone-400">
                Você pode clicar no botão abaixo para abrir seu e-mail com o assunto e corpo da mensagem já formatados com seus dados acadêmicos:
              </p>
              
              <div className="pt-1">
                <a
                  href={mailtoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition"
                >
                  <Mail className="h-4 w-4" /> Abrir no meu aplicativo de e-mail <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <Field label="Confirmação de envio (opcional)" hint="Adicione uma anotação de quando e por qual e-mail você enviou.">
              <Input
                placeholder="Ex.: Enviado pelo meu e-mail pessoal aluno@gmail.com hoje às 14h."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>

            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              * Ao clicar em "Confirmar Entrega", a plataforma registrará para o docente a data e hora do seu aviso.
            </p>
          </div>
        )}

        {/* MODALIDADE 3: PERSONALIZADO */}
        {subType === 'custom' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <strong className="block font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Instruções fornecidas pelo Professor:
              </strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm bg-white dark:bg-stone-900/80 p-3 rounded-lg border border-stone-200 dark:border-stone-700 whitespace-pre-wrap">
                {assignment.customInstructions || 'Entregar diretamente ao professor conforme orientações dadas em aula.'}
              </p>
            </div>

            <Field label="Anotação de entrega (opcional)" hint="Ex.: Enviado pelo WhatsApp ou entregue impresso ao professor.">
              <Input
                placeholder="Ex.: Entregue em mãos no início da aula."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>

            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              * Ao confirmar, o professor verá no diário que você realizou a entrega para lançar a pontuação.
            </p>
          </div>
        )}
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
        subtitle="Comunicados oficiais emitidos pela Direção e Secretaria do Seminário Teológico Aliança."
      />
      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Nenhum comunicado no mural"
            text="Não há avisos recentes publicados pela direção institucional."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md">
                    {ann.author || 'Direção Geral'}
                  </span>
                  {ann.important && (
                    <Badge tone="red" className="gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> Urgente
                    </Badge>
                  )}
                </div>
                <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                  <Calendar className="h-3 w-3" /> {fmtDate(ann.date)}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{ann.title}</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
