import React, { useState, useEffect } from 'react';
import { FilePlus, FileText, CheckCircle2 } from 'lucide-react';
import { Modal, Button, Field, Input } from '../ui';

export function NewEnrollmentDocModal({ open, onClose, docToEdit, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(true);

  useEffect(() => {
    if (docToEdit) {
      setTitle(docToEdit.title || '');
      setDescription(docToEdit.description || '');
      setRequired(docToEdit.required !== false);
    } else {
      setTitle('');
      setDescription('');
      setRequired(true);
    }
  }, [docToEdit, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: docToEdit?.id || `doc-${Date.now().toString(36)}`,
      title: title.trim(),
      description: description.trim(),
      required,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={docToEdit ? 'Editar Documento Exigido' : 'Adicionar Novo Documento de Matrícula'}
      description="Configure os detalhes do documento que os alunos deverão anexar na matrícula."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome do Documento" hint="Ex: Certidão de Nascimento / Casamento">
          <Input
            required
            placeholder="Ex: Documento de Identidade com Foto (RG ou CNH)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Instruções para o Aluno" hint="Orientações sobre o envio">
          <Input
            placeholder="Ex: Frente e verso legível em formato PDF ou imagem nítida."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40">
          <input
            id="doc-required-toggle"
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="doc-required-toggle" className="text-xs cursor-pointer select-none">
            <span className="font-semibold text-stone-900 dark:text-stone-100 block">
              Documento de envio obrigatório
            </span>
            <span className="text-stone-500 dark:text-stone-400 block mt-0.5">
              Se desmarcado, constará como documento opcional ou complementar.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {docToEdit ? 'Salvar Alterações' : 'Adicionar Documento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
