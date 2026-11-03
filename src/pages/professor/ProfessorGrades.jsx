import { useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { useStore } from '../../lib/store';
import { disciplineStats } from '../../lib/grades';
import { fmtGrade } from '../../lib/format';
import { GradesTable } from '../../components/GradesTable';
import { Badge, Button, ConfirmDialog, DisciplineSelect, PageHeader, Stat } from '../../components/ui';

export function ProfessorGrades({ discipline, disciplines, onChangeDiscipline }) {
  const { data, setGradesClosed } = useStore();
  const [confirm, setConfirm] = useState(false);
  const st = disciplineStats(discipline, data.grades[discipline.id]);

  return (
    <>
      <PageHeader
        title="Notas e frequência"
        subtitle={`${discipline.code} · ${discipline.name}`}
        actions={<DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Alunos" value={st.count} />
        <Stat label="Pontuação média somada" value={`${fmtGrade(st.average)}`} hint="Total de 10,0 pts possíveis" />
        <Stat label="Em recuperação" value={st.recovery} hint="Soma inferior a 7,0 pts" />
        <Stat label="Soma mínima (aprovação)" value={`${fmtGrade(discipline.passingGrade)} pts`} hint={`Até ${discipline.maxAbsences} faltas`} />
      </div>

      <GradesTable
        discipline={discipline}
        actions={
          discipline.gradesClosed ? (
            <Badge>
              <Lock className="h-3 w-3" /> Diário enviado à secretaria
            </Badge>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirm(true)}>
              <Send className="h-3.5 w-3.5" /> Enviar diário
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setGradesClosed(discipline.id, true)}
        title="Enviar diário à secretaria?"
        text="Após o envio, as notas e os critérios desta disciplina ficam bloqueados para edição. Somente a direção poderá reabrir o diário."
        confirmLabel="Enviar diário"
      />
    </>
  );
}
