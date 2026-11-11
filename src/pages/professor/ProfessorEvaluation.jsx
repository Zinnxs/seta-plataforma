import { useStore } from '../../lib/store';
import { EvaluationConfig } from '../../components/EvaluationConfig';
import { DisciplineSelect, EmptyState, PageHeader } from '../../components/ui';

export function ProfessorEvaluation({ discipline, disciplines, onChangeDiscipline }) {
  const { saveDisciplineConfig } = useStore();

  if (!discipline) {
    return (
      <>
        <PageHeader title="Critérios de avaliação" subtitle="Seminário Teológico Aliança" />
        <EmptyState
          title="Nenhuma disciplina encontrada"
          text="Você ainda não possui matérias vinculadas ao seu perfil de docente para este período."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Critérios de avaliação"
        subtitle="Defina se a disciplina será avaliada por provas, trabalhos, seminários ou uma combinação deles."
        actions={<DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />}
      />
      <EvaluationConfig
        key={discipline.id + String(discipline.gradesClosed)}
        discipline={discipline}
        onSave={(cfg) => saveDisciplineConfig(discipline.id, cfg)}
      />
    </>
  );
}
