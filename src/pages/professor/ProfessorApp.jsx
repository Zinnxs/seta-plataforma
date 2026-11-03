import { useState } from 'react';
import { ClipboardList, FileText, LayoutDashboard, SlidersHorizontal, Video } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useStore } from '../../lib/store';
import { ProfessorOverview } from './ProfessorOverview';
import { ProfessorGrades } from './ProfessorGrades';
import { ProfessorEvaluation } from './ProfessorEvaluation';
import { ProfessorAssignments } from './ProfessorAssignments';
import { ProfessorLessons } from './ProfessorLessons';

export function ProfessorApp() {
  const { data, currentUser } = useStore();
  const myDisciplines = data.disciplines.filter((d) => d.professorId === currentUser.id);
  const [page, setPage] = useState('inicio');
  const [discId, setDiscId] = useState(myDisciplines[0]?.id);
  const discipline = myDisciplines.find((d) => d.id === discId) || myDisciplines[0];

  const pendingReviews = data.assignments
    .filter((a) => myDisciplines.some((d) => d.id === a.disciplineId))
    .reduce((n, a) => n + a.submissions.filter((s) => s.grade === null).length, 0);

  const nav = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    { id: 'notas', label: 'Notas e frequência', icon: ClipboardList },
    { id: 'avaliacao', label: 'Critérios de avaliação', icon: SlidersHorizontal },
    { id: 'trabalhos', label: 'Trabalhos', icon: FileText, count: pendingReviews },
    { id: 'aulas', label: 'Aulas e materiais', icon: Video },
  ];

  const navigate = (p, id) => {
    if (id) setDiscId(id);
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const props = { discipline, disciplines: myDisciplines, onChangeDiscipline: setDiscId };

  return (
    <Layout nav={nav} page={page} onNavigate={navigate} roleLabel="Professor">
      {page === 'inicio' && <ProfessorOverview disciplines={myDisciplines} onNavigate={navigate} />}
      {page === 'notas' && <ProfessorGrades {...props} />}
      {page === 'avaliacao' && <ProfessorEvaluation {...props} />}
      {page === 'trabalhos' && <ProfessorAssignments {...props} />}
      {page === 'aulas' && <ProfessorLessons {...props} />}
    </Layout>
  );
}
