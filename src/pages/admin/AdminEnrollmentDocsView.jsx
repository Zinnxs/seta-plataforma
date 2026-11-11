import React, { useState } from 'react';
import { 
  FileCheck2, 
  Users, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Search, 
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Tabs, 
  Callout, 
  Badge, 
  Avatar, 
  EmptyState 
} from '../../components/ui';
import { useStore } from '../../lib/store';
import { NewEnrollmentDocModal } from '../../components/Modals/NewEnrollmentDocModal';
import { ReviewDocumentModal } from '../../components/Modals/ReviewDocumentModal';

export function AdminEnrollmentDocsView() {
  const { 
    data, 
    updateEnrollmentDocsConfig, 
    addEnrollmentDocType, 
    updateEnrollmentDocType, 
    deleteEnrollmentDocType,
    reviewStudentEnrollmentDocument 
  } = useStore();

  const [activeTab, setActiveTab] = useState('envios'); // 'envios' | 'configuracao'
  const [filterTurma, setFilterTurma] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Modais
  const [newDocModalOpen, setNewDocModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedStudentForReview, setSelectedStudentForReview] = useState(null);
  const [selectedDocForReview, setSelectedDocForReview] = useState(null);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);

  const docsConfig = data.enrollmentDocsConfig || { requiredYears: ['2027'], documents: [] };
  const docTypes = docsConfig.documents || [];
  const requiredYears = docsConfig.requiredYears || ['2027'];
  const students = data.students || [];
  const studentDocuments = data.studentDocuments || {};

  // Toggle de ano letivo exigido
  const handleToggleYear = (year) => {
    let nextYears = [...requiredYears];
    if (nextYears.includes(year)) {
      if (nextYears.length === 1) {
        alert('É necessário manter pelo menos uma turma selecionada.');
        return;
      }
      nextYears = nextYears.filter((y) => y !== year);
    } else {
      nextYears.push(year);
    }
    updateEnrollmentDocsConfig({ requiredYears: nextYears });
  };

  // Filtragem dos alunos
  const filteredStudents = students.filter((s) => {
    const studentYear = String(s.year || '2027');
    if (filterTurma !== 'todas' && !studentYear.includes(filterTurma)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      const matchEnrollment = s.enrollment?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchEnrollment) return false;
    }

    if (filterStatus !== 'todos') {
      const docs = studentDocuments[s.id] || {};
      const requiredDocs = docTypes.filter((d) => d.required);
      const approvedCount = requiredDocs.filter((d) => docs[d.id]?.status === 'aprovado').length;
      const hasInReview = docTypes.some((d) => docs[d.id]?.status === 'em_analise');
      const isComplete = requiredDocs.length > 0 && approvedCount >= requiredDocs.length;

      if (filterStatus === 'em_analise' && !hasInReview) return false;
      if (filterStatus === 'completos' && !isComplete) return false;
      if (filterStatus === 'pendentes' && isComplete) return false;
    }

    return true;
  });

  // Métricas Consolidadas
  const totalStudents = students.length;
  let totalDocsAwaitingReview = 0;
  let totalFullyApprovedStudents = 0;

  students.forEach((s) => {
    const docs = studentDocuments[s.id] || {};
    const requiredDocs = docTypes.filter((d) => d.required);
    const approvedCount = requiredDocs.filter((d) => docs[d.id]?.status === 'aprovado').length;
    if (docTypes.some((d) => docs[d.id]?.status === 'em_analise')) {
      totalDocsAwaitingReview++;
    }
    if (requiredDocs.length > 0 && approvedCount >= requiredDocs.length) {
      totalFullyApprovedStudents++;
    }
  });

  return (
    <>
      <PageHeader
        title="Documentos de Matrícula"
        subtitle="Gerencie os documentos exigidos para o ingresso no Bacharel em Teologia e audite os envios dos alunos."
        actions={
          activeTab === 'configuracao' ? (
            <Button size="sm" onClick={() => { setDocToEdit(null); setNewDocModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Novo Documento Exigido
            </Button>
          ) : null
        }
      />

      <div className="mb-6">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'envios', label: 'Envios dos Alunos', count: students.length },
            { id: 'configuracao', label: 'Configuração dos Documentos Exigidos', count: docTypes.length },
          ]}
        />
      </div>

      {/* ABA 1: ENVIOS DOS ALUNOS */}
      {activeTab === 'envios' && (
        <div className="space-y-6">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Alunos Matriculados
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black text-stone-900 dark:text-stone-100">
                  {totalStudents}
                </span>
                <span className="text-xs text-stone-400">cadastrados</span>
              </div>
            </Card>

            <Card className="p-4 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Aguardando Análise
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black text-blue-700 dark:text-blue-300">
                  {totalDocsAwaitingReview}
                </span>
                <span className="text-xs text-blue-600/70">alunos com novos envios</span>
              </div>
            </Card>

            <Card className="p-4 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                100% Homologados
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black text-emerald-700 dark:text-emerald-300">
                  {totalFullyApprovedStudents}
                </span>
                <span className="text-xs text-emerald-600/70">documentação completa</span>
              </div>
            </Card>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar por nome do aluno, e-mail ou matrícula..."
                className="pl-9 h-10 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterTurma}
                onChange={(e) => setFilterTurma(e.target.value)}
                className="h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="todas">Todas as Turmas</option>
                <option value="2027">Turma 2027 (Ingressantes)</option>
                <option value="2026">Turma 2026</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="em_analise">Aguardando Análise</option>
                <option value="completos">100% Homologados</option>
                <option value="pendentes">Com Pendências</option>
              </select>
            </div>
          </div>

          {/* Lista de Alunos e seus Documentos */}
          <Card className="overflow-hidden">
            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum aluno encontrado"
                text="Tente alterar os filtros ou a busca acima."
              />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredStudents.map((s) => {
                  const studentDocs = studentDocuments[s.id] || {};
                  const requiredDocs = docTypes.filter((d) => d.required);
                  const approvedCount = requiredDocs.filter((d) => studentDocs[d.id]?.status === 'aprovado').length;
                  const inReviewCount = docTypes.filter((d) => studentDocs[d.id]?.status === 'em_analise').length;
                  const isExpanded = expandedStudentId === s.id;
                  const isComplete = requiredDocs.length > 0 && approvedCount >= requiredDocs.length;

                  // Verifica se este aluno pertence a um ano que deve enviar docs
                  const isRequiredForStudent = requiredYears.some((yr) => String(s.year || '').includes(yr));

                  return (
                    <div key={s.id} className="transition-colors hover:bg-stone-50/40 dark:hover:bg-stone-900/30">
                      {/* Linha Resumo do Aluno */}
                      <div 
                        onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                                {s.name}
                              </h4>
                              <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">
                                ({s.enrollment || 'Sem matrícula'})
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                Turma {s.year || '2027'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5 font-mono">
                              {s.email}
                            </p>
                          </div>
                        </div>

                        {/* Status de Documentos */}
                        <div className="flex items-center gap-3">
                          {!isRequiredForStudent ? (
                            <span className="text-xs text-stone-400 font-medium px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800">
                              Isento de envio
                            </span>
                          ) : isComplete ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-300/40">
                              <ShieldCheck className="h-3.5 w-3.5" /> Completo ({approvedCount}/{requiredDocs.length})
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {inReviewCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-300/40">
                                  <Clock className="h-3 w-3" /> {inReviewCount} para avaliar
                                </span>
                              )}
                              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                                {approvedCount} de {requiredDocs.length} aprovados
                              </span>
                            </div>
                          )}

                          <button 
                            type="button" 
                            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 transition"
                            aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Painel Expansível de Detalhes dos Documentos */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {docTypes.map((doc) => {
                              const sub = studentDocs[doc.id];

                              return (
                                <div 
                                  key={doc.id}
                                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="font-semibold text-stone-900 dark:text-stone-100">
                                        {doc.title}
                                      </h5>
                                      {doc.required ? (
                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                          Obrigatório
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-stone-400">
                                          Opcional
                                        </span>
                                      )}
                                    </div>
                                    {doc.description && (
                                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Status do Arquivo */}
                                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                                    {sub ? (
                                      <>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          {sub.status === 'aprovado' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                          {sub.status === 'em_analise' && <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                                          {sub.status === 'rejeitado' && <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                                          <span className="font-mono text-[11px] truncate max-w-[140px]" title={sub.fileName}>
                                            {sub.fileName}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <a
                                            href={sub.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition"
                                            title="Abrir arquivo em nova aba"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>

                                          <Button
                                            size="sm"
                                            variant={sub.status === 'em_analise' ? 'primary' : 'secondary'}
                                            onClick={() => {
                                              setSelectedStudentForReview(s);
                                              setSelectedDocForReview(doc);
                                              setSelectedSubmissionForReview(sub);
                                              setReviewModalOpen(true);
                                            }}
                                            className="text-[11px] h-7 px-2"
                                          >
                                            {sub.status === 'aprovado' ? 'Revisar' : 'Avaliar'}
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-stone-400 text-[11px] italic">
                                        Nenhum arquivo enviado ainda
                                      </span>
                                    )}
                                  </div>

                                  {sub?.status === 'rejeitado' && sub.notes && (
                                    <div className="text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                      <strong>Motivo da recusa:</strong> {sub.notes}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ABA 2: CONFIGURAÇÃO DOS DOCUMENTOS EXIGIDOS */}
      {activeTab === 'configuracao' && (
        <div className="space-y-6">
          {/* Card de Configuração das Turmas Exigidas */}
          <Card className="p-5">
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
              Anos Letivos e Turmas com Envio Obrigatório
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Defina para quais turmas o menu e a exigência de envio dos documentos de matrícula aparecerão.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                onClick={() => handleToggleYear('2027')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  requiredYears.includes('2027')
                    ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Turma 2027 (Novos Ingressantes)
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Exige envio completo para emissão da matrícula oficial
                  </p>
                </div>
                <input
                  type="checkbox"
                  readOnly
                  checked={requiredYears.includes('2027')}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </label>

              <label 
                onClick={() => handleToggleYear('2026')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  requiredYears.includes('2026')
                    ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Turma 2026 (Alunos Veteranos)
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Ative caso queira recadastrar ou solicitar documentos pendentes
                  </p>
                </div>
                <input
                  type="checkbox"
                  readOnly
                  checked={requiredYears.includes('2026')}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>
          </Card>

          {/* Lista de Documentos Exigidos */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/40 text-xs">
              <span className="text-stone-500 font-medium">
                Lista de Documentos Cadastrados ({docTypes.length})
              </span>
              <Button size="sm" onClick={() => { setDocToEdit(null); setNewDocModalOpen(true); }}>
                <Plus className="h-3.5 w-3.5" /> Adicionar Documento
              </Button>
            </div>

            {docTypes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum documento configurado"
                text="Clique no botão acima para adicionar o primeiro documento exigido para matrícula."
              />
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {docTypes.map((doc, idx) => (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-400">#{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {doc.title}
                        </h4>
                        {doc.required ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Obrigatório
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                            Opcional
                          </span>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setDocToEdit(doc);
                          setNewDocModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => {
                          if (confirm(`Deseja remover a exigência do documento "${doc.title}"?`)) {
                            deleteEnrollmentDocType(doc.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal de Criação / Edição de Documento Exigido */}
      <NewEnrollmentDocModal
        open={newDocModalOpen}
        onClose={() => setNewDocModalOpen(false)}
        docToEdit={docToEdit}
        onSave={(doc) => {
          if (docToEdit) {
            updateEnrollmentDocType(doc);
          } else {
            addEnrollmentDocType(doc);
          }
        }}
      />

      {/* Modal de Análise / Auditoria do Documento do Aluno */}
      <ReviewDocumentModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        student={selectedStudentForReview}
        docType={selectedDocForReview}
        submission={selectedSubmissionForReview}
        onSave={(studentId, docTypeId, status, notes) => {
          reviewStudentEnrollmentDocument(studentId, docTypeId, status, notes);
        }}
      />
    </>
  );
}
