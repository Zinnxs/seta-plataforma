import { useState } from 'react';
import { ClipboardList, FileText, LayoutDashboard, SlidersHorizontal, Video, Bell, Calendar, AlertCircle } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useStore } from '../../lib/store';
import { fmtDate } from '../../lib/format';
import { Badge, Card, EmptyState, PageHeader } from '../../components/ui';
import { ProfessorOverview } from './ProfessorOverview';
import { ProfessorGrades } from './ProfessorGrades';
import { ProfessorEvaluation } from './ProfessorEvaluation';
import { ProfessorAssignments } from './ProfessorAssignments';
import { ProfessorLessons } from './ProfessorLessons';

export function ProfessorApp() {
  const { data, currentUser } = useStore();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] dark:bg-[#131417] p-6 text-center">
        <div className="space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B48636] border-t-transparent mx-auto dark:border-[#E0A94E]" />
          <p className="text-sm font-medium text-[#6E6A63] dark:text-[#9E9C96]">Carregando ambiente docente...</p>
        </div>
      </div>
    );
  }

  const myDisciplines = (data.disciplines || []).filter((d) => d?.professorId === currentUser?.id);
  const [page, setPage] = useState('inicio');
  const [discId, setDiscId] = useState(myDisciplines[0]?.id);
  const discipline = myDisciplines.find((d) => d?.id === discId) || myDisciplines[0] || null;

  const pendingReviews = data.assignments
    .filter((a) => myDisciplines.some((d) => d.id === a.disciplineId))
    .reduce((n, a) => n + a.submissions.filter((s) => s.grade === null).length, 0);

  const nav = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    { id: 'notas', label: 'Notas e frequência', icon: ClipboardList },
    { id: 'avaliacao', label: 'Critérios de avaliação', icon: SlidersHorizontal },
    { id: 'trabalhos', label: 'Trabalhos', icon: FileText, count: pendingReviews },
    { id: 'aulas', label: 'Aulas e materiais', icon: Video },
    { id: 'avisos', label: 'Quadro de avisos', icon: Bell, count: data.announcements.length },
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
      {page === 'avisos' && <ProfessorAnnouncementsView announcements={data.announcements} />}
    </Layout>
  );
}

function ProfessorAnnouncementsView({ announcements }) {
  return (
    <>
      <PageHeader
        title="Quadro de Avisos Institucionais"
        subtitle="Comunicados emitidos pela Direção Geral e Coordenação para o corpo docente."
      />
      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Nenhum comunicado no mural"
            text="Não há comunicados recentes publicados pela direção institucional."
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
