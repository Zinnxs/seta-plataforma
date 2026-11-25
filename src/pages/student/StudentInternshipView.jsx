import React from 'react';
import {
  Clock,
  CheckCircle2,
  Building2,
  UserCheck,
  Calendar,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  EmptyState,
  cn,
} from '../../components/ui';
import { useStore } from '../../lib/store';
import { INTERNSHIP_CATEGORIES, internshipCategoryLabel } from '../../data/seed';
import { fmtDate } from '../../lib/format';

export function fmtHours(num) {
  const n = Math.round((Number(num) || 0) * 100) / 100;
  return `${String(n).replace('.', ',')}h`;
}

export function formatRealDuration(realMinutes, fallbackCountedHours = 0) {
  const mins = Number(realMinutes) > 0 ? Number(realMinutes) : Math.round((Number(fallbackCountedHours) / 2) * 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const h = Math.floor(mins / 60);
  const rem = Math.round(mins % 60);
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function StudentInternshipView({ student }) {
  const { data } = useStore();

  const config = data.internshipConfig || { defaultTargetHours: 100, studentTargets: {} };
  const isCustomTarget = config.studentTargets && config.studentTargets[student.id] !== undefined;
  const targetHours = Number(isCustomTarget ? config.studentTargets[student.id] : config.defaultTargetHours) || 100;

  // Considera os estágios lançados/aprovados pela Direção para este aluno
  const studentInternships = (data.internships || []).filter(
    (i) => i.studentId === student.id && i.status !== 'rejeitado'
  );

  const approvedInternships = studentInternships.filter((i) => i.status === 'aprovado' || !i.status);

  const approvedHours =
    Math.round(
      approvedInternships.reduce(
        (sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0),
        0
      ) * 100
    ) / 100;

  const remainingHours = Math.max(0, Math.round((targetHours - approvedHours) * 100) / 100);
  const pct = targetHours > 0 ? Math.min(100, Math.round((approvedHours / targetHours) * 100)) : 100;
  const isCompleted = remainingHours === 0;

  // Distribuição de horas por categoria ministerial
  const categoryBreakdown = INTERNSHIP_CATEGORIES.map((cat) => {
    const hrs =
      Math.round(
        approvedInternships
          .filter((i) => i.category === cat.id)
          .reduce((sum, i) => sum + Number(i.approvedHours ?? i.requestedHours ?? 0), 0) * 100
      ) / 100;
    return { ...cat, hrs };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horas de Estágio Supervisionado"
        subtitle={`${student.course || 'Bacharel em Teologia'} · Matrícula ${student.enrollment || '—'} · Turma ${student.year || '2027'}`}
      />

      {/* 3 Cards de Destaque: Quantidade Atual, Quanto Falta e Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Quantidade Atual
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {fmtHours(approvedHours)}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96] flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Horas lançadas pela Direção Geral</span>
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Quanto Falta
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
              : `Restam ${fmtHours(remainingHours)} para completar o estágio`}
          </p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] dark:text-[#9E9C96]">
            Carga Horária Total Exigida
          </span>
          <div className="my-2 font-serif text-3xl font-bold text-[#1D1B18] dark:text-[#EDEDE8] tabular-nums">
            {fmtHours(targetHours)}
          </div>
          <p className="text-xs text-[#6E6A63] dark:text-[#9E9C96]">
            {isCustomTarget ? 'Meta individual definida pela Direção' : 'Carga horária oficial do curso'}
          </p>
        </Card>
      </div>

      {/* Barra de Progresso Geral + Distribuição por Categoria Ministerial */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">
              Progresso do Estágio Supervisionado
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
            Horas Cumpridas por Categoria Ministerial
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

      {/* Lista de Estágios Já Realizados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">
            Estágios Realizados ({approvedInternships.length})
          </h2>
        </div>

        {approvedInternships.length === 0 ? (
          <Card>
            <EmptyState
              icon={Clock}
              title="Nenhum estágio lançado até o momento"
              text="Após a entrega do documento oficial assinado à secretaria, a Direção Geral fará o lançamento das suas horas aqui."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {approvedInternships.map((item) => {
              const hours = Number(item.approvedHours ?? item.requestedHours ?? 0);

              return (
                <Card key={item.id} className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="blue" className="font-mono text-[11px]">
                          {internshipCategoryLabel(item.category)}
                        </Badge>
                        <Badge tone="green" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Homologado pela Direção
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-[#1D1B18] dark:text-[#EDEDE8]">{item.title}</h3>
                    </div>

                    <div className="self-start sm:text-right rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-stone-50/80 dark:bg-white/[0.03] px-3.5 py-2 shrink-0">
                      <div className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {fmtHours(hours)}
                      </div>
                      <span className="block text-[10px] text-[#6E6A63] dark:text-[#9E9C96]">
                        Contabilizadas (2×)
                      </span>
                      <span className="block font-mono text-[10px] text-[#9E6C1B] dark:text-[#E0A94E] mt-0.5">
                        Real: {formatRealDuration(item.realDurationMinutes, hours)}
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
                  </div>

                  {item.reviewNotes && (
                    <div className="rounded-lg p-3 text-xs border-l-2 border-l-[#B48636] bg-stone-100/80 dark:bg-white/[0.04] text-[#6E6A63] dark:text-[#9E9C96]">
                      <strong className="text-[#1D1B18] dark:text-[#EDEDE8]">Observação:</strong> {item.reviewNotes}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
