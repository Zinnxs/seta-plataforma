/**
 * Estado global do SETA (Seminário Teológico Aliança) com suporte Híbrido:
 * - Se Supabase estiver configurado: sincroniza diretamente com o banco PostgreSQL na nuvem.
 * - Se não estiver configurado: opera em cache localStorage local.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeed } from '../data/seed';
import { supabase, isSupabaseConfigured, saveSupabaseCredentials, credentialsSource } from './supabase';

const DATA_KEY = 'seta-prod-v5';
const SESSION_KEY = 'seta-session-v5';

const Ctx = createContext(null);

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback();
  } catch {
    return fallback();
  }
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => loadLocal(DATA_KEY, createSeed));
  const [session, setSession] = useState(() => loadLocal(SESSION_KEY, () => null));
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'syncing' : 'local_only');
  const [lastSyncError, setLastSyncError] = useState(null);

  // Salva no cache local do navegador sempre que houver alteração
  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  // Carrega dados iniciais do Supabase se estiver configurado
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local_only');
      return;
    }

    let isMounted = true;
    async function loadFromSupabase() {
      try {
        setSyncStatus('syncing');

        const [
          { data: usersData, error: uErr },
          { data: discData, error: dErr },
          { data: gradesData, error: gErr },
          { data: assignData, error: aErr },
          { data: lessonsData, error: lErr },
          { data: annData, error: anErr },
        ] = await Promise.all([
          supabase.from('seta_users').select('*'),
          supabase.from('seta_disciplines').select('*'),
          supabase.from('seta_grades').select('*'),
          supabase.from('seta_assignments').select('*'),
          supabase.from('seta_lessons').select('*'),
          supabase.from('seta_announcements').select('*'),
        ]);

        if (uErr) {
          console.error('Erro ao ler tabela seta_users do Supabase:', uErr);
          if (isMounted) {
            setSyncStatus('error');
            setLastSyncError(`Tabela seta_users: ${uErr.message}`);
          }
          return;
        }

        if (dErr) {
          console.error('Erro ao ler tabela seta_disciplines do Supabase:', dErr);
          if (isMounted) {
            setSyncStatus('error');
            setLastSyncError(`Tabela seta_disciplines: ${dErr.message}`);
          }
          return;
        }

        const professors = (usersData || [])
          .filter((u) => u.role === 'professor')
          .map((u) => ({ ...u, password: u.password || 'seta123' }));
        const admins = (usersData || [])
          .filter((u) => u.role === 'admin')
          .map((u) => ({ ...u, password: u.password || 'setaadmin987' }));
        const students = (usersData || [])
          .filter((u) => u.role === 'aluno')
          .map((u) => ({ ...u, password: u.password || 'seta123' }));

        const disciplines = (discData || []).map((d) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          professorId: d.professor_id,
          course: d.course || 'Bacharel em Teologia',
          workload: d.workload,
          schedule: d.schedule,
          passingGrade: Number(d.passing_grade),
          maxAbsences: d.max_absences,
          recoveryRule: d.recovery_rule,
          gradesClosed: d.grades_closed,
          status: d.status || (d.grades_closed ? 'concluida' : 'em_andamento'),
          evaluations: d.evaluations || [],
        }));

        const grades = {};
        disciplines.forEach((d) => {
          grades[d.id] = {};
        });

        (gradesData || []).forEach((row) => {
          if (!grades[row.discipline_id]) grades[row.discipline_id] = {};
          grades[row.discipline_id][row.student_id] = {
            scores: row.scores || {},
            recovery: row.recovery !== null ? Number(row.recovery) : null,
            absences: row.absences || 0,
          };
        });

        // Preenche alunos sem nota registrada com objeto vazio
        disciplines.forEach((d) => {
          students.forEach((s) => {
            if (!grades[d.id][s.id]) {
              grades[d.id][s.id] = { scores: {}, recovery: null, absences: 0 };
            }
          });
        });

        const assignments = (assignData || []).map((a) => ({
          id: a.id,
          disciplineId: a.discipline_id,
          evaluationId: a.evaluation_id,
          title: a.title,
          description: a.description,
          dueDate: a.due_date,
          submissionType: a.submission_type || 'upload',
          destinationEmail: a.destination_email || null,
          customInstructions: a.custom_instructions || null,
          submissions: a.submissions || [],
        }));

        const lessons = (lessonsData || []).map((l) => ({
          id: l.id,
          disciplineId: l.discipline_id,
          module: l.module,
          title: l.title,
          date: l.date,
          duration: l.duration,
          kind: l.kind,
          url: l.url,
          summary: l.summary,
          materials: l.materials || [],
        }));

        const announcements = (annData || []).map((an) => ({
          id: an.id,
          date: an.date,
          author: an.author,
          title: an.title,
          content: an.content,
          important: an.important,
        }));

        if (isMounted) {
          setData((prev) => ({
            ...prev,
            professors,
            admins: admins.length > 0 ? admins : prev.admins,
            students,
            disciplines,
            grades,
            assignments,
            lessons,
            announcements: anErr ? prev.announcements : announcements,
          }));
          setSyncStatus('synced');
          setLastSyncError(null);
        }
      } catch (err) {
        console.error('Falha de conexão com Supabase:', err);
        if (isMounted) {
          setSyncStatus('error');
          setLastSyncError(err.message);
        }
      }
    }

    loadFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentUser = useMemo(() => {
    if (!session) return null;
    const pool =
      session.role === 'aluno' ? data.students : session.role === 'professor' ? data.professors : data.admins;
    return pool.find((u) => u.id === session.userId) || null;
  }, [session, data]);

  /** Aplica alteração local com resposta imediata e sincroniza em segundo plano */
  const update = (fn) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  // Funções assíncronas para sincronização com Supabase
  const syncGradeToSupabase = async (discId, studentId, record) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_grades').upsert(
        {
          discipline_id: discId,
          student_id: studentId,
          scores: record.scores,
          recovery: record.recovery,
          absences: record.absences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'discipline_id,student_id' }
      );
      if (error) {
        console.error('Erro ao salvar nota no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao salvar nota no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncDisciplineToSupabase = async (disc) => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase não conectado. Disciplina salva apenas no cache local deste navegador.');
      return;
    }
    try {
      setSyncStatus('syncing');
      const basePayload = {
        id: disc.id,
        code: disc.code,
        name: disc.name,
        professor_id: disc.professorId,
        course: disc.course || 'Bacharel em Teologia',
        workload: disc.workload,
        schedule: disc.schedule,
        passing_grade: disc.passingGrade,
        max_absences: disc.maxAbsences,
        recovery_rule: disc.recoveryRule,
        grades_closed: disc.status === 'concluida' ? true : Boolean(disc.gradesClosed),
        evaluations: disc.evaluations,
      };

      // Tenta salvar com o campo status
      const { error } = await supabase.from('seta_disciplines').upsert({
        ...basePayload,
        status: disc.status || 'em_andamento',
      });

      if (error) {
        // Se a coluna status ainda não existir na tabela remota do Supabase, tenta sem a coluna
        if (error.message && error.message.toLowerCase().includes('status')) {
          console.warn('Coluna status não encontrada no Supabase. Salvando compatibilidade...');
          const { error: errFallback } = await supabase.from('seta_disciplines').upsert(basePayload);
          if (errFallback) {
            console.error('Erro ao salvar disciplina no Supabase:', errFallback);
            setSyncStatus('error');
            setLastSyncError(`Erro ao salvar matéria: ${errFallback.message}`);
            return;
          }
        } else {
          console.error('Erro ao salvar disciplina no Supabase:', error);
          setSyncStatus('error');
          setLastSyncError(`Erro ao salvar matéria: ${error.message}`);
          return;
        }
      }

      setSyncStatus('synced');
      setLastSyncError(null);
    } catch (e) {
      console.warn('Erro ao salvar disciplina no Supabase:', e);
      setSyncStatus('error');
      setLastSyncError(e.message);
    }
  };

  const syncUserToSupabase = async (user) => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase não conectado. Usuário salvo apenas no cache local deste navegador.');
      return;
    }
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_users').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title || null,
        enrollment: user.enrollment || null,
        course: user.course || 'Bacharel em Teologia',
        year: user.year || null,
        password: user.password || 'seta123',
      });

      if (error) {
        console.error('Erro ao salvar usuário no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(`Erro ao salvar usuário: ${error.message}`);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    } catch (e) {
      console.warn('Erro ao salvar usuário no Supabase:', e);
      setSyncStatus('error');
      setLastSyncError(e.message);
    }
  };

  const deleteUserFromSupabase = async (userId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_users').delete().eq('id', userId);
      if (error) {
        console.error('Erro ao deletar usuário no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao deletar usuário no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const deleteDisciplineFromSupabase = async (discId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_disciplines').delete().eq('id', discId);
      if (error) {
        console.error('Erro ao deletar disciplina no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao deletar disciplina no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncAssignmentToSupabase = async (assignment) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_assignments').upsert({
        id: assignment.id,
        discipline_id: assignment.disciplineId,
        evaluation_id: assignment.evaluationId,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate,
        submission_type: assignment.submissionType || 'upload',
        destination_email: assignment.destinationEmail || null,
        custom_instructions: assignment.customInstructions || null,
        submissions: assignment.submissions || [],
      });
      if (error) {
        console.error('Erro ao salvar trabalho no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(`Erro ao salvar trabalho: ${error.message}`);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    } catch (e) {
      console.warn('Erro ao salvar trabalho no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncLessonToSupabase = async (lesson) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_lessons').upsert({
        id: lesson.id,
        discipline_id: lesson.disciplineId,
        module: lesson.module,
        title: lesson.title,
        date: lesson.date,
        duration: lesson.duration,
        kind: lesson.kind,
        url: lesson.url,
        summary: lesson.summary,
        materials: lesson.materials,
      });
      if (error) {
        console.error('Erro ao salvar aula no Supabase:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao salvar aula no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const deleteAssignmentFromSupabase = async (assignmentId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_assignments').delete().eq('id', assignmentId);
      if (error) {
        console.error('Erro ao deletar atividade no Supabase:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao deletar atividade no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const deleteLessonFromSupabase = async (lessonId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_lessons').delete().eq('id', lessonId);
      if (error) {
        console.error('Erro ao deletar aula no Supabase:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao deletar aula no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncAnnouncementToSupabase = async (ann) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_announcements').upsert({
        id: ann.id,
        date: ann.date,
        author: ann.author,
        title: ann.title,
        content: ann.content,
        important: Boolean(ann.important),
      });
      if (error) {
        console.error('Erro ao salvar comunicado no Supabase:', error);
        setSyncStatus('error');
        setLastSyncError(`Erro no quadro de avisos: ${error.message}`);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    } catch (e) {
      console.warn('Erro ao salvar comunicado no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const deleteAnnouncementFromSupabase = async (annId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('seta_announcements').delete().eq('id', annId);
      if (error) {
        console.error('Erro ao excluir comunicado no Supabase:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Erro ao excluir comunicado no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const actions = {
    /** Login com validação real de e-mail e senha */
    login(email, password) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // 1. Procura na lista de administradores (admin@seta.com / setaadmin987)
      const admin = data.admins.find((u) => u.email.toLowerCase() === cleanEmail);
      if (admin && admin.password === cleanPass) {
        setSession({ role: 'admin', userId: admin.id });
        return true;
      }

      // 2. Procura na lista de professores reais
      const prof = data.professors.find((u) => u.email.toLowerCase() === cleanEmail);
      if (prof && prof.password === cleanPass) {
        setSession({ role: 'professor', userId: prof.id });
        return true;
      }

      // 3. Procura na lista de alunos reais
      const student = data.students.find((u) => u.email.toLowerCase() === cleanEmail);
      if (student && student.password === cleanPass) {
        setSession({ role: 'aluno', userId: student.id });
        return true;
      }

      return false;
    },

    logout() {
      setSession(null);
    },

    /** Cadastrar um novo usuário real (Aluno ou Professor) */
    addUser(user) {
      update((d) => {
        if (user.role === 'professor') {
          d.professors.push(user);
        } else if (user.role === 'aluno') {
          d.students.push(user);
          // Inicializa registro de notas em todas as disciplinas para o novo aluno
          d.disciplines.forEach((disc) => {
            if (!d.grades[disc.id]) d.grades[disc.id] = {};
            d.grades[disc.id][user.id] = { scores: {}, recovery: null, absences: 0 };
          });
        }
      });
      syncUserToSupabase(user);
    },

    /** Editar informações de um usuário existente (Professor ou Aluno) */
    updateUser(updatedUser) {
      let savedUser = null;
      update((d) => {
        if (updatedUser.role === 'professor') {
          const idx = d.professors.findIndex((p) => p.id === updatedUser.id);
          if (idx !== -1) {
            d.professors[idx] = { ...d.professors[idx], ...updatedUser };
            savedUser = { ...d.professors[idx] };
          }
        } else if (updatedUser.role === 'aluno') {
          const idx = d.students.findIndex((s) => s.id === updatedUser.id);
          if (idx !== -1) {
            d.students[idx] = { ...d.students[idx], ...updatedUser };
            savedUser = { ...d.students[idx] };
          }
        } else if (updatedUser.role === 'admin') {
          const idx = d.admins.findIndex((a) => a.id === updatedUser.id);
          if (idx !== -1) {
            d.admins[idx] = { ...d.admins[idx], ...updatedUser };
            savedUser = { ...d.admins[idx] };
          }
        }
      });
      if (savedUser) {
        syncUserToSupabase(savedUser);
      }
    },

    /** Excluir um usuário do seminário */
    deleteUser(userId, role) {
      update((d) => {
        if (role === 'professor') {
          d.professors = d.professors.filter((p) => p.id !== userId);
        } else if (role === 'aluno') {
          d.students = d.students.filter((s) => s.id !== userId);
          // Remove notas associadas
          Object.keys(d.grades).forEach((discId) => {
            delete d.grades[discId][userId];
          });
          // Remove submissões de trabalhos
          d.assignments.forEach((ass) => {
            ass.submissions = ass.submissions.filter((sub) => sub.studentId !== userId);
          });
        }
      });
      deleteUserFromSupabase(userId);
    },

    /** Cadastrar uma nova matéria do zero e vincular professor */
    addDiscipline(disc) {
      const fullDisc = {
        ...disc,
        status: disc.status || 'em_andamento',
      };
      update((d) => {
        d.disciplines.push(fullDisc);
        d.grades[disc.id] = {};
        d.students.forEach((s) => {
          d.grades[disc.id][s.id] = { scores: {}, recovery: null, absences: 0 };
        });
      });
      syncDisciplineToSupabase(fullDisc);
    },

    /** Atualizar dados de uma matéria existente */
    updateDiscipline(updatedDisc) {
      let savedDisc = null;
      update((d) => {
        const idx = d.disciplines.findIndex((x) => x.id === updatedDisc.id);
        if (idx !== -1) {
          d.disciplines[idx] = { ...d.disciplines[idx], ...updatedDisc };
          if (updatedDisc.status === 'concluida') {
            d.disciplines[idx].gradesClosed = true;
          } else if (updatedDisc.status === 'em_andamento') {
            d.disciplines[idx].gradesClosed = false;
          }
          savedDisc = { ...d.disciplines[idx] };
        }
      });
      if (savedDisc) {
        syncDisciplineToSupabase(savedDisc);
      }
    },

    /** Alterar rapidamente o status da disciplina (em_andamento, concluida, futura) */
    setDisciplineStatus(discId, newStatus) {
      let savedDisc = null;
      update((d) => {
        const disc = d.disciplines.find((x) => x.id === discId);
        if (!disc) return;
        disc.status = newStatus;
        if (newStatus === 'concluida') {
          disc.gradesClosed = true;
        } else if (newStatus === 'em_andamento') {
          disc.gradesClosed = false;
        }
        savedDisc = { ...disc };
      });
      if (savedDisc) {
        syncDisciplineToSupabase(savedDisc);
      }
    },

    /** Excluir uma matéria */
    deleteDiscipline(discId) {
      update((d) => {
        d.disciplines = d.disciplines.filter((x) => x.id !== discId);
        delete d.grades[discId];
        d.assignments = d.assignments.filter((a) => a.disciplineId !== discId);
        d.lessons = d.lessons.filter((l) => l.disciplineId !== discId);
      });
      deleteDisciplineFromSupabase(discId);
    },

    setScore(discId, studentId, evalId, value) {
      let updatedRecord = null;
      update((d) => {
        const r = d.grades[discId][studentId];
        if (value === null) delete r.scores[evalId];
        else r.scores[evalId] = value;
        updatedRecord = { ...r };
      });
      if (updatedRecord) syncGradeToSupabase(discId, studentId, updatedRecord);
    },

    setRecovery(discId, studentId, value) {
      let updatedRecord = null;
      update((d) => {
        d.grades[discId][studentId].recovery = value;
        updatedRecord = { ...d.grades[discId][studentId] };
      });
      if (updatedRecord) syncGradeToSupabase(discId, studentId, updatedRecord);
    },

    setAbsences(discId, studentId, value) {
      let updatedRecord = null;
      update((d) => {
        d.grades[discId][studentId].absences = value ?? 0;
        updatedRecord = { ...d.grades[discId][studentId] };
      });
      if (updatedRecord) syncGradeToSupabase(discId, studentId, updatedRecord);
    },

    saveDisciplineConfig(discId, cfg) {
      let updatedDisc = null;
      update((d) => {
        const disc = d.disciplines.find((x) => x.id === discId);
        Object.assign(disc, cfg);
        updatedDisc = { ...disc };
        const ids = new Set(cfg.evaluations.map((e) => e.id));
        Object.values(d.grades[discId] || {}).forEach((r) => {
          Object.keys(r.scores).forEach((k) => {
            if (!ids.has(k)) delete r.scores[k];
          });
        });
        d.assignments.forEach((a) => {
          if (a.disciplineId === discId && a.evaluationId && !ids.has(a.evaluationId)) a.evaluationId = null;
        });
      });
      if (updatedDisc) syncDisciplineToSupabase(updatedDisc);
    },

    setGradesClosed(discId, closed) {
      let updatedDisc = null;
      update((d) => {
        const disc = d.disciplines.find((x) => x.id === discId);
        disc.gradesClosed = closed;
        updatedDisc = { ...disc };
      });
      if (updatedDisc) syncDisciplineToSupabase(updatedDisc);
    },

    addAssignment(assignment) {
      update((d) => {
        d.assignments.unshift(assignment);
      });
      syncAssignmentToSupabase(assignment);
    },

    updateAssignment(updated) {
      let toSync = null;
      update((d) => {
        const idx = d.assignments.findIndex((x) => x.id === updated.id);
        if (idx !== -1) {
          d.assignments[idx] = { ...d.assignments[idx], ...updated };
          toSync = { ...d.assignments[idx] };
        }
      });
      if (toSync) syncAssignmentToSupabase(toSync);
    },

    deleteAssignment(assignmentId) {
      update((d) => {
        d.assignments = d.assignments.filter((x) => x.id !== assignmentId);
      });
      deleteAssignmentFromSupabase(assignmentId);
    },

    submitWork(assignmentId, submission) {
      let updatedAss = null;
      update((d) => {
        const a = d.assignments.find((x) => x.id === assignmentId);
        if (!a) return;
        a.submissions = (a.submissions || []).filter((s) => s.studentId !== submission.studentId);
        a.submissions.push({
          ...submission,
          submittedAt: submission.submittedAt || new Date().toISOString(),
          grade: null,
          feedback: null,
        });
        updatedAss = { ...a };
      });
      if (updatedAss) syncAssignmentToSupabase(updatedAss);
    },

    async uploadAssignmentFile(file, assignmentId, studentId) {
      if (!file) return { success: false, error: 'Nenhum arquivo fornecido' };

      const MAX_SIZE = 15 * 1024 * 1024; // 15MB
      if (file.size > MAX_SIZE) {
        return { success: false, error: 'O arquivo excede o limite máximo permitido de 15MB.' };
      }

      const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1).replace('.', ',')} ${sizes[i]}`;
      };

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${assignmentId}/${studentId}_${Date.now()}_${cleanFileName}`;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('seta-trabalhos')
            .upload(filePath, file, {
              upsert: true,
              contentType: file.type || 'application/octet-stream',
            });

          if (uploadErr) {
            console.warn('Supabase Storage aviso (usando link de visualização local):', uploadErr);
            const localUrl = URL.createObjectURL(file);
            return {
              success: true,
              fileUrl: localUrl,
              fileName: file.name,
              fileSize: formatBytes(file.size),
              warning: 'Salvo localmente neste navegador.',
            };
          }

          const { data: urlData } = supabase.storage
            .from('seta-trabalhos')
            .getPublicUrl(filePath);

          return {
            success: true,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            fileSize: formatBytes(file.size),
          };
        } catch (err) {
          console.error('Erro no upload de arquivo:', err);
          const localUrl = URL.createObjectURL(file);
          return {
            success: true,
            fileUrl: localUrl,
            fileName: file.name,
            fileSize: formatBytes(file.size),
          };
        }
      }

      // Fallback local
      const localUrl = URL.createObjectURL(file);
      return {
        success: true,
        fileUrl: localUrl,
        fileName: file.name,
        fileSize: formatBytes(file.size),
      };
    },

    gradeSubmission(assignmentId, studentId, grade, feedback) {
      let updatedAss = null;
      let updatedRecord = null;
      let discId = null;

      update((d) => {
        const a = d.assignments.find((x) => x.id === assignmentId);
        discId = a.disciplineId;
        const s = a.submissions.find((x) => x.studentId === studentId);
        s.grade = grade;
        s.feedback = feedback;
        updatedAss = { ...a };

        if (a.evaluationId) {
          const r = d.grades[a.disciplineId]?.[studentId];
          if (r) {
            r.scores[a.evaluationId] = grade;
            updatedRecord = { ...r };
          }
        }
      });

      if (updatedAss) syncAssignmentToSupabase(updatedAss);
      if (updatedRecord && discId) syncGradeToSupabase(discId, studentId, updatedRecord);
    },

    addLesson(lesson) {
      update((d) => {
        d.lessons.push(lesson);
      });
      syncLessonToSupabase(lesson);
    },

    updateLesson(updated) {
      let toSync = null;
      update((d) => {
        const idx = d.lessons.findIndex((x) => x.id === updated.id);
        if (idx !== -1) {
          d.lessons[idx] = { ...d.lessons[idx], ...updated };
          toSync = { ...d.lessons[idx] };
        }
      });
      if (toSync) syncLessonToSupabase(toSync);
    },

    deleteLesson(lessonId) {
      update((d) => {
        d.lessons = d.lessons.filter((x) => x.id !== lessonId);
      });
      deleteLessonFromSupabase(lessonId);
    },

    addAnnouncement(ann) {
      update((d) => {
        d.announcements.unshift(ann);
      });
      syncAnnouncementToSupabase(ann);
    },

    updateAnnouncement(updated) {
      let toSync = null;
      update((d) => {
        const idx = d.announcements.findIndex((x) => x.id === updated.id);
        if (idx !== -1) {
          d.announcements[idx] = { ...d.announcements[idx], ...updated };
          toSync = { ...d.announcements[idx] };
        }
      });
      if (toSync) syncAnnouncementToSupabase(toSync);
    },

    deleteAnnouncement(annId) {
      update((d) => {
        d.announcements = d.announcements.filter((x) => x.id !== annId);
      });
      deleteAnnouncementFromSupabase(annId);
    },

    saveSupabaseCredentials,
  };

  return (
    <Ctx.Provider
      value={{
        data,
        session,
        currentUser,
        isSupabaseConfigured,
        syncStatus,
        lastSyncError,
        credentialsSource,
        ...actions,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
