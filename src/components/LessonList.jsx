import { useState } from 'react';
import { ExternalLink, FileText, Paperclip, PlayCircle, Radio, Video, Pencil, Trash2 } from 'lucide-react';
import { fmtDate } from '../lib/format';
import { Badge, Button, Card, EmptyState, Modal } from './ui';

/** Lista de aulas agrupadas por módulo (usada por professor e aluno) */
export function LessonList({ lessons, showDiscipline, disciplines = [], onEdit, onDelete }) {
  const [open, setOpen] = useState(null);

  if (!lessons.length) {
    return (
      <Card>
        <EmptyState icon={Video} title="Nenhuma aula publicada" text="As aulas e materiais aparecerão aqui." />
      </Card>
    );
  }

  const sorted = [...lessons].sort((a, b) => a.date.localeCompare(b.date));
  const groups = sorted.reduce((acc, l) => {
    const key = showDiscipline ? disciplines.find((d) => d.id === l.disciplineId)?.name ?? '' : l.module;
    (acc[key] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([group, items]) => (
        <section key={group}>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">{group}</h2>
          <Card className="divide-y divide-stone-100 dark:divide-stone-800">
            {items.map((l) => {
              const live = l.kind === 'ao_vivo';
              return (
                <div key={l.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <span
                    className={
                      live
                        ? 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300'
                    }
                  >
                    {live ? <Radio className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-stone-800 dark:text-stone-100">{l.title}</p>
                      {live && <Badge tone="red">Ao vivo</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {fmtDate(l.date, { day: '2-digit', month: 'short', weekday: 'short' })} · {live ? `às ${l.duration}` : l.duration}
                      {showDiscipline ? ` · ${l.module}` : ''}
                      {l.materials?.length ? ` · ${l.materials.length} material(is)` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => setOpen(l)}>
                      {live ? 'Ver detalhes' : 'Assistir'}
                    </Button>
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(l)} title="Editar aula">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline ml-1">Editar</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir a aula "${l.title}"?`)) {
                            onDelete(l.id);
                          }
                        }}
                        title="Excluir aula"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      ))}

      <LessonViewer lesson={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function embedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function LessonViewer({ lesson, onClose }) {
  if (!lesson) return null;
  const live = lesson.kind === 'ao_vivo';
  const embed = embedUrl(lesson.url);

  return (
    <Modal open onClose={onClose} title={lesson.title} description={lesson.module} size="lg">
      <div className="space-y-5">
        {live ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-stone-50 px-6 py-10 text-center dark:bg-stone-800/40">
            <Radio className="h-6 w-6 text-rose-500" />
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Aula ao vivo em {fmtDate(lesson.date, { day: '2-digit', month: 'long' })}, às {lesson.duration}.
            </p>
            {lesson.url && (
              <a href={lesson.url} target="_blank" rel="noreferrer">
                <Button>
                  Entrar na sala <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        ) : embed ? (
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            <iframe src={embed} title={lesson.title} className="h-full w-full" allowFullScreen />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl bg-stone-100 text-stone-400 dark:bg-stone-800/50 dark:text-stone-500">
            <PlayCircle className="h-10 w-10" strokeWidth={1.25} />
            <p className="text-xs">Player de vídeo (YouTube não listado ou Vimeo)</p>
          </div>
        )}

        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{lesson.summary}</p>

        {lesson.materials?.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <Paperclip className="h-3.5 w-3.5" /> Materiais
            </p>
            <div className="space-y-1.5">
              {lesson.materials.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 px-3 py-2 text-sm dark:border-stone-800"
                >
                  <FileText className="h-4 w-4 text-stone-400" />
                  <span className="flex-1 truncate text-stone-700 dark:text-stone-200">{m.name}</span>
                  {m.size && <span className="text-xs text-stone-400">{m.size}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
