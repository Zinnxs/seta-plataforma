import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { LessonList } from '../../components/LessonList';
import { Button, DisciplineSelect, Field, Input, Modal, PageHeader, Tabs, Textarea } from '../../components/ui';

export function ProfessorLessons({ discipline, disciplines, onChangeDiscipline }) {
  const { data, addLesson, updateLesson, deleteLesson } = useStore();
  const [creating, setCreating] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const lessons = data.lessons.filter((l) => l.disciplineId === discipline.id);

  return (
    <>
      <PageHeader
        title="Aulas e materiais"
        subtitle="Publique, edite e gerencie aulas gravadas, links de aulas ao vivo e apostilas."
        actions={
          <>
            <DisciplineSelect disciplines={disciplines} value={discipline.id} onChange={onChangeDiscipline} />
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Nova aula
            </Button>
          </>
        }
      />

      <LessonList
        lessons={lessons}
        onEdit={(l) => setEditingLesson(l)}
        onDelete={(id) => deleteLesson(id)}
      />

      {(creating || editingLesson) && (
        <LessonFormModal
          discipline={discipline}
          lesson={editingLesson}
          modules={[...new Set(lessons.map((l) => l.module))]}
          onClose={() => {
            setCreating(false);
            setEditingLesson(null);
          }}
          onSave={(l) => {
            if (editingLesson) {
              updateLesson(l);
            } else {
              addLesson(l);
            }
            setCreating(false);
            setEditingLesson(null);
          }}
        />
      )}
    </>
  );
}

function LessonFormModal({ discipline, lesson, modules, onClose, onSave }) {
  const isEditing = Boolean(lesson);
  const [kind, setKind] = useState(lesson?.kind || 'gravada');
  const [form, setForm] = useState({
    module: lesson?.module ?? (modules[modules.length - 1] ?? 'Módulo 1'),
    title: lesson?.title ?? '',
    date: lesson?.date ?? new Date().toISOString().slice(0, 10),
    duration: lesson?.duration ?? '',
    url: lesson?.url ?? '',
    summary: lesson?.summary ?? '',
    materials: lesson?.materials
      ? lesson.materials.map((m) => (typeof m === 'string' ? m : m.name)).join('\n')
      : '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim() && form.date;

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar aula' : 'Nova aula'}
      description={`${discipline.code} · ${discipline.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSave({
                id: lesson?.id || `les-${Date.now()}`,
                disciplineId: discipline.id,
                module: form.module.trim() || 'Geral',
                title: form.title.trim(),
                date: form.date,
                duration: form.duration.trim() || (kind === 'ao_vivo' ? '19h30' : '—'),
                kind,
                url: form.url.trim(),
                summary: form.summary.trim(),
                materials: form.materials
                  .split('\n')
                  .map((m) => m.trim())
                  .filter(Boolean)
                  .map((name) => ({ name })),
              })
            }
          >
            {isEditing ? 'Salvar alterações' : 'Publicar aula'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Tabs
          value={kind}
          onChange={setKind}
          tabs={[
            { id: 'gravada', label: 'Aula gravada' },
            { id: 'ao_vivo', label: 'Aula ao vivo' },
          ]}
        />
        <Field label="Módulo">
          <Input value={form.module} onChange={set('module')} list="modules" />
          <datalist id="modules">
            {modules.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>
        <Field label="Título da aula">
          <Input value={form.title} onChange={set('title')} placeholder="Ex.: A justificação pela fé" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data">
            <Input type="date" value={form.date} onChange={set('date')} />
          </Field>
          <Field label={kind === 'ao_vivo' ? 'Horário' : 'Duração'}>
            <Input value={form.duration} onChange={set('duration')} placeholder={kind === 'ao_vivo' ? '19h30' : '1h30'} />
          </Field>
        </div>
        <Field
          label={kind === 'ao_vivo' ? 'Link da sala (Google Meet / Zoom)' : 'Link do vídeo (YouTube não listado / Vimeo)'}
        >
          <Input value={form.url} onChange={set('url')} placeholder="https://" />
        </Field>
        <Field label="Resumo">
          <Textarea rows={2} value={form.summary} onChange={set('summary')} />
        </Field>
        <Field label="Materiais" hint="Um por linha. Na versão final, os arquivos serão anexados aqui.">
          <Textarea rows={2} value={form.materials} onChange={set('materials')} placeholder="Apostila — Módulo 3.pdf" />
        </Field>
      </div>
    </Modal>
  );
}
