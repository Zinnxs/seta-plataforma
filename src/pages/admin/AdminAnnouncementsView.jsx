import React, { useState } from 'react';
import { Bell, Plus, Pencil, Trash2, Calendar, AlertCircle, Megaphone } from 'lucide-react';
import { fmtDate } from '../../lib/format';
import { 
  Badge, 
  Button, 
  Card, 
  EmptyState, 
  Field, 
  Input, 
  Modal, 
  PageHeader, 
  Textarea 
} from '../../components/ui';

export function AdminAnnouncementsView({ announcements, onAdd, onUpdate, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <>
      <PageHeader
        title="Quadro de Avisos Acadêmicos"
        subtitle="Gerenciamento exclusivo da Direção: publique comunicados oficiais para professores e alunos."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Novo comunicado
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="Nenhum comunicado publicado"
            text="O quadro de avisos está vazio. Clique em 'Novo comunicado' para publicar um aviso institucional."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md">
                    {ann.author || 'Direção Geral'}
                  </span>
                  {ann.important && (
                    <Badge tone="red" className="gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> Urgente / Importante
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                    <Calendar className="h-3 w-3" /> {fmtDate(ann.date)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditing(ann)}
                    title="Editar comunicado"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir o comunicado "${ann.title}"?`)) {
                        onDelete(ann.id);
                      }
                    }}
                    title="Excluir comunicado"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{ann.title}</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <AnnouncementModal
          announcement={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(ann) => {
            if (editing) {
              onUpdate(ann);
            } else {
              onAdd(ann);
            }
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function AnnouncementModal({ announcement, onClose, onSave }) {
  const isEditing = Boolean(announcement);
  const [form, setForm] = useState({
    title: announcement?.title || '',
    author: announcement?.author || 'Direção Geral',
    date: announcement?.date || new Date().toISOString().slice(0, 10),
    content: announcement?.content || '',
    important: announcement?.important ?? false,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim() && form.content.trim() && form.date;

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar Comunicado Oficial' : 'Novo Comunicado Oficial'}
      description="Este comunicado ficará visível no mural de avisos de alunos e professores."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSave({
                id: announcement?.id || `ann-${Date.now()}`,
                title: form.title.trim(),
                author: form.author.trim() || 'Direção Geral',
                date: form.date,
                content: form.content.trim(),
                important: Boolean(form.important),
              })
            }
          >
            {isEditing ? 'Salvar alterações' : 'Publicar comunicado'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título do Comunicado">
          <Input
            value={form.title}
            onChange={set('title')}
            placeholder="Ex.: Início das Rematrículas — Período 2026.2"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Órgão emissor / Autor">
            <Input
              value={form.author}
              onChange={set('author')}
              list="ann-authors"
              placeholder="Direção Geral"
              required
            />
            <datalist id="ann-authors">
              <option value="Direção Geral" />
              <option value="Secretaria Acadêmica" />
              <option value="Coordenação Teológica" />
              <option value="Reitoria" />
            </datalist>
          </Field>

          <Field label="Data da publicação">
            <Input
              type="date"
              value={form.date}
              onChange={set('date')}
              required
            />
          </Field>
        </div>

        <Field label="Mensagem do Comunicado">
          <Textarea
            rows={5}
            value={form.content}
            onChange={set('content')}
            placeholder="Escreva as informações detalhadas que os alunos e professores devem saber..."
            required
          />
        </Field>

        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={form.important}
              onChange={(e) => setForm((f) => ({ ...f, important: e.target.checked }))}
              className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 dark:border-stone-700 dark:bg-stone-800"
            />
            <span>Destacar como comunicado urgente / prioritário</span>
          </label>
          <p className="text-xs text-stone-400 mt-1 ml-6">
            Avisos urgentes ganham uma etiqueta vermelha em destaque para todos os alunos e professores.
          </p>
        </div>
      </div>
    </Modal>
  );
}
