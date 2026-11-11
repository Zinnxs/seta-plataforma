import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, FileText, Download, XCircle } from 'lucide-react';
import { Modal, Button, Field } from '../ui';

export function ReviewDocumentModal({ open, onClose, student, docType, submission, onSave }) {
  const [status, setStatus] = useState('aprovado');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (submission) {
      setStatus(submission.status === 'rejeitado' ? 'rejeitado' : 'aprovado');
      setNotes(submission.notes || '');
    } else {
      setStatus('aprovado');
      setNotes('');
    }
  }, [submission, open]);

  if (!student || !docType || !submission) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student.id, docType.id, status, notes.trim());
    onClose();
  };

  const isImage = submission.fileName?.match(/\.(jpeg|jpg|png|webp)$/i) || submission.fileUrl?.match(/\.(jpeg|jpg|png|webp)/i);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Avaliação de Documento de Matrícula"
      description={`Análise do envio realizado por ${student.name} (${student.enrollment || 'Aluno'}).`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Detalhes do Aluno e Documento */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-stone-400 font-medium">Documento solicitado:</span>
              <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                {docType.title}
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              Turma {student.year || '2027'}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <span className="font-mono truncate max-w-[200px]" title={submission.fileName}>
                {submission.fileName}
              </span>
            </div>
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500 font-semibold text-xs shadow-sm transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-600" /> Abrir Arquivo
            </a>
          </div>
        </div>

        {/* Pré-visualização caso seja imagem */}
        {isImage && (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-2 bg-black/5 dark:bg-black/30 flex justify-center max-h-48 overflow-hidden">
            <img
              src={submission.fileUrl}
              alt={submission.fileName}
              className="max-h-44 object-contain rounded-lg"
            />
          </div>
        )}

        {/* Decisão de Avaliação */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
            Decisão da Direção:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('aprovado')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition text-left cursor-pointer ${
                status === 'aprovado'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${status === 'aprovado' ? 'text-emerald-600' : 'text-stone-400'}`} />
              <div>
                <div>Aprovar Documento</div>
                <div className="text-[10px] font-normal opacity-80">Documento legível e válido</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('rejeitado')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition text-left cursor-pointer ${
                status === 'rejeitado'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <XCircle className={`h-4 w-4 ${status === 'rejeitado' ? 'text-rose-600' : 'text-stone-400'}`} />
              <div>
                <div>Solicitar Reenvio</div>
                <div className="text-[10px] font-normal opacity-80">Ilegível ou incompleto</div>
              </div>
            </button>
          </div>
        </div>

        {/* Campo de Justificativa / Observação */}
        <Field
          label={status === 'rejeitado' ? 'Motivo da Recusa (Obrigatório)' : 'Observação Interna ou Elogio (Opcional)'}
          hint={status === 'rejeitado' ? 'Esta mensagem será exibida na tela do aluno orientando a correção.' : ''}
        >
          <textarea
            required={status === 'rejeitado'}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              status === 'rejeitado'
                ? 'Ex: O documento está ilegível ou cortado. Por favor, envie uma foto nítida de frente e verso.'
                : 'Ex: Documento conferido e aprovado pela secretaria.'
            }
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-3 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className={status === 'rejeitado' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
          >
            Confirmar Decisão
          </Button>
        </div>
      </form>
    </Modal>
  );
}
