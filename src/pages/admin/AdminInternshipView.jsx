import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
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
import { fmtHours } from '../student/StudentInternshipView';

export function formatRealDuration(realMinutes, fallbackCountedHours = 0) {
  const mins = Number(realMinutes) > 0 ? Number(realMinutes) : Math.round((Number(fallbackCountedHours) / 2) * 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const h = Math.floor(mins / 60);
  const rem = Math.round(mins % 60);
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function AdminInternshipView() {
  const {
    data,
    updateInternshipConfig,
    setStudentInternshipTarget,
    addAdminInternship,
    reviewInternship,
    deleteInternship,
  } = useStore();

  const [mainTab, setMainTab] = useState('alunos'); // 'alunos' | 'registros'
  const [studentFilterId, setStudentFilterId] = useState('todos');

  const config = data.internshipConfig || { defaultTargetHours: 100, studentTargets: {} };
  const [globalTargetInput, setGlobalTargetInput] = useState(String(config.defaultTargetHours || 100));
  const [savedGlobalMsg, setSavedGlobalMsg] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [preselectStudentId, setPreselectStudentId] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const students = data.students || [];
  const internships = data.internships || [];

  const getStudentTarget = (studentId) => {
    const custom = config.studentTargets?.[studentId];
    return custom !== undefined && custom !== null ? Number(custom) : Number(config.defaultTargetHours) || 100;
  };

  const getStudentSummary = (studentId) => {
    const target = getStudentTarget(studentId);
    const list = internships.filter((i) => i.studentId === studentId && i.status !== 'rejeitado');
    const approved =
      Math.round(
        list.reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
      ) / 100;
    const remaining = Math.max(0, Math.round((target - approved) * 100) / 100);
    const pct = target > 0 ? Math.min(100, Math.round((approved / target) * 100)) : 100;
    return { target, approved, remaining, pct, list };
  };

  const totalApprovedHours =
    Math.round(
      internships
        .filter((i) => i.status !== 'rejeitado')
        .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
    ) / 100;

  const completedStudentsCount = students.filter((s) => getStudentSummary(s.id).remaining === 0).length;

  const filteredInternships = internships.filter((item) => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lançamento e Gestão de Horas de Estágio"
        subtitle="Lance as horas de estágio dos alunos após conferência do documento oficial assinado e acompanhe o progresso da turma."
        actions={
          <Button onClick={() => openDirectAdd('')}>
            <Plus className="h-4 w-4" /> Lançar Horas de Estágio
          </Button>
        }
      />

      {/* 3 Cards de Resumo da Direção + Configuração da Meta Global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Alunos com Estágio Concluído
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {completedStudentsCount} / {students.length}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Alunos que atingiram 100% da carga horária
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Total de Estágios Lançados
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-[#9E6C1B] dark:text-[#E0A94E] tabular-nums">
            {internships.length}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            Soma total acumulada: <strong>{fmtHours(totalApprovedHours)}</strong>
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
            { id: 'alunos', label: 'Progresso por Aluno', count: students.length },
            { id: 'registros', label: 'Histórico de Estágios Lançados', count: internships.length },
          ]}
        />

        {mainTab === 'registros' && (
          <div className="w-full sm:w-64">
            <Select
              value={studentFilterId}
              onChange={(e) => setStudentFilterId(e.target.value)}
              className="text-xs h-9"
            >
              <option value="todos">Filtrar: Todos os alunos ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.enrollment})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* ABA 1: PROGRESSO E META INDIVIDUAL POR ALUNO */}
      {mainTab === 'alunos' && (
        <Card className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {students.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhum aluno cadastrado"
              text="Cadastre os alunos na aba 'Alunos e Professores' para lançar suas horas de estágio."
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
                      <span className="text-[#6E6A63] dark:text-[#9E9C96] whitespace-nowrap">Meta Individual:</span>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        step="5"
                        placeholder={`${config.defaultTargetHours || 100}h`}
                        value={customVal}
                        onChange={(e) => setStudentInternshipTarget(st.id, e.target.value)}
                        className="w-24 h-8 text-xs"
                        title="Deixe em branco para usar a meta global padrão"
                      />
                    </div>

                    <Button size="sm" onClick={() => openDirectAdd(st.id)}>
                      <Plus className="h-3.5 w-3.5" /> Lançar Horas
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setStudentFilterId(st.id);
                        setMainTab('registros');
                      }}
                    >
                      Ver Estágios ({sum.list.length})
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {/* ABA 2: HISTÓRICO DE ESTÁGIOS LANÇADOS */}
      {mainTab === 'registros' && (
        <div className="space-y-3">
          {filteredInternships.length === 0 ? (
            <Card>
              <EmptyState
                icon={Clock}
                title="Nenhum estágio lançado"
                text="Clique em 'Lançar Horas de Estágio' no topo para registrar uma atividade prática de um aluno."
              />
            </Card>
          ) : (
            filteredInternships.map((item) => {
              const st = students.find((s) => s.id === item.studentId);
              const hours = Number(item.approvedHours ?? item.requestedHours ?? 0);

              return (
                <Card key={item.id} className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#9E6C1B] dark:text-[#E0A94E]">
                          {st ? `${st.name} (${st.enrollment})` : 'Aluno'}
                        </span>
                        <Badge tone="blue" className="font-mono text-[11px]">
                          {internshipCategoryLabel(item.category)}
                        </Badge>
                        <Badge tone="green" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {fmtHours(hours)} lançadas
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{item.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => setEditingItem(item)}>
                        <Edit3 className="h-3.5 w-3.5" /> Editar
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
                      Duração real: {formatRealDuration(item.realDurationMinutes, hours)} → Contabilizado (2×): {fmtHours(hours)}
                    </span>
                  </div>

                  {item.reviewNotes && (
                    <div className="rounded-lg p-3 text-xs border-l-2 border-l-[#B48636] bg-stone-100/80 dark:bg-white/[0.04] text-[#6E6A63] dark:text-[#9E9C96]">
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Observação:</strong> {item.reviewNotes}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {addModalOpen && (
        <AdminInternshipFormModal
          students={students}
          initialStudentId={preselectStudentId}
          onClose={() => setAddModalOpen(false)}
          onSave={(payload) => {
            addAdminInternship(payload);
            setAddModalOpen(false);
          }}
        />
      )}

      {editingItem && (
        <AdminInternshipFormModal
          students={students}
          existingItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(patch) => {
            reviewInternship(editingItem.id, {
              ...patch,
              status: 'aprovado',
            });
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function AdminInternshipFormModal({ students, initialStudentId, existingItem, onClose, onSave }) {
  const isEditing = Boolean(existingItem);

  // Se estiver editando, recupera a duração real salva (em minutos ou horas)
  const initialRealMins = existingItem
    ? Number(existingItem.realDurationMinutes) ||
      Math.round((Number(existingItem.approvedHours ?? existingItem.requestedHours ?? 1) / 2) * 60)
    : 30;
  const initialUnit = initialRealMins >= 60 && initialRealMins % 60 === 0 ? 'h' : 'min';
  const initialDurationVal =
    initialUnit === 'h' ? String(initialRealMins / 60) : String(initialRealMins);

  const [studentId, setStudentId] = useState(
    existingItem?.studentId || initialStudentId || students[0]?.id || ''
  );
  const [title, setTitle] = useState(existingItem?.title || '');
  const [category, setCategory] = useState(existingItem?.category || 'pregacao');
  const [durationVal, setDurationVal] = useState(isEditing ? initialDurationVal : '30');
  const [durationUnit, setDurationUnit] = useState(isEditing ? initialUnit : 'min'); // 'min' | 'h'
  const [location, setLocation] = useState(existingItem?.location || '');
  const [supervisor, setSupervisor] = useState(existingItem?.supervisor || '');
  const [date, setDate] = useState(existingItem?.date || new Date().toISOString().slice(0, 10));
  const [reviewNotes, setReviewNotes] = useState(existingItem?.reviewNotes || '');

  const rawNum = Number(durationVal) || 0;
  const realDurationMinutes = durationUnit === 'min' ? Math.round(rawNum) : Math.round(rawNum * 60);
  const countedHours = Math.round((realDurationMinutes / 60) * 2 * 100) / 100;

  const valid = studentId && title.trim() && location.trim() && date && realDurationMinutes > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      studentId,
      title: title.trim(),
      category,
      location: location.trim(),
      supervisor: supervisor.trim(),
      date,
      realDurationMinutes,
      requestedHours: countedHours,
      approvedHours: countedHours,
      reviewNotes: reviewNotes.trim(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar Registro de Estágio' : 'Lançar Horas de Estágio'}
      description="Informe a duração real em minutos ou horas. O sistema multiplica automaticamente por 2 (regra do dobro de horas do SETA)."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid} onClick={handleSubmit}>
            {isEditing ? `Salvar (${fmtHours(countedHours)})` : `Lançar ${fmtHours(countedHours)} (2×)`}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditing && (
          <Field label="Aluno *">
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              {students.length === 0 && <option value="">Nenhum aluno cadastrado</option>}
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.enrollment} · Turma {s.year || '2027'})
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Título / Descrição da Atividade *">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Pregação no Culto ou Aula na EBD"
              required
            />
          </Field>

          <Field label="Categoria Ministerial *">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {INTERNSHIP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Duração Real da Atividade *"
            hint={`Contabilizado no estágio (2×): ${fmtHours(countedHours)}`}
          >
            <Input
              type="number"
              min="1"
              max="600"
              step="0.5"
              value={durationVal}
              onChange={(e) => setDurationVal(e.target.value)}
              placeholder="Ex.: 30"
              required
            />
          </Field>

          <Field
            label="Unidade de Tempo *"
            hint={`Tempo real: ${formatRealDuration(realDurationMinutes)} × 2 = ${fmtHours(countedHours)}`}
          >
            <Select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}>
              <option value="min">Minutos (ex: 30 min = 1h)</option>
              <option value="h">Horas (ex: 1h = 2h)</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Local / Igreja *">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Igreja Presbiteriana Central — VR"
              required
            />
          </Field>

          <Field label="Supervisor / Pastor Responsável">
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Ex.: Pr. Marcos Vinícius"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Data de Realização *">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>

          <Field label="Observação (Opcional)">
            <Input
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Ex.: Ficha oficial conferida e assinada."
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
