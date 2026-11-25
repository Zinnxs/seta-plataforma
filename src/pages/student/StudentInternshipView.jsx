import React, { useState, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Upload,
  FileText,
  ExternalLink,
  X,
  Sparkles,
  Building2,
  UserCheck,
  Calendar,
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
  cn,
} from '../../components/ui';
import { useStore } from '../../lib/store';
import { INTERNSHIP_CATEGORIES, internshipCategoryLabel } from '../../data/seed';
import { fmtDate } from '../../lib/format';

export function formatRealDuration(realMinutes, fallbackCountedHours = 0) {
  const mins = Number(realMinutes) > 0 ? Number(realMinutes) : Math.round((Number(fallbackCountedHours) / 2) * 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const h = Math.floor(mins / 60);
  const rem = Math.round(mins % 60);
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function fmtHours(num) {
  const n = Math.round((Number(num) || 0) * 100) / 100;
  return `${String(n).replace('.', ',')}h`;
}

export function StudentInternshipView({ student }) {
  const { data, submitStudentInternship } = useStore();
  const [filter, setFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);

  const config = data.internshipConfig || { defaultTargetHours: 100, studentTargets: {} };
  const isCustomTarget = config.studentTargets && config.studentTargets[student.id] !== undefined;
  const targetHours = Number(isCustomTarget ? config.studentTargets[student.id] : config.defaultTargetHours) || 100;

  const studentInternships = (data.internships || []).filter((i) => i.studentId === student.id);

  const approvedHours =
    Math.round(
      studentInternships
        .filter((i) => i.status === 'aprovado')
        .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
    ) / 100;

  const pendingHours =
    Math.round(
      studentInternships
        .filter((i) => i.status === 'em_analise')
        .reduce((sum, i) => sum + Number(i.requestedHours ?? 0), 0) * 100
    ) / 100;

  const remainingHours = Math.max(0, Math.round((targetHours - approvedHours) * 100) / 100);
  const pct = targetHours > 0 ? Math.min(100, Math.round((approvedHours / targetHours) * 100)) : 100;
  const isCompleted = remainingHours === 0;

  // Distribuição de horas aprovadas por categoria ministerial
  const categoryBreakdown = INTERNSHIP_CATEGORIES.map((cat) => {
    const hrs =
      Math.round(
        studentInternships
          .filter((i) => i.status === 'aprovado' && i.category === cat.id)
          .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
      ) / 100;
    return { ...cat, hrs };
  });

  const counts = {
    todos: studentInternships.length,
    aprovado: studentInternships.filter((i) => i.status === 'aprovado').length,
    em_analise: studentInternships.filter((i) => i.status === 'em_analise').length,
    rejeitado: studentInternships.filter((i) => i.status === 'rejeitado').length,
  };

  const visibleList =
    filter === 'todos' ? studentInternships : studentInternships.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horas de Estágio Supervisionado"
        subtitle={`${student.course || 'Bacharel em Teologia'} · Matrícula ${student.enrollment || '—'} · Turma ${student.year || '2027'}`}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar Atividade de Estágio
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
            Toda atividade prática contabiliza o <strong>dobro do tempo real</strong> realizado (ex.: uma pregação de{' '}
            <strong>30 min</strong> contabiliza <strong>1h de estágio</strong>).
          </div>
        </div>
        <span className="self-start sm:self-center shrink-0 rounded-md bg-white/80 dark:bg-[#1B1C22] border border-[#B48636]/30 dark:border-[#E0A94E]/30 px-2.5 py-1 text-[11px] font-mono font-semibold text-[#9E6C1B] dark:text-[#E0A94E]">
          Fator 2,0× Ativo
        </span>
      </div>

      {/* 3 Cards de Destaque: Quantidade Atual, Quanto Falta e Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Quantidade Atual (Aprovadas)
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {fmtHours(approvedHours)}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96] flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Horas homologadas pela Direção Geral</span>
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Quanto Falta para Concluir
          </span>
          <div
            className={cn(
              'my-2 font-serif text-3xl font-bold tabular-nums',
              isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#9E6C1B] dark:text-[#E0A94E]'
            )}
          >
            {isCompleted ? '0h (Concluído!)' : fmtHours(remainingHours)}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            {isCompleted
              ? 'Carga horária mínima exigida atingida com sucesso!'
              : `Restam ${fmtHours(remainingHours)} para completar a meta`}
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Meta Exigida do Curso
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-[#1D1B18] dark:text-[#EDEDE8] tabular-nums">
            {fmtHours(targetHours)}
          </div>
          <div className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            {pendingHours > 0 ? (
              <Badge tone="amber" className="gap-1">
                <Clock className="h-3 w-3" /> +{fmtHours(pendingHours)} em análise pela Direção
              </Badge>
            ) : (
              <span>{isCustomTarget ? 'Meta individual definida pela Direção' : 'Carga horária padrão do curso'}</span>
            )}
          </div>
        </Card>
      </div>

      {/* Barra de Progresso Geral + Distribuição por Categoria Ministerial */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">
              Progresso Geral do Estágio Supervisionado
            </h2>
            <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96] mt-0.5">
              Você cumpriu <strong>{fmtHours(approvedHours)}</strong> de <strong>{fmtHours(targetHours)}</strong> exigidas ({pct}%).
            </p>
          </div>
          <span
            className={cn(
              'font-mono text-sm font-bold',
              isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#9E6C1B] dark:text-[#E0A94E]'
            )}
          >
            {pct}% CONCLUÍDO
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-stone-200/80 dark:bg-white/[0.07] overflow-hidden border border-black/[0.04] dark:border-white/[0.06]">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isCompleted
                ? 'bg-emerald-600 dark:bg-emerald-500'
                : 'bg-[#B48636] dark:bg-[#E0A94E]'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96] mb-2.5">
            Distribuição das Horas Aprovadas por Categoria Ministerial
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-stone-50/70 dark:bg-white/[0.02] px-3 py-2"
              >
                <span className="text-xs text-[#6E6A63] dark:text-[#9E9C96] truncate">{cat.label}</span>
                <span className="font-mono text-xs font-bold text-[#1D1B18] dark:text-[#EDEDE8] shrink-0">
                  {fmtHours(cat.hrs)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Histórico e Lista de Estágios Realizados */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">
            Histórico de Estágios Realizados
          </h2>
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'todos', label: 'Todos', count: counts.todos },
              { id: 'aprovado', label: 'Aprovados', count: counts.aprovado },
              { id: 'em_analise', label: 'Em análise', count: counts.em_analise },
              { id: 'rejeitado', label: 'Recusados', count: counts.rejeitado },
            ]}
          />
        </div>

        {visibleList.length === 0 ? (
          <Card>
            <EmptyState
              icon={Clock}
              title="Nenhum registro de estágio neste filtro"
              text="Clique em 'Registrar Atividade de Estágio' para enviar uma prática ministerial realizada ou aguarde o lançamento pela Direção."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleList.map((item) => {
              const effectiveHours =
                item.status === 'aprovado'
                  ? Number(item.approvedHours ?? item.requestedHours ?? 0)
                  : Number(item.requestedHours ?? 0);
              const realDurationStr = formatRealDuration(item.realDurationMinutes, effectiveHours);

              return (
                <Card key={item.id} className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="blue" className="font-mono text-[11px]">
                          {internshipCategoryLabel(item.category)}
                        </Badge>
                        {item.status === 'aprovado' && (
                          <Badge tone="green" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Aprovado pela Direção
                          </Badge>
                        )}
                        {item.status === 'em_analise' && (
                          <Badge tone="amber" className="gap-1">
                            <Clock className="h-3 w-3" /> Em análise pela Direção
                          </Badge>
                        )}
                        {item.status === 'rejeitado' && (
                          <Badge tone="red" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Recusado / Revisar
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{item.title}</h3>
                    </div>

                    <div className="self-start sm:text-right rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-stone-50/80 dark:bg-white/[0.03] px-3.5 py-2 shrink-0">
                      <div
                        className={cn(
                          'font-serif text-xl font-bold tabular-nums',
                          item.status === 'aprovado'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-[#1D1B18] dark:text-[#EDEDE8]'
                        )}
                      >
                        {fmtHours(effectiveHours)}
                      </div>
                      <span className="block text-[10px] text-[#6E6A63] dark:text-[#9E9C96]">
                        {item.status === 'aprovado' ? 'Contabilizadas (2×)' : 'Solicitadas (2×)'}
                      </span>
                      <span className="block font-mono text-[10px] font-medium text-[#9E6C1B] dark:text-[#E0A94E] mt-0.5">
                        ⏱️ Real: {realDurationStr}
                      </span>
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
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Resumo da atividade:</strong>{' '}
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
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Parecer da Direção Geral:</strong>{' '}
                      {item.reviewNotes}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <StudentSubmitInternshipModal
          student={student}
          onClose={() => setModalOpen(false)}
          onSubmit={submitStudentInternship}
        />
      )}
    </div>
  );
}

function StudentSubmitInternshipModal({ student, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pregacao');
  const [durationVal, setDurationVal] = useState('30');
  const [durationUnit, setDurationUnit] = useState('min'); // 'min' | 'h'
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentNotes, setStudentNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef(null);

  const numVal = Number(durationVal) || 0;
  const realMinutes = durationUnit === 'min' ? Math.round(numVal) : Math.round(numVal * 60);
  const realHours = realMinutes / 60;
  const countedHours = Math.round(realHours * 2 * 100) / 100;

  const applyPreset = (val, unit) => {
    setDurationVal(String(val));
    setDurationUnit(unit);
  };

  const valid = title.trim() && location.trim() && supervisor.trim() && date && realMinutes > 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    const res = await onSubmit(
      student.id,
      {
        title,
        category,
        location,
        supervisor,
        date,
        realDurationMinutes: realMinutes,
        requestedHours: countedHours,
        studentNotes,
      },
      selectedFile
    );

    setSubmitting(false);
    if (!res?.success) {
      setErrorMsg(res?.error || 'Não foi possível enviar o registro de estágio.');
      return;
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar Atividade de Estágio"
      description="Informe os dados da atividade prática realizada. O sistema aplica automaticamente a regra do dobro de horas (2×) do SETA."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid || submitting} onClick={handleSave}>
            {submitting ? 'Enviando...' : `Enviar (${fmtHours(countedHours)} em dobro)`}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <Field label="Título / Descrição da Atividade *">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Pregação no Culto de Oração ou Aula na EBD"
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
                {fmtHours(countedHours)} contabilizadas no estágio
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
              onClick={() => applyPreset(2, 'h')}
              className="px-2 py-1 rounded-md text-[11px] font-medium border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#1B1C22] hover:border-[#B48636] cursor-pointer"
            >
              2h → 4h
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Local / Igreja *">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Igreja Presbiteriana Central — VR"
              required
            />
          </Field>

          <Field label="Supervisor / Pastor Responsável *">
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Ex.: Pr. Marcos Vinícius"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de Realização *">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>

          <Field label="Comprovante / Relatório (Opcional)">
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.1] dark:border-white/[0.12] px-3 h-9.5 text-xs">
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-stone-400 hover:text-rose-500 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-start text-xs font-normal h-9.5"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" /> Anexar PDF ou Foto (até 15 MB)
              </Button>
            )}
          </Field>
        </div>

        <Field label="Resumo / Observações da Atividade (Opcional)">
          <Textarea
            rows={2}
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
            placeholder="Descreva brevemente o tema ministrado ou atividades realizadas..."
          />
        </Field>
      </form>
    </Modal>
  );
}
