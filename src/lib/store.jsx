/**
 * Estado global do SETA com suporte Híbrido:
 * - Se Supabase estiver configurado: sincroniza diretamente com o banco PostgreSQL na nuvem.
 * - Se não estiver configurado: opera em memória/localStorage (modo demonstração local).
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeed, DEMO_LOGINS } from '../data/seed';
import { supabase, isSupabaseConfigured, saveSupabaseCredentials, credentialsSource } from './supabase';

const DATA_KEY = 'seta-demo-data-v3';
const SESSION_KEY = 'seta-session-v3';

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
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;
    async function loadFromSupabase() {
      try {
        setSyncStatus('syncing');

        // Busca usuários, disciplinas, notas, trabalhos, aulas e avisos
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

        if (uErr || dErr || gErr) {
          console.warn('Erro ao carregar do Supabase, usando dados locais:', uErr || dErr || gErr);
          if (isMounted) setSyncStatus('error');
          return;
        }

        // Se houver disciplinas cadastradas no banco, monta o estado
        if (discData && discData.length > 0) {
          const professors = (usersData || []).filter((u) => u.role === 'professor');
          const admins = (usersData || []).filter((u) => u.role === 'admin');
          const students = (usersData || []).filter((u) => u.role === 'aluno');

          // Formata disciplinas
          const disciplines = discData.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            professorId: d.professor_id,
            course: d.course,
            workload: d.workload,
            schedule: d.schedule,
            passingGrade: Number(d.passing_grade),
            maxAbsences: d.max_absences,
            recoveryRule: d.recovery_rule,
            gradesClosed: d.grades_closed,
            evaluations: d.evaluations || [],
          }));

          // Formata notas por disciplina e aluno
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

          // Preenche alunos faltantes com notas vazias
          disciplines.forEach((d) => {
            students.forEach((s) => {
              if (!grades[d.id][s.id]) {
                grades[d.id][s.id] = { scores: {}, recovery: null, absences: 0 };
              }
            });
          });

          // Formata trabalhos
          const assignments = (assignData || []).map((a) => ({
            id: a.id,
            disciplineId: a.discipline_id,
            evaluationId: a.evaluation_id,
            title: a.title,
            description: a.description,
            dueDate: a.due_date,
            submissions: a.submissions || [],
          }));

          // Formata aulas
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

          // Formata avisos
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
              professors: professors.length ? professors : prev.professors,
              admins: admins.length ? admins : prev.admins,
              students: students.length ? students : prev.students,
              disciplines,
              grades,
              assignments: assignments.length ? assignments : prev.assignments,
              lessons: lessons.length ? lessons : prev.lessons,
              announcements: announcements.length ? announcements : prev.announcements,
            }));
            setSyncStatus('synced');
          }
        } else {
          if (isMounted) setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Falha de conexão com Supabase:', err);
        if (isMounted) setSyncStatus('error');
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

  // Funções assíncronas para sincronização com Supabase (Fire-and-forget)
  const syncGradeToSupabase = async (discId, studentId, record) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      await supabase.from('seta_grades').upsert(
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
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Erro ao salvar nota no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncDisciplineToSupabase = async (disc) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      await supabase.from('seta_disciplines').upsert({
        id: disc.id,
        code: disc.code,
        name: disc.name,
        professor_id: disc.professorId,
        course: disc.course,
        workload: disc.workload,
        schedule: disc.schedule,
        passing_grade: disc.passingGrade,
        max_absences: disc.maxAbsences,
        recovery_rule: disc.recoveryRule,
        grades_closed: disc.gradesClosed,
        evaluations: disc.evaluations,
      });
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Erro ao salvar disciplina no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncAssignmentToSupabase = async (assignment) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      await supabase.from('seta_assignments').upsert({
        id: assignment.id,
        discipline_id: assignment.disciplineId,
        evaluation_id: assignment.evaluationId,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate,
        submissions: assignment.submissions,
      });
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Erro ao salvar trabalho no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const syncLessonToSupabase = async (lesson) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setSyncStatus('syncing');
      await supabase.from('seta_lessons').upsert({
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
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Erro ao salvar aula no Supabase:', e);
      setSyncStatus('error');
    }
  };

  const actions = {
    login(email, password) {
      const found = DEMO_LOGINS.find(
        (l) => l.email.toLowerCase() === email.trim().toLowerCase() && l.password === password
      );
      if (!found) return false;
      setSession({ role: found.role, userId: found.userId });
      return true;
    },

    logout() {
      setSession(null);
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
        // Descarta notas de avaliações removidas
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

    addDiscipline(disc) {
      update((d) => {
        d.disciplines.push(disc);
        d.grades[disc.id] = {};
        d.students.forEach((s) => {
          d.grades[disc.id][s.id] = { scores: {}, recovery: null, absences: 0 };
        });
      });
      syncDisciplineToSupabase(disc);
    },

    addAssignment(assignment) {
      update((d) => {
        d.assignments.unshift(assignment);
      });
      syncAssignmentToSupabase(assignment);
    },

    submitWork(assignmentId, submission) {
      let updatedAss = null;
      update((d) => {
        const a = d.assignments.find((x) => x.id === assignmentId);
        a.submissions = a.submissions.filter((s) => s.studentId !== submission.studentId);
        a.submissions.push(submission);
        updatedAss = { ...a };
      });
      if (updatedAss) syncAssignmentToSupabase(updatedAss);
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

        // Lança automaticamente a nota na avaliação vinculada
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

    addAnnouncement(ann) {
      update((d) => {
        d.announcements.unshift(ann);
      });
    },

    resetDemo() {
      setData(createSeed());
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
        credentialsSource,
        ...actions,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
