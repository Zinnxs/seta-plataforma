import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { PageHeader, Card, Button, Callout, Badge } from '../../components/ui';
import { useStore } from '../../lib/store';

export function StudentDocumentsView({ student }) {
  const { 
    data, 
    uploadStudentEnrollmentDocument 
  } = useStore();

  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRefs = useRef({});

  const docsConfig = data.enrollmentDocsConfig || { requiredYears: ['2027'], documents: [] };
  const docTypes = docsConfig.documents || [];
  const studentDocs = (data.studentDocuments && data.studentDocuments[student.id]) || {};

  // Estatísticas de progresso
  const totalRequired = docTypes.filter(d => d.required).length;
  const approvedCount = docTypes.filter(d => studentDocs[d.id]?.status === 'aprovado').length;
  const inReviewCount = docTypes.filter(d => studentDocs[d.id]?.status === 'em_analise').length;
  const rejectedCount = docTypes.filter(d => studentDocs[d.id]?.status === 'rejeitado').length;
  const pendingCount = docTypes.filter(d => d.required && !studentDocs[d.id]).length;

  const allApproved = totalRequired > 0 && approvedCount >= totalRequired;

  const handleFileSelect = async (docType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocId(docType.id);
    setUploadError(null);

    const res = await uploadStudentEnrollmentDocument(student.id, docType.id, file);
    setUploadingDocId(null);

    if (!res.success) {
      setUploadError(`Erro ao enviar ${docType.title}: ${res.error}`);
    }

    // Reseta o input para permitir selecionar o mesmo arquivo novamente se desejar
    if (fileInputRefs.current[docType.id]) {
      fileInputRefs.current[docType.id].value = '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos de Matrícula"
        subtitle={`Seminário Teológico Aliança · Bacharel em Teologia · Turma ${student.year || '2027'}`}
      />

      {/* Banner de Status Geral */}
      {allApproved ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-5 shadow-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base">Documentação Regularizada!</h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Todos os documentos obrigatórios exigidos pela Direção Geral foram conferidos e homologados com sucesso.
            </p>
          </div>
        </div>
      ) : (
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Progresso da Documentação
              </span>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {approvedCount} de {totalRequired} documentos obrigatórios aprovados
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {inReviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                  <Clock className="h-3.5 w-3.5" /> {inReviewCount} em análise
                </span>
              )}
              {rejectedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold animate-pulse">
                  <AlertCircle className="h-3.5 w-3.5" /> {rejectedCount} precisa de reenvio
                </span>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-4 h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0}%` }}
            />
          </div>
        </Card>
      )}

      {uploadError && (
        <Callout type="danger" title="Erro no envio">
          {uploadError}
        </Callout>
      )}

      {/* Lista de Documentos Solicitados */}
      <div className="grid grid-cols-1 gap-4">
        {docTypes.length === 0 ? (
          <Card className="p-8 text-center text-stone-500">
            Nenhum documento de matrícula foi solicitado pela Direção no momento.
          </Card>
        ) : (
          docTypes.map((doc) => {
            const submission = studentDocs[doc.id];
            const isUploading = uploadingDocId === doc.id;

            return (
              <Card key={doc.id} className="p-5 transition hover:border-amber-400/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Informações do Documento */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
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

                      {/* Status Badge */}
                      {submission?.status === 'aprovado' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                          <CheckCircle2 className="h-3 w-3" /> Aprovado
                        </span>
                      )}
                      {submission?.status === 'em_analise' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-300/40">
                          <Clock className="h-3 w-3" /> Em Análise pela Direção
                        </span>
                      )}
                      {submission?.status === 'rejeitado' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-300/40">
                          <AlertTriangle className="h-3 w-3" /> Reenvio Solicitado
                        </span>
                      )}
                      {!submission && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                          Pendente de envio
                        </span>
                      )}
                    </div>

                    {doc.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {doc.description}
                      </p>
                    )}

                    {/* Mensagem de Rejeição da Direção */}
                    {submission?.status === 'rejeitado' && submission.notes && (
                      <div className="mt-2 p-2.5 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-200">
                        <span className="font-bold block">Motivo informado pela Direção:</span>
                        <p className="mt-0.5 italic">“{submission.notes}”</p>
                      </div>
                    )}

                    {/* Detalhes do Arquivo Já Enviado */}
                    {submission && (
                      <div className="flex items-center gap-3 pt-1 text-xs text-stone-500 dark:text-stone-400">
                        <span className="font-mono flex items-center gap-1 truncate max-w-[220px]">
                          <FileText className="h-3.5 w-3.5 text-stone-400" />
                          {submission.fileName}
                        </span>
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                        >
                          <ExternalLink className="h-3 w-3" /> Visualizar
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Ação de Upload */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[doc.id] = el)}
                      onChange={(e) => handleFileSelect(doc, e)}
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      className="hidden"
                    />

                    <Button
                      size="sm"
                      variant={submission?.status === 'aprovado' ? 'secondary' : 'primary'}
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      className="whitespace-nowrap"
                    >
                      {isUploading ? (
                        <>Enviando...</>
                      ) : submission?.status === 'aprovado' ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" /> Substituir
                        </>
                      ) : submission ? (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Reenviar Arquivo
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Enviar Documento
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
