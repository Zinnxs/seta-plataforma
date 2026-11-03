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
  ChevronRight
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useStore } from '../../lib/store';
import { disciplineStats, computeResult } from '../../lib/grades';
import { fmtGrade, personName } from '../../lib/format';
import { GradesTable } from '../../components/GradesTable';
import { EvaluationConfig } from '../../components/EvaluationConfig';
import { 
  Badge, 
  Button, 
  Card, 
  CardHeader, 
  DisciplineSelect, 
  PageHeader, 
  Stat, 
  Tabs,
  Callout 
} from '../../components/ui';

export function AdminApp() {
  const { data, setGradesClosed, saveDisciplineConfig } = useStore();
  const [page, setPage] = useState('visao_geral');
  const [selectedDiscId, setSelectedDiscId] = useState(data.disciplines[0]?.id);
  const [adminTab, setAdminTab] = useState('notas'); // 'notas' | 'criterios'

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
    { id: 'disciplinas', label: 'Diários e matérias', icon: BookOpen },
    { id: 'recuperacao', label: 'Alunos em recuperação', icon: AlertTriangle, count: totalRecoveryCount },
    { id: 'infra_proposta', label: 'Custos e Servidor NAS', icon: Server },
  ];

  return (
    <Layout nav={nav} page={page} onNavigate={setPage} roleLabel="Direção & Secretaria">
      {page === 'visao_geral' && (
        <AdminOverview 
          institution={data.institution} 
          disciplines={data.disciplines} 
          professors={data.professors} 
          students={data.students}
          allStats={allStats}
          closedDiariesCount={closedDiariesCount}
          onSelectDiscipline={(id) => {
            setSelectedDiscId(id);
            setPage('disciplinas');
          }}
        />
      )}

      {page === 'disciplinas' && (
        <AdminDisciplinesView
          discipline={selectedDiscipline}
          disciplines={data.disciplines}
          professors={data.professors}
          onChangeDiscipline={setSelectedDiscId}
          onToggleClosed={(id, closed) => setGradesClosed(id, closed)}
          onSaveConfig={(cfg) => saveDisciplineConfig(selectedDiscipline.id, cfg)}
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
    </Layout>
  );
}

function AdminOverview({ institution, disciplines, professors, students, allStats, closedDiariesCount, onSelectDiscipline }) {
  return (
    <>
      <PageHeader
        title="Painel Institucional da Direção"
        subtitle={`${institution.name} · Período Letivo ${institution.period}`}
        actions={
          <Button variant="secondary" onClick={() => alert("Simulação: Gerando relatório acadêmico semestral completo em PDF...")}>
            <Download className="h-4 w-4" /> Relatório semestral
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total de Alunos" value={students.length} hint="Corpo discente ativo" />
        <Stat label="Professores" value={professors.length} hint="Corpo docente titulado" />
        <Stat label="Diários Fechados" value={`${closedDiariesCount} / ${disciplines.length}`} hint="Enviados à secretaria" />
        <Stat 
          label="Em Recuperação" 
          value={allStats.reduce((acc, curr) => acc + curr.stats.recovery, 0)} 
          hint="Acompanhamento pastoral" 
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Status dos Diários por Disciplina</h3>
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
                    <span className="text-stone-400 block">Média da Turma</span>
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
      </div>
    </>
  );
}

function AdminDisciplinesView({ discipline, disciplines, professors, onChangeDiscipline, onToggleClosed, onSaveConfig, tab, setTab }) {
  const prof = professors.find(p => p.id === discipline.professorId);

  return (
    <>
      <PageHeader
        title="Gestão da Disciplina"
        subtitle={`${discipline.code} · ${discipline.name} (Docente: ${personName(prof)})`}
        actions={
          <div className="flex items-center gap-2">
            <DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />
            {discipline.gradesClosed ? (
              <Button variant="secondary" size="sm" onClick={() => onToggleClosed(discipline.id, false)}>
                <Unlock className="h-3.5 w-3.5" /> Reabrir diário
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onToggleClosed(discipline.id, true)}>
                <Lock className="h-3.5 w-3.5" /> Encerrar diário
              </Button>
            )}
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
        subtitle="Alunos com média inferior à nota de corte do SETA que necessitam de avaliação de recuperação ou aconselhamento."
      />

      {recoveryList.length === 0 ? (
        <Card>
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Nenhum aluno em recuperação</h4>
            <p className="text-xs text-stone-400">Todos os alunos matriculados atingiram a média mínima.</p>
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
                  <span className="text-stone-400 block">Média Atual</span>
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
        {/* Destaque sobre o Computador NAS */}
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

        {/* Comparativo de Opções */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Comparativo de Custos para Apresentação à Diretoria</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400">
                  <th className="py-2.5 px-3">Modelo de Implantação</th>
                  <th className="py-2.5 px-3">Banco de Dados</th>
                  <th className="py-2.5 px-3">Armazenamento de Arquivos</th>
                  <th className="py-2.5 px-3">Custo de Servidor</th>
                  <th className="py-2.5 px-3 font-semibold">Custo Total / Mês</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
                <tr>
                  <td className="py-3 px-3 font-semibold text-brand-700 dark:text-brand-300">Opção A: Nuvem Gratuita (Piloto)</td>
                  <td className="py-3 px-3">Supabase (PostgreSQL Free)</td>
                  <td className="py-3 px-3">Supabase Storage (1 GB)</td>
                  <td className="py-3 px-3">Vercel (Free Tier)</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">R$ 0,00 / mês</td>
                </tr>
                <tr className="bg-brand-50/40 dark:bg-brand-900/10">
                  <td className="py-3 px-3 font-semibold text-brand-700 dark:text-brand-300">Opção B: Servidor Local Próprio (PC NAS)</td>
                  <td className="py-3 px-3">PostgreSQL no PC local</td>
                  <td className="py-3 px-3">HD do PC local (1TB a 2TB)</td>
                  <td className="py-3 px-3">PC do Seminário + Cloudflare Tunnel</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">Apenas energia (~R$ 25/mês)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-stone-700 dark:text-stone-200">Opção C: Nuvem Pro (Escala Total)</td>
                  <td className="py-3 px-3">Supabase Pro com backup diário</td>
                  <td className="py-3 px-3">100 GB em nuvem dedicada</td>
                  <td className="py-3 px-3">Hospedagem Gerenciada</td>
                  <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-100">~R$ 140,00 / mês</td>
                </tr>
                <tr className="text-stone-400">
                  <td className="py-3 px-3 italic">Sistemas Comerciais Prontos de Mercado</td>
                  <td className="py-3 px-3">Proprietário fechado</td>
                  <td className="py-3 px-3">Limitado</td>
                  <td className="py-3 px-3">Empresa terceira</td>
                  <td className="py-3 px-3 font-bold text-rose-500">R$ 1.200 a R$ 2.500 / mês</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500 pt-2">
            * Em qualquer modelo, o único investimento fixo anual obrigatório é o registro do domínio próprio (ex: <code>seminarioseta.com.br</code> = R$ 40,00 ao ano no Registro.br).
          </p>
        </Card>
      </div>
    </>
  );
}
