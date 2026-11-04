import React, { useState, useEffect } from 'react';
import { Save, BookOpen } from 'lucide-react';
import { Modal, Button, Field, Input, Select } from '../ui';
import { personName } from '../../lib/format';

export function EditDisciplineModal({ open, onClose, discipline, professors, onSave }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [workload, setWorkload] = useState('60');
  const [schedule, setSchedule] = useState('');
  const [status, setStatus] = useState('em_andamento');

  useEffect(() => {
    if (discipline) {
      setCode(discipline.code || '');
      setName(discipline.name || '');
      setProfessorId(discipline.professorId || professors[0]?.id || '');
      setWorkload(String(discipline.workload || '60'));
      setSchedule(discipline.schedule || '');
      setStatus(discipline.status || (discipline.gradesClosed ? 'concluida' : 'em_andamento'));
    }
  }, [discipline, open, professors]);

  if (!discipline) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !professorId) return;

    onSave({
      ...discipline,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      professorId,
      workload: Number(workload) || 60,
      schedule: schedule.trim(),
      course: 'Bacharel em Teologia',
      status,
      gradesClosed: status === 'concluida',
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar Disciplina: ${discipline.name}`}
      description="Altere o código, o nome, o professor responsável ou o horário das aulas."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Código">
            <Input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex.: TEO-102"
            />
          </Field>

          <Field label="Nome da Disciplina" className="sm:col-span-2">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da matéria"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Professor Responsável">
            {professors.length === 0 ? (
              <p className="text-xs text-rose-500 py-2">
                Nenhum professor cadastrado. Cadastre um professor primeiro.
              </p>
            ) : (
              <Select
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
                required
              >
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {personName(p)}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Curso">
            <Input
              disabled
              value="Bacharel em Teologia (Curso Único)"
              className="bg-stone-50 dark:bg-stone-800/50 cursor-not-allowed text-stone-600 dark:text-stone-300 font-medium"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Carga Horária (h)">
            <Input
              type="number"
              min="15"
              step="15"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
            />
          </Field>

          <Field label="Horário das Aulas">
            <Input
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Ex.: Terças, 19h30"
            />
          </Field>

          <Field label="Situação / Arquivo">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="em_andamento">Em andamento (Ativa)</option>
              <option value="concluida">Concluída (Arquivo)</option>
              <option value="futura">Futura (Planejada)</option>
            </Select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" /> Salvar Matéria
          </Button>
        </div>
      </form>
    </Modal>
  );
}
