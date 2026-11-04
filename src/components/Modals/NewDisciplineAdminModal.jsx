import React, { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Modal, Button, Field, Input, Select } from '../ui';
import { COURSES } from '../../data/seed';
import { personName } from '../../lib/format';

export function NewDisciplineAdminModal({ open, onClose, onSave, professors }) {
  const [code, setCode] = useState('TEO-102');
  const [name, setName] = useState('');
  const [professorId, setProfessorId] = useState(professors[0]?.id || '');
  const [course, setCourse] = useState(COURSES[0]);
  const [workload, setWorkload] = useState('60');
  const [schedule, setSchedule] = useState('Segundas, 19h30');
  const [passingGrade, setPassingGrade] = useState('7.0');
  const [status, setStatus] = useState('em_andamento');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !professorId) return;

    const id = `disc-${Date.now().toString(36)}`;

    // Critérios padrão somando 10,0 pontos
    const defaultEvaluations = [
      { id: `ev-${id}-1`, name: 'Prova 1', type: 'prova', maxPoints: 3.0 },
      { id: `ev-${id}-2`, name: 'Trabalho Teológico', type: 'trabalho', maxPoints: 3.0 },
      { id: `ev-${id}-3`, name: 'Avaliação Final', type: 'prova', maxPoints: 4.0 },
    ];

    onSave({
      id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      professorId,
      course,
      workload: Number(workload) || 60,
      schedule: schedule.trim(),
      passingGrade: Number(passingGrade) || 7.0,
      maxAbsences: Math.round((Number(workload) || 60) * 0.25),
      recoveryRule: 'substitui_menor',
      gradesClosed: status === 'concluida',
      status,
      evaluations: defaultEvaluations,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cadastrar Nova Disciplina / Matéria"
      description="Crie uma nova matéria no curso e vincule ao professor responsável."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Código da Matéria">
            <Input
              required
              placeholder="Ex.: TEO-102"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>

          <Field label="Nome da Disciplina" className="sm:col-span-2">
            <Input
              required
              placeholder="Ex.: Teologia Sistemática II"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <Field label="Status da Matéria">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="em_andamento">Em andamento (Ativa)</option>
              <option value="concluida">Concluída (Arquivo)</option>
              <option value="futura">Futura (Planejada)</option>
            </Select>
          </Field>
        </div>

        <p className="text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          * A matéria será criada com pontuação somada padrão de 10,0 pontos (Prova 1: 3,0 pts, Trabalho: 3,0 pts, Avaliação Final: 4,0 pts) e nota somada mínima de 7,0 pontos. Você poderá editar os critérios a qualquer momento na aba de critérios.
        </p>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!professors.length || !name.trim()}>
            <Plus className="h-4 w-4" /> Cadastrar Matéria
          </Button>
        </div>
      </form>
    </Modal>
  );
}
