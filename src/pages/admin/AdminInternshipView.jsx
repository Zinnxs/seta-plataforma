import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  FileText,
  ExternalLink,
  Sparkles,
  Building2,
  UserCheck,
  Calendar,
  Save,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Tabs,
  Modal,
  Field,
  Input,
  Select,
  Textarea,
  EmptyState,
  Avatar,
  cn,
} from '../../components/ui';
import { useStore } from '../../lib/store';
import { INTERNSHIP_CATEGORIES, internshipCategoryLabel } from '../../data/seed';
import { fmtDate } from '../../lib/format';
import { formatRealDuration, fmtHours } from '../student/StudentInternshipView';

export function AdminInternshipView() {
  const {
    data,
    updateInternshipConfig,
    setStudentInternshipTarget,
    addAdminInternship,
    reviewInternship,
    deleteInternship,
  } = useStore();

  const [mainTab, setMainTab] = useState('registros'); // 'registros' | 'alunos'
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'em_analise' | 'aprovado' | 'rejeitado'
  const [studentFilterId, setStudentFilterId] = useState('todos');

  const config = data.internshipConfig || { defaultTargetHours: 100, studentTargets: {} };
  const [globalTargetInput, setGlobalTargetInput] = useState(String(config.defaultTargetHours || 100));
  const [savedGlobalMsg, setSavedGlobalMsg] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [preselectStudentId, setPreselectStudentId] = useState('');
  const [reviewingItem, setReviewingItem] = useState(null);

  const students = data.students || [];
  const internships = data.internships || [];

  const getStudentTarget = (studentId) => {
    const custom = config.studentTargets?.[studentId];
    return custom !== undefined && custom !== null ? Number(custom) : Number(config.defaultTargetHours) || 100;
  };

  const getStudentSummary = (studentId) => {
    const target = getStudentTarget(studentId);
    const list = internships.filter((i) => i.studentId === studentId);
    const approved =
      Math.round(
        list
          .filter((i) => i.status === 'aprovado')
          .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
      ) / 100;
    const pending =
      Math.round(
        list
          .filter((i) => i.status === 'em_analise')
          .reduce((sum, i) => sum + Number(i.requestedHours ?? 0), 0) * 100
      ) / 100;
    const remaining = Math.max(0, Math.round((target - approved) * 100) / 100);
    const pct = target > 0 ? Math.min(100, Math.round((approved / target) * 100)) : 100;
    return { target, approved, pending, remaining, pct, list };
  };

  const pendingList = internships.filter((i) => i.status === 'em_analise');
  const totalApprovedHours =
    Math.round(
      internships
        .filter((i) => i.status === 'aprovado')
        .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
    ) / 100;

  const completedStudentsCount = students.filter((s) => getStudentSummary(s.id).remaining === 0).length;

  const filteredInternships = internships.filter((item) => {
    if (statusFilter !== 'todos' && item.status !== statusFilter) return false;
    if (studentFilterId !== 'todos' && item.studentId !== studentFilterId) return false;
    return true;
  });

  const handleSaveGlobalTarget = () => {
    const num = Number(globalTargetInput);
    if (!num || num <= 0) return;
    updateInternshipConfig({ defaultTargetHours: num });
    setSavedGlobalMsg(true);
    setTimeout(() => setSavedGlobalMsg(false), 2500);
  };

  const openDirectAdd = (studentId = '') => {
    setPreselectStudentId(studentId || students[0]?.id || '');
    setAddModalOpen(true);
  };

  const quickApprove = (item) => {
    reviewInternship(item.id, {
      status: 'aprovado',
      approvedHours: Number(item.approvedHours ?? item.requestedHours ?? 0),
      reviewNotes: item.reviewNotes || 'Horas aprovadas e homologadas pela Direção Geral.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão e Aprovação de Horas de Estágio"
        subtitle="Aprove atividades enviadas pelos alunos, lance horas diretamente (com cálculo automático em dobro 2×) e configure a meta exigida."
        actions={
          <Button onClick={() => openDirectAdd('')}>
            <Plus className="h-4 w-4" /> Lançar Horas Direto para Aluno
          </Button>
        }
      />

      {/* Banner Institucional: Regra do Dobro de Horas SETA (2x) */}
      <div className="rounded-xl border border-[#B48636]/30 bg-[#B48636]/10 dark:border-[#E0A94E]/30 dark:bg-[#E0A94E]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#B48636]/20 text-[#9E6C1B] dark:bg-[#E0A94E]/20 dark:text-[#E0A94E] flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-xs sm:text-sm text-[#1D1B18] dark:text-[#EDEDE8]">
            <strong className="font-semibold text-[#9E6C1B] dark:text-[#E0A94E]">
              Regra Acadêmica SETA — Contagem em Dobro (2×):
            </strong>{' '}
            O sistema converte automaticamente o tempo real da atividade pelo fator <strong>2×</strong> (ex.:{' '}
            <strong>30 min reais = 1h de estágio</strong>). A Direção também pode ajustar manualmente as horas validadas.
          </div>
        </div>
        <span className="self-start sm:self-center shrink-0 rounded-md bg-white/80 dark:bg-[#1B1C22] border border-[#B48636]/30 dark:border-[#E0A94E]/30 px-2.5 py-1 text-[11px] font-mono font-semibold text-[#9E6C1B] dark:text-[#E0A94E]">
          Fator 2,0× Ativo
        </span>
      </div>

      {/* 3 Cards de Resumo da Direção + Configuração da Meta Global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Aguardando Aprovação
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-[#9E6C1B] dark:text-[#E0A94E] tabular-nums">
            {pendingList.length}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Solicitações de estágio enviadas por alunos
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Alunos com Estágio Concluído
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {completedStudentsCount} / {students.length}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Total acumulado na instituição: <strong>{fmtHours(totalApprovedHours)}</strong> aprovadas
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Meta Global Padrão do Curso
          </span>
          <div className="my-2 flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="1000"
              step="5"
              value={globalTargetInput}
              onChange={(e) => setGlobalTargetInput(e.target.value)}
              className="w-24 font-serif text-lg font-bold"
            />
            <span className="text-xs font-semibold text-[#6E6A63] dark:text-[#9E9C96]">horas</span>
            <Button size="sm" variant="secondary" onClick={handleSaveGlobalTarget}>
              <Save className="h-3.5 w-3.5" /> {savedGlobalMsg ? 'Salvo!' : 'Salvar'}
            </Button>
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Aplicada a todos os alunos sem meta individual
          </p>
        </Card>
      </div>

      {/* Navegação Interna da Direção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs
          value={mainTab}
          onChange={setMainTab}
          tabs={[
            { id: 'registros', label: 'Fila de Aprovação & Histórico', count: internships.length },
            { id: 'alunos', label: 'Progresso e Meta por Aluno', count: students.length },
          ]}
        />

        {mainTab === 'registros' && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={studentFilterId}
              onChange={(e) => setStudentFilterId(e.target.value)}
              className="w-48 text-xs h-8"
            >
              <option value="todos">Todos os alunos ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.enrollment})
                </option>
              ))}
            </Select>

            <Tabs
              value={statusFilter}
              onChange={setStatusFilter}
              tabs={[
                { id: 'todos', label: 'Todos' },
                { id: 'em_analise', label: 'Em análise', count: pendingList.length },
                { id: 'aprovado', label: 'Aprovados' },
                { id: 'rejeitado', label: 'Recusados' },
              ]}
            />
          </div>
        )}
      </div>

      {/* ABA 1: FILA DE APROVAÇÃO E HISTÓRICO DE REGISTROS */}
      {mainTab === 'registros' && (
        <div className="space-y-3">
          {filteredInternships.length === 0 ? (
            <Card>
              <EmptyState
                icon={Clock}
                title="Nenhum registro de estágio encontrado"
                text="Você pode clicar em 'Lançar Horas Direto para Aluno' no topo para registrar horas aprovadas ou aguardar os envios dos alunos."
              />
            </Card>
          ) : (
            filteredInternships.map((item) => {
              const st = students.find((s) => s.id === item.studentId);
              const effectiveHours =
                item.status === 'aprovado'
                  ? Number(item.approvedHours ?? item.requestedHours ?? 0)
                  : Number(item.requestedHours ?? 0);
              const realDurationStr = formatRealDuration(item.realDurationMinutes, effectiveHours);

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'p-5 space-y-3',
                    item.status === 'em_analise' && 'border-l-4 border-l-[#B48636] dark:border-l-[#E0A94E]'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#9E6C1B] dark:text-[#E0A94E]">
                          {st ? `${st.name} (${st.enrollment})` : 'Aluno'}
                        </span>
                        <Badge tone="blue" className="font-mono text-[11px]">
                          {internshipCategoryLabel(item.category)}
                        </Badge>
                        {item.status === 'aprovado' && (
                          <Badge tone="green" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Aprovado ({fmtHours(effectiveHours)})
                          </Badge>
                        )}
                        {item.status === 'em_analise' && (
                          <Badge tone="amber" className="gap-1">
                            <Clock className="h-3 w-3" /> Aguardando Aprovação ({fmtHours(effectiveHours)} em dobro · Real: {realDurationStr})
                          </Badge>
                        )}
                        {item.status === 'rejeitado' && (
                          <Badge tone="red" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Recusado
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{item.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.status === 'em_analise' && (
                        <Button size="sm" onClick={() => quickApprove(item)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar {fmtHours(effectiveHours)}
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => setReviewingItem(item)}>
                        <Edit3 className="h-3.5 w-3.5" /> Avaliar / Ajustar Horas
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteInternship(item.id)}
                        title="Excluir registro de estágio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#6E6A63] dark:text-[#9E9C96]">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#9E6C1B] dark:text-[#E0A94E]" />
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Local/Igreja:</strong> {item.location}
                    </span>
                    {item.supervisor && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-[#9E6C1B] dark:text-[#E0A94E]" />
                        <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Supervisor:</strong> {item.supervisor}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#9E6C1B] dark:text-[#E0A94E]" />
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Data:</strong> {fmtDate(item.date)}
                    </span>
                    <span className="font-mono text-[11px] text-[#9E6C1B] dark:text-[#E0A94E]">
                      ⏱️ Duração real: <strong>{realDurationStr}</strong> → Contabilizado (2×):{' '}
                      <strong>{fmtHours(effectiveHours)}</strong>
                    </span>
                    {item.fileName && (
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#9E6C1B] dark:text-[#E0A94E]" />
                        <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Anexo:</strong>
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#9E6C1B] dark:hover:text-[#E0A94E] inline-flex items-center gap-1"
                          >
                            {item.fileName} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span>{item.fileName}</span>
                        )}
                      </span>
                    )}
                  </div>

                  {item.studentNotes && (
                    <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Observação do aluno:</strong>{' '}
                      {item.studentNotes}
                    </p>
                  )}

                  {item.reviewNotes && (
                    <div
                      className={cn(
                        'rounded-lg p-3 text-xs border-l-3',
                        item.status === 'rejeitado'
                          ? 'border-l-[#A04E36] bg-[#A04E36]/10 text-[#1D1B18] dark:text-[#EDEDE8]'
                          : 'border-l-[#B48636] bg-stone-100/80 dark:bg-white/[0.04] text-[#6E6A63] dark:text-[#9E9C96]'
                      )}
                    >
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Parecer da Direção:</strong>{' '}
                      {item.reviewNotes}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ABA 2: PROGRESSO E META INDIVIDUAL POR ALUNO */}
      {mainTab === 'alunos' && (
        <Card className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {students.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhum aluno cadastrado"
              text="Cadastre os alunos na aba 'Alunos e Professores' para gerenciar suas horas de estágio."
            />
          ) : (
            students.map((st) => {
              const sum = getStudentSummary(st.id);
              const customVal = config.studentTargets?.[st.id] ?? '';
              const isCompleted = sum.remaining === 0;

              return (
                <div
                  key={st.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Avatar name={st.name} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{st.name}</h4>
                        <span className="font-mono text-xs text-[#6E6A63] dark:text-[#9E9C96]">
                          ({st.enrollment} · Turma {st.year || '2027'})
                        </span>
                        {isCompleted && (
                          <Badge tone="green" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Estágio Concluído
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6E6A63] dark:text-[#9E9C96]">
                        <span>
                          Quantidade Atual:{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400">{fmtHours(sum.approved)}</strong>
                        </span>
                        <span>
                          Quanto Falta:{' '}
                          <strong
                            className={
                              isCompleted
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-[#9E6C1B] dark:text-[#E0A94E]'
                            }
                          >
                            {fmtHours(sum.remaining)}
                          </strong>
                        </span>
                        <span>
                          Meta Exigida: <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">{fmtHours(sum.target)}</strong>
                        </span>
                        {sum.pending > 0 && (
                          <span className="text-[#9E6C1B] dark:text-[#E0A94E] font-semibold">
                            • +{fmtHours(sum.pending)} em análise
                          </span>
                        )}
                      </div>

                      <div className="h-2 w-full max-w-md rounded-full bg-stone-200/80 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            isCompleted ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-[#B48636] dark:bg-[#E0A94E]'
                          )}
                          style={{ width: `${sum.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#6E6A63] dark:text-[#9E9C96]">Meta Individual:</span>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        step="5"
                        placeholder={`${config.defaultTargetHours || 100}h (padrão)`}
                        value={customVal}
                        onChange={(e) => setStudentInternshipTarget(st.id, e.target.value)}
                        className="w-32 h-8 text-xs"
                        title="Deixe em branco para usar a meta global padrão"
                      />
                    </div>

                    <Button size="sm" variant="secondary" onClick={() => openDirectAdd(st.id)}>
                      <Plus className="h-3.5 w-3.5" /> Lançar Horas
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setStudentFilterId(st.id);
                        setMainTab('registros');
                      }}
                    >
                      Ver Registros ({sum.list.length})
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {addModalOpen && (
        <AdminDirectAddInternshipModal
          students={students}
          initialStudentId={preselectStudentId}
          onClose={() => setAddModalOpen(false)}
          onAdd={addAdminInternship}
        />
      )}

      {reviewingItem && (
        <AdminReviewInternshipModal
          item={reviewingItem}
          student={students.find((s) => s.id === reviewingItem.studentId)}
          onClose={() => setReviewingItem(null)}
          onSave={(patch) => {
            reviewInternship(reviewingItem.id, patch);
            setReviewingItem(null);
          }}
        />
      )}
    </div>
  );
}

function AdminDirectAddInternshipModal({ students, initialStudentId, onClose, onAdd }) {
  const [studentId, setStudentId] = useState(initialStudentId || students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pregacao');
  const [durationVal, setDurationVal] = useState('30');
  const [durationUnit, setDurationUnit] = useState('min');
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reviewNotes, setReviewNotes] = useState(
    'Horas lançadas e homologadas diretamente pela Direção Geral (regra 2×).'
  );

  const numVal = Number(durationVal) || 0;
  const realMinutes = durationUnit === 'min' ? Math.round(numVal) : Math.round(numVal * 60);
  const countedHours = Math.round((realMinutes / 60) * 2 * 100) / 100;

  const applyPreset = (val, unit) => {
    setDurationVal(String(val));
    setDurationUnit(unit);
  };

  const valid = studentId && title.trim() && location.trim() && date && realMinutes > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onAdd({
      studentId,
      title,
      category,
      location,
      supervisor,
      date,
      realDurationMinutes: realMinutes,
      approvedHours: countedHours,
      reviewNotes,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Lançar Horas de Estágio (Direção)"
      description="O lançamento feito pela Direção entra imediatamente como Aprovado e atualiza a quantidade atual e quanto falta na aba do aluno."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid} onClick={handleSubmit}>
            Lançar e Aprovar ({fmtHours(countedHours)})
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Selecione o Aluno *">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
            {students.length === 0 && <option value="">Nenhum aluno cadastrado</option>}
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.enrollment} · Turma {s.year || '2027'})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Título / Descrição da Atividade *">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Pregação Dominical ou Estágio Supervisionado em EBD"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria Ministerial *">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {INTERNSHIP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Duração Real da Atividade *">
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="600"
                step="0.5"
                value={durationVal}
                onChange={(e) => setDurationVal(e.target.value)}
                required
              />
              <Select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="w-32 shrink-0"
              >
                <option value="min">Minutos</option>
                <option value="h">Horas</option>
              </Select>
            </div>
          </Field>
        </div>

        {/* Caixa de Cálculo Automático 2x */}
        <div className="rounded-xl border border-[#B48636]/35 bg-[#B48636]/10 dark:border-[#E0A94E]/35 dark:bg-[#E0A94E]/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="block font-semibold text-[#9E6C1B] dark:text-[#E0A94E]">
              ⚡ Regra do Dobro de Horas SETA (2×)
            </strong>
            <span className="text-[#6E6A63] dark:text-[#9E9C96]">
              Duração real: <strong>{formatRealDuration(realMinutes)}</strong> × 2 ={' '}
              <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">
                {fmtHours(countedHours)} aprovadas no estágio
              </strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset(30, 'min')}
              className="px-2 py-1 rounded-md text-[11px] font-medium border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#1B1C22] hover:border-[#B48636] cursor-pointer"
            >
              30m → 1h
            </button>
            <button
              type="button"
              onClick={() => applyPreset(45, 'min')}
              className="px-2 py-1 rounded-md text-[11px] font-medium border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#1B1C22] hover:border-[#B48636] cursor-pointer"
            >
              45m → 1,5h
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1, 'h')}
              className="px-2 py-1 rounded-md text-[11px] font-medium border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#1B1C22] hover:border-[#B48636] cursor-pointer"
            >
              1h → 2h
            </button>
            <button
              type="button"
              onClick={() => applyPreset(3, 'h')}
              className="px-2 py-1 rounded-md text-[11px] font-medium border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#1B1C22] hover:border-[#B48636] cursor-pointer"
            >
              3h → 6h
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Local / Igreja *">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Comunidade Aliança — Volta Redonda"
              required
            />
          </Field>

          <Field label="Supervisor / Pastor Responsável">
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Ex.: Pr. Ricardo Almeida"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data *">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>

          <Field label="Parecer / Observação da Direção">
            <Input
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Ex.: Relatório homologado pela coordenação."
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function AdminReviewInternshipModal({ item, student, onClose, onSave }) {
  const [title, setTitle] = useState(item.title || '');
  const [category, setCategory] = useState(item.category || 'pregacao');
  const [status, setStatus] = useState(item.status || 'aprovado');
  const [approvedHours, setApprovedHours] = useState(
    String(item.approvedHours ?? item.requestedHours ?? 1)
  );
  const [location, setLocation] = useState(item.location || '');
  const [supervisor, setSupervisor] = useState(item.supervisor || '');
  const [reviewNotes, setReviewNotes] = useState(item.reviewNotes || '');

  const realDurationStr = formatRealDuration(item.realDurationMinutes, item.requestedHours);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      category,
      status,
      approvedHours: Number(approvedHours) || 0,
      location: location.trim(),
      supervisor: supervisor.trim(),
      reviewNotes: reviewNotes.trim(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Avaliar / Ajustar Registro de Estágio"
      description={`${student ? `${student.name} (${student.enrollment})` : 'Aluno'} · Duração real informada: ${realDurationStr} (Solicitado 2×: ${fmtHours(item.requestedHours)})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Decisão</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título da Atividade *">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Decisão da Direção *">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="aprovado">✅ Aprovado (Soma nas horas concluídas)</option>
              <option value="em_analise">⏳ Em análise (Aguardando)</option>
              <option value="rejeitado">❌ Recusado / Solicitar correção</option>
            </Select>
          </Field>

          <Field
            label="Horas Contabilizadas (Validadas 2×) *"
            hint={`Duração real informada: ${realDurationStr}`}
          >
            <Input
              type="number"
              min="0"
              max="500"
              step="0.5"
              value={approvedHours}
              onChange={(e) => setApprovedHours(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Categoria Ministerial">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {INTERNSHIP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Local / Igreja">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </Field>

          <Field label="Supervisor / Pastor">
            <Input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
          </Field>
        </div>

        <Field label="Parecer da Direção / Motivo (visível para o aluno)">
          <Textarea
            rows={2}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Ex.: Horas homologadas conforme ficha assinada pelo pastor supervisor."
          />
        </Field>
      </form>
    </Modal>
  );
}
