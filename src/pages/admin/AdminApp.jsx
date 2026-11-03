import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  FileSpreadsheet, 
  DollarSign, 
  HardDrive, 
  Server, 
  ShieldCheck,
  Download,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Trash2,
  UserPlus,
  Key,
  Pencil,
  Database
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useStore } from '../../lib/store';
import { disciplineStats, computeResult } from '../../lib/grades';
import { fmtGrade, personName } from '../../lib/format';
import { GradesTable } from '../../components/GradesTable';
import { EvaluationConfig } from '../../components/EvaluationConfig';
import { NewUserModal } from '../../components/Modals/NewUserModal';
import { EditUserModal } from '../../components/Modals/EditUserModal';
import { NewDisciplineAdminModal } from '../../components/Modals/NewDisciplineAdminModal';
import { EditDisciplineModal } from '../../components/Modals/EditDisciplineModal';
import { 
  Badge, 
  Button, 
  Card, 
  CardHeader, 
  DisciplineSelect, 
  PageHeader, 
  Stat, 
  Tabs,
  Callout,
  Avatar,
  EmptyState
} from '../../components/ui';

export function AdminApp({ onOpenSupabaseConfig }) {
  const { 
    data, 
    setGradesClosed, 
    saveDisciplineConfig, 
    addUser, 
    updateUser,
    deleteUser, 
    addDiscipline, 
    updateDiscipline,
    deleteDiscipline,
    isSupabaseConfigured,
    syncStatus,
    lastSyncError,
  } = useStore();

  const [page, setPage] = useState('visao_geral');
  const [selectedDiscId, setSelectedDiscId] = useState(data.disciplines[0]?.id);
  const [adminTab, setAdminTab] = useState('notas'); // 'notas' | 'criterios'

  // Modais de Criação e Edição
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserDefaultRole, setNewUserDefaultRole] = useState('aluno');
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);

  const [newDisciplineModalOpen, setNewDisciplineModalOpen] = useState(false);
  const [editDisciplineModalOpen, setEditDisciplineModalOpen] = useState(false);
  const [disciplineToEdit, setDisciplineToEdit] = useState(null);

  const selectedDiscipline = data.disciplines.find(d => d.id === selectedDiscId) || data.disciplines[0];

  // Cálculo de estatísticas consolidadas de todas as disciplinas
  const allStats = data.disciplines.map(d => ({
    discipline: d,
    stats: disciplineStats(d, data.grades[d.id])
  }));

  const totalRecoveryCount = allStats.reduce((acc, curr) => acc + curr.stats.recovery, 0);
  const closedDiariesCount = data.disciplines.filter(d => d.gradesClosed).length;

  const nav = [
    { id: 'visao_geral', label: 'Visão geral', icon: Building2 },
    { id: 'usuarios', label: 'Alunos e Professores', icon: Users, count: data.students.length + data.professors.length },
    { id: 'disciplinas', label: 'Diários e matérias', icon: BookOpen, count: data.disciplines.length },
    { id: 'recuperacao', label: 'Alunos em recuperação', icon: AlertTriangle, count: totalRecoveryCount },
    { id: 'infra_proposta', label: 'Custos e Servidor NAS', icon: Server },
  ];

  return (
    <Layout nav={nav} page={page} onNavigate={setPage} roleLabel="Direção Geral">
      {page === 'visao_geral' && (
        <AdminOverview 
          institution={data.institution} 
          disciplines={data.disciplines} 
          professors={data.professors} 
          students={data.students}
          allStats={allStats}
          closedDiariesCount={closedDiariesCount}
          isSupabaseConfigured={isSupabaseConfigured}
          syncStatus={syncStatus}
          lastSyncError={lastSyncError}
          onOpenSupabaseConfig={onOpenSupabaseConfig}
          onSelectDiscipline={(id) => {
            setSelectedDiscId(id);
            setPage('disciplinas');
          }}
        />
      )}

      {page === 'usuarios' && (
        <AdminUsersView
          students={data.students}
          professors={data.professors}
          onOpenNewUser={(role) => {
            setNewUserDefaultRole(role);
            setNewUserModalOpen(true);
          }}
          onEditUser={(user) => {
            setSelectedUserToEdit(user);
            setEditUserModalOpen(true);
          }}
          onDeleteUser={deleteUser}
        />
      )}

      {page === 'disciplinas' && (
        <AdminDisciplinesView
          discipline={selectedDiscipline}
          disciplines={data.disciplines}
          professors={data.professors}
          onChangeDiscipline={setSelectedDiscId}
          onToggleClosed={(id, closed) => setGradesClosed(id, closed)}
          onSaveConfig={(cfg) => saveDisciplineConfig(selectedDiscipline?.id, cfg)}
          onOpenNewDiscipline={() => setNewDisciplineModalOpen(true)}
          onOpenEditDiscipline={(disc) => {
            setDisciplineToEdit(disc);
            setEditDisciplineModalOpen(true);
          }}
          onDeleteDiscipline={(id) => {
            deleteDiscipline(id);
            if (data.disciplines.length > 1) {
              const remaining = data.disciplines.filter(d => d.id !== id);
              setSelectedDiscId(remaining[0]?.id);
            }
          }}
          tab={adminTab}
          setTab={setAdminTab}
        />
      )}

      {page === 'recuperacao' && (
        <AdminRecoveryView
          disciplines={data.disciplines}
          grades={data.grades}
          students={data.students}
          professors={data.professors}
        />
      )}

      {page === 'infra_proposta' && (
        <AdminInfrastructureView />
      )}

      {/* Modal de Cadastro de Aluno/Professor */}
      <NewUserModal
        open={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        defaultRole={newUserDefaultRole}
        onSave={(user) => {
          addUser(user);
        }}
      />

      {/* Modal de Edição de Aluno/Professor */}
      <EditUserModal
        open={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        user={selectedUserToEdit}
        onSave={(updatedUser) => {
          updateUser(updatedUser);
        }}
      />

      {/* Modal de Nova Matéria do Zero */}
      <NewDisciplineAdminModal
        open={newDisciplineModalOpen}
        onClose={() => setNewDisciplineModalOpen(false)}
        professors={data.professors}
        onSave={(disc) => {
          addDiscipline(disc);
          setSelectedDiscId(disc.id);
        }}
      />

      {/* Modal de Edição de Matéria */}
      <EditDisciplineModal
        open={editDisciplineModalOpen}
        onClose={() => setEditDisciplineModalOpen(false)}
        discipline={disciplineToEdit || selectedDiscipline}
        professors={data.professors}
        onSave={(updatedDisc) => {
          updateDiscipline(updatedDisc);
        }}
      />
    </Layout>
  );
}

function AdminOverview({ 
  institution, 
  disciplines, 
  professors, 
  students, 
  allStats, 
  closedDiariesCount, 
  isSupabaseConfigured,
  syncStatus,
  lastSyncError,
  onOpenSupabaseConfig,
  onSelectDiscipline 
}) {
  return (
    <>
      <PageHeader
        title="Painel Institucional da Direção"
        subtitle={`${institution.name} · Curso de Bacharel em Teologia · Período ${institution.period}`}
        actions={
          <Button variant="secondary" size="sm" onClick={onOpenSupabaseConfig} title="Configuração do Banco Supabase">
            <Database className="h-3.5 w-3.5" />
            <span>Banco de Dados</span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </Button>
        }
      />

      {/* Alerta se o Supabase não estiver configurado neste navegador */}
      {!isSupabaseConfigured && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <strong className="font-semibold flex items-center gap-1.5 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /> Supabase Não Conectado neste Navegador
            </strong>
            <p className="text-amber-800 dark:text-amber-300">
              Você está salvando no cache local deste computador. Para salvar na nuvem e abrir em qualquer outro navegador ou celular, conecte o Supabase abaixo ou ative as variáveis no Vercel.
            </p>
          </div>
          <Button size="sm" onClick={onOpenSupabaseConfig} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-none">
            <Database className="h-3.5 w-3.5" /> Conectar Supabase
          </Button>
        </div>
      )}

      {/* Alerta se ocorreu erro ao sincronizar */}
      {lastSyncError && (
        <div className="mb-6 p-4 rounded-2xl border border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <strong className="font-semibold flex items-center gap-1.5 text-sm">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> Aviso de Sincronização do Banco
            </strong>
            <p className="text-rose-800 dark:text-rose-300">
              {lastSyncError}. Certifique-se de ter executado o script <strong>supabase_schema.sql</strong> no SQL Editor do Supabase para criar as tabelas.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={onOpenSupabaseConfig} className="shrink-0">
            Ver Detalhes
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total de Alunos" value={students.length} hint="Corpo discente cadastrado" />
        <Stat label="Professores" value={professors.length} hint="Corpo docente ativo" />
        <Stat label="Matérias Cadastradas" value={disciplines.length} hint={`${closedDiariesCount} diários fechados`} />
        <Stat 
          label="Em Recuperação" 
          value={allStats.reduce((acc, curr) => acc + curr.stats.recovery, 0)} 
          hint="Pontuação somada < 7,0" 
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Status dos Diários por Disciplina</h3>
          <span className="text-xs text-stone-400">Clique na disciplina para auditar notas ou alterar critérios</span>
        </div>

        {allStats.length === 0 ? (
          <Card>
            <EmptyState 
              icon={BookOpen} 
              title="Nenhuma disciplina cadastrada" 
              text="Acesse a aba 'Diários e matérias' para cadastrar as matérias do Bacharel em Teologia e vincular os professores." 
            />
          </Card>
        ) : (
          <Card className="divide-y divide-stone-100 dark:divide-stone-800">
            {allStats.map(({ discipline, stats }) => {
              const prof = professors.find(p => p.id === discipline.professorId);
              return (
                <div 
                  key={discipline.id} 
                  onClick={() => onSelectDiscipline(discipline.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 cursor-pointer transition gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{discipline.code}</span>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{discipline.name}</h4>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Docente: {personName(prof)} · {discipline.schedule}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <span className="text-stone-400 block">Pontuação Média</span>
                      <span className="text-sm font-bold tabular-nums text-stone-900 dark:text-stone-50">{fmtGrade(stats.average)}</span>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block">Recuperação</span>
                      <span className={`text-sm font-bold tabular-nums ${stats.recovery > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500'}`}>
                        {stats.recovery}
                      </span>
                    </div>

                    {discipline.gradesClosed ? (
                      <Badge tone="green">Fechado</Badge>
                    ) : (
                      <Badge tone="amber">Aberto</Badge>
                    )}

                    <ChevronRight className="h-4 w-4 text-stone-300 dark:text-stone-600" />
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </>
  );
}

function AdminUsersView({ students, professors, onOpenNewUser, onEditUser, onDeleteUser }) {
  const [tab, setTab] = useState('professores'); // 'professores' | 'alunos'

  return (
    <>
      <PageHeader
        title="Gerenciamento de Alunos e Professores"
        subtitle="Cadastre e edite os professores e alunos oficiais do seminário (Bacharel em Teologia)."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onOpenNewUser('professor')}>
              <UserPlus className="h-4 w-4" /> Novo Professor
            </Button>
            <Button size="sm" onClick={() => onOpenNewUser('aluno')}>
              <UserPlus className="h-4 w-4" /> Novo Aluno
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'professores', label: 'Corpo Docente (Professores)', count: professors.length },
            { id: 'alunos', label: 'Corpo Discente (Alunos)', count: students.length },
          ]}
        />
      </div>

      {tab === 'professores' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/40 text-xs">
            <span className="text-stone-500 font-medium">Professores com permissão de lançar notas, tarefas e aulas</span>
            <Button size="sm" onClick={() => onOpenNewUser('professor')}>
              <Plus className="h-3.5 w-3.5" /> Cadastrar Professor
            </Button>
          </div>

          {professors.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum professor cadastrado" text="Clique no botão acima para cadastrar o primeiro professor do seminário." />
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {professors.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{personName(p)}</h4>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 font-mono flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-stone-400" />
                      <span>Senha: {p.password || 'seta123'}</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditUser(p)}
                      title="Editar dados e senha do professor"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-700"
                      onClick={() => {
                        if (confirm(`Deseja remover o professor ${p.name}?`)) {
                          onDeleteUser(p.id, 'professor');
                        }
                      }}
                      title="Excluir professor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'alunos' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/40 text-xs">
            <span className="text-stone-500 font-medium">Alunos matriculados no Bacharel em Teologia</span>
            <Button size="sm" onClick={() => onOpenNewUser('aluno')}>
              <Plus className="h-3.5 w-3.5" /> Cadastrar Aluno
            </Button>
          </div>

          {students.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Nenhum aluno cadastrado" text="Clique no botão acima para cadastrar o primeiro aluno." />
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {students.map((s) => (
                <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{s.name}</h4>
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-bold font-mono">({s.enrollment})</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Bacharel em Teologia · <span className="font-mono">{s.email}</span> · {s.year || '1º ano'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-300 font-mono flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-stone-400" />
                      <span>Senha: {s.password || 'seta123'}</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditUser(s)}
                      title="Editar dados e senha do aluno"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-700"
                      onClick={() => {
                        if (confirm(`Deseja remover o aluno ${s.name}?`)) {
                          onDeleteUser(s.id, 'aluno');
                        }
                      }}
                      title="Excluir aluno"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function AdminDisciplinesView({ 
  discipline, 
  disciplines, 
  professors, 
  onChangeDiscipline, 
  onToggleClosed, 
  onSaveConfig, 
  onOpenNewDiscipline,
  onOpenEditDiscipline,
  onDeleteDiscipline,
  tab, 
  setTab 
}) {
  const prof = discipline ? professors.find(p => p.id === discipline.professorId) : null;

  if (!discipline || disciplines.length === 0) {
    return (
      <>
        <PageHeader
          title="Gestão de Matérias e Diários"
          subtitle="Nenhuma disciplina cadastrada no momento."
          actions={
            <Button onClick={onOpenNewDiscipline}>
              <Plus className="h-4 w-4" /> Cadastrar Nova Matéria
            </Button>
          }
        />
        <Card>
          <EmptyState 
            icon={BookOpen} 
            title="Nenhuma matéria encontrada" 
            text="Clique no botão 'Cadastrar Nova Matéria' para criar a primeira disciplina oficial do seminário." 
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestão da Disciplina"
        subtitle={`${discipline.code} · ${discipline.name} (Docente: ${personName(prof)}) · Bacharel em Teologia`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />
            <Button size="sm" onClick={onOpenNewDiscipline}>
              <Plus className="h-3.5 w-3.5" /> Nova Matéria
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenEditDiscipline(discipline)}>
              <Pencil className="h-3.5 w-3.5" /> Editar Matéria
            </Button>
            {discipline.gradesClosed ? (
              <Button variant="secondary" size="sm" onClick={() => onToggleClosed(discipline.id, false)}>
                <Unlock className="h-3.5 w-3.5" /> Reabrir diário
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onToggleClosed(discipline.id, true)}>
                <Lock className="h-3.5 w-3.5" /> Encerrar diário
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm(`Tem certeza que deseja excluir a matéria ${discipline.name}?`)) {
                  onDeleteDiscipline(discipline.id);
                }
              }}
              title="Excluir disciplina"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'notas', label: 'Auditoria de Notas' },
            { id: 'criterios', label: 'Critérios de Avaliação' },
          ]}
        />
      </div>

      {tab === 'notas' && (
        <GradesTable 
          discipline={discipline} 
          readOnly={false} 
          actions={
            discipline.gradesClosed ? (
              <Badge tone="green"><Lock className="h-3 w-3" /> Diário auditado e arquivado</Badge>
            ) : (
              <Badge tone="amber">Em aberto com o docente</Badge>
            )
          }
        />
      )}

      {tab === 'criterios' && (
        <EvaluationConfig
          key={discipline.id}
          discipline={discipline}
          onSave={onSaveConfig}
        />
      )}
    </>
  );
}

function AdminRecoveryView({ disciplines, grades, students, professors }) {
  const recoveryList = [];

  disciplines.forEach(disc => {
    const prof = professors.find(p => p.id === disc.professorId);
    const discGrades = grades[disc.id] || {};
    Object.keys(discGrades).forEach(studentId => {
      const st = students.find(s => s.id === studentId);
      const rec = discGrades[studentId];
      const res = computeResult(disc, rec);
      if (res.needsRecovery || res.recoveryApplied) {
        recoveryList.push({ discipline: disc, professor: prof, student: st, rec, res });
      }
    });
  });

  return (
    <>
      <PageHeader
        title="Acompanhamento de Recuperação"
        subtitle="Alunos com pontuação somada inferior a 7,0 pontos que necessitam de avaliação de recuperação ou acompanhamento pastoral."
      />

      {recoveryList.length === 0 ? (
        <Card>
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Nenhum aluno em recuperação</h4>
            <p className="text-xs text-stone-400">Todos os alunos matriculados atingiram a soma mínima de 7,0 pontos.</p>
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-stone-100 dark:divide-stone-800">
          {recoveryList.map(({ discipline, professor, student, rec, res }, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{student?.name}</h4>
                  <span className="text-xs text-stone-400">({student?.enrollment})</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Matéria: <strong className="text-stone-800 dark:text-stone-200">{discipline.name}</strong> · Docente: {personName(professor)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <span className="text-stone-400 block">Nota Somada</span>
                  <span className="text-sm font-bold tabular-nums text-stone-900 dark:text-stone-50">{fmtGrade(res.final)}</span>
                </div>

                <div className="text-right text-xs">
                  <span className="text-stone-400 block">Prova Recup.</span>
                  <span className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {rec.recovery !== null ? fmtGrade(rec.recovery) : 'Pendente'}
                  </span>
                </div>

                <div className="min-w-28 text-right">
                  <Badge tone={res.status.includes('Aprovado') ? 'green' : 'amber'}>
                    {res.status.includes('Aprovado') ? 'Recuperado' : 'Aguardando Prova'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

function AdminInfrastructureView() {
  return (
    <>
      <PageHeader
        title="Infraestrutura, Custos e Servidor NAS"
        subtitle="Análise comparativa para a diretoria: Nuvem vs Servidor Local próprio do seminário."
      />

      <div className="space-y-6">
        <Card className="p-6 border-2 border-brand-300 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 shrink-0">
              <Server className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">
                Podemos usar um PC do Seminário como Servidor NAS de Banco de Dados e Armazenamento?
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                <strong>Sim, é perfeitamente viável!</strong> Qualquer computador disponível com 8GB de RAM e um disco rígido ou SSD pode ser transformado em um servidor local seguro do SETA.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-brand-200 dark:border-brand-800/60 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">Vantagens do Servidor Local no Seminário:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-600 dark:text-stone-300">
                    <li><strong>Custo zero de mensalidade de nuvem:</strong> sem limite de GB para trabalhos e apostilas.</li>
                    <li><strong>Soberania total dos dados:</strong> todas as notas e arquivos físicos ficam dentro do seminário.</li>
                    <li><strong>Tecnologia padronizada:</strong> Docker + PostgreSQL + MinIO (S3 compatível).</li>
                    <li><strong>Acesso remoto seguro:</strong> usando Cloudflare Tunnels (grátis, sem precisar de IP fixo).</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-amber-700 dark:text-amber-400 block">Cuidados Necessários:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-600 dark:text-stone-300">
                    <li><strong>Disponibilidade elétrica:</strong> precisa de um NoBreak pequeno (para não desligar em oscilações).</li>
                    <li><strong>Backup automático em nuvem:</strong> backup diário encriptado para o Google Drive para segurança.</li>
                    <li><strong>Internet do seminário:</strong> precisa de banda com upload razoável.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
