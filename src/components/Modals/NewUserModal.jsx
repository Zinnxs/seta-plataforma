import React, { useState } from 'react';
import { X, UserPlus, GraduationCap, UserRound, Key } from 'lucide-react';
import { Modal, Button, Field, Input, Select, Callout } from '../ui';
import { COURSES } from '../../data/seed';

export function NewUserModal({ open, onClose, onSave, defaultRole = 'aluno' }) {
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('seta123');
  const [title, setTitle] = useState('Prof.');
  const [enrollment, setEnrollment] = useState(`2027-${Math.floor(1000 + Math.random() * 9000)}`);
  const [course, setCourse] = useState(COURSES[0]);
  const [turmaOption, setTurmaOption] = useState('2027');
  const [customYear, setCustomYear] = useState('');

  const handleTurmaChange = (val) => {
    setTurmaOption(val);
    if (val === '2027') {
      setEnrollment(`2027-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (val === '2026') {
      setEnrollment(`2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const id = `${role === 'professor' ? 'prof' : 'stu'}-${Date.now().toString(36)}`;
    const finalYear = turmaOption === 'custom' ? (customYear.trim() || '2027') : turmaOption;

    onSave({
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || 'seta123',
      role,
      title: role === 'professor' ? title : null,
      enrollment: role === 'aluno' ? enrollment : null,
      course: role === 'aluno' ? course : null,
      year: role === 'aluno' ? finalYear : null,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={role === 'professor' ? 'Cadastrar Novo Professor' : 'Cadastrar Novo Aluno'}
      description="Crie o perfil oficial e defina o e-mail e a senha de acesso ao sistema."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alternador de Tipo de Usuário */}
        <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => setRole('aluno')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              role === 'aluno'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Aluno
          </button>
          <button
            type="button"
            onClick={() => setRole('professor')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              role === 'professor'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <UserRound className="h-3.5 w-3.5" /> Professor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {role === 'professor' && (
            <Field label="Titulação">
              <Select value={title} onChange={(e) => setTitle(e.target.value)}>
                <option value="Prof.">Prof.</option>
                <option value="Profª.">Profª.</option>
                <option value="Pr.">Pr.</option>
                <option value="Prof. Me.">Prof. Me.</option>
                <option value="Prof. Dr.">Prof. Dr.</option>
                <option value="Rev.">Rev.</option>
                <option value="Missionário">Missionário</option>
              </Select>
            </Field>
          )}

          <Field
            label="Nome Completo"
            className={role === 'professor' ? 'sm:col-span-2' : 'sm:col-span-3'}
          >
            <Input
              required
              placeholder={role === 'professor' ? 'Ex.: Carlos Alberto Souza' : 'Ex.: Mateus Oliveira'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="E-mail de Login">
            <Input
              type="email"
              required
              placeholder="nome@seta.edu.br ou email pessoal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Senha Provisória de Acesso" hint="Padrão sugerido: seta123">
            <Input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        {role === 'aluno' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Field label="Matrícula">
                <Input
                  required
                  value={enrollment}
                  onChange={(e) => setEnrollment(e.target.value)}
                />
              </Field>

              <Field label="Ano Letivo / Turma" hint="Define envio de documentos" className="sm:col-span-2">
                <Select
                  value={turmaOption}
                  onChange={(e) => handleTurmaChange(e.target.value)}
                >
                  <option value="2027">Turma 2027 (Ingressante)</option>
                  <option value="2026">Turma 2026</option>
                  <option value="custom">Outra turma / ano específico...</option>
                </Select>
              </Field>
            </div>

            {turmaOption === 'custom' && (
              <Field label="Digite o Ano Letivo / Turma Customizada" hint="Ex: 2028, 2º ano, etc.">
                <Input
                  required
                  placeholder="Ex: 2028"
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                />
              </Field>
            )}

            <Field label="Curso">
              <Input
                disabled
                value="Bacharel em Teologia (Curso Único)"
                className="bg-stone-50 dark:bg-stone-800/50 cursor-not-allowed text-stone-600 dark:text-stone-300 font-medium"
              />
            </Field>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            <UserPlus className="h-4 w-4" /> Cadastrar {role === 'professor' ? 'Professor' : 'Aluno'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
