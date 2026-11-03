import React, { useState, useEffect } from 'react';
import { Save, UserCheck, Key, GraduationCap, UserRound } from 'lucide-react';
import { Modal, Button, Field, Input, Select } from '../ui';
import { COURSES } from '../../data/seed';

export function EditUserModal({ open, onClose, user, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('Prof.');
  const [enrollment, setEnrollment] = useState('');
  const [year, setYear] = useState('1º ano');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword(user.password || '');
      setTitle(user.title || 'Prof.');
      setEnrollment(user.enrollment || '');
      setYear(user.year || '1º ano');
    }
  }, [user, open]);

  if (!user) return null;

  const isProfessor = user.role === 'professor';
  const isStudent = user.role === 'aluno';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      ...user,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || 'seta123',
      title: isProfessor ? title : null,
      enrollment: isStudent ? enrollment.trim() : null,
      course: 'Bacharel em Teologia',
      year: isStudent ? year : null,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isProfessor ? `Editar Professor: ${user.name}` : `Editar Aluno: ${user.name}`}
      description="Atualize os dados cadastrais, e-mail institucional ou redefina a senha de acesso."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300">
          {isProfessor ? <UserRound className="h-4 w-4 text-brand-600" /> : <GraduationCap className="h-4 w-4 text-brand-600" />}
          <span>{isProfessor ? 'Perfil Docente (Professor)' : 'Perfil Discente (Aluno do Bacharel)'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isProfessor && (
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
            className={isProfessor ? 'sm:col-span-2' : 'sm:col-span-3'}
          >
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="E-mail de Login">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Senha de Acesso" hint="Altere para redefinir o acesso">
            <Input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        {isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Field label="Matrícula">
              <Input
                required
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
              />
            </Field>

            <Field label="Curso" className="sm:col-span-1">
              <Input
                disabled
                value="Bacharel em Teologia"
                className="bg-stone-50 dark:bg-stone-800/50 cursor-not-allowed text-stone-500"
              />
            </Field>

            <Field label="Ano / Período">
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="1º ano">1º ano</option>
                <option value="2º ano">2º ano</option>
                <option value="3º ano">3º ano</option>
                <option value="4º ano">4º ano</option>
              </Select>
            </Field>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
