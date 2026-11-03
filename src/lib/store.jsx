/**
 * Estado global do protótipo (persistido no navegador via localStorage).
 * Na versão de produção, cada ação abaixo vira uma chamada ao banco de dados.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeed, DEMO_LOGINS } from '../data/seed';

const DATA_KEY = 'seta-demo-data-v3';
const SESSION_KEY = 'seta-session-v3';

const Ctx = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback();
  } catch {
    return fallback();
  }
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => load(DATA_KEY, createSeed));
  const [session, setSession] = useState(() => load(SESSION_KEY, () => null));

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const currentUser = useMemo(() => {
    if (!session) return null;
    const pool =
      session.role === 'aluno' ? data.students : session.role === 'professor' ? data.professors : data.admins;
    return pool.find((u) => u.id === session.userId) || null;
  }, [session, data]);

  /** Aplica uma alteração sobre uma cópia do estado */
  const update = (fn) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

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
      update((d) => {
        const r = d.grades[discId][studentId];
        if (value === null) delete r.scores[evalId];
        else r.scores[evalId] = value;
      });
    },

    setRecovery(discId, studentId, value) {
      update((d) => {
        d.grades[discId][studentId].recovery = value;
      });
    },

    setAbsences(discId, studentId, value) {
      update((d) => {
        d.grades[discId][studentId].absences = value ?? 0;
      });
    },

    saveDisciplineConfig(discId, cfg) {
      update((d) => {
        const disc = d.disciplines.find((x) => x.id === discId);
        Object.assign(disc, cfg);
        const ids = new Set(cfg.evaluations.map((e) => e.id));
        // descarta notas de avaliações removidas
        Object.values(d.grades[discId] || {}).forEach((r) => {
          Object.keys(r.scores).forEach((k) => {
            if (!ids.has(k)) delete r.scores[k];
          });
        });
        d.assignments.forEach((a) => {
          if (a.disciplineId === discId && a.evaluationId && !ids.has(a.evaluationId)) a.evaluationId = null;
        });
      });
    },

    setGradesClosed(discId, closed) {
      update((d) => {
        d.disciplines.find((x) => x.id === discId).gradesClosed = closed;
      });
    },

    addDiscipline(disc) {
      update((d) => {
        d.disciplines.push(disc);
        d.grades[disc.id] = {};
        d.students.forEach((s) => {
          d.grades[disc.id][s.id] = { scores: {}, recovery: null, absences: 0 };
        });
      });
    },

    addAssignment(assignment) {
      update((d) => {
        d.assignments.unshift(assignment);
      });
    },

    submitWork(assignmentId, submission) {
      update((d) => {
        const a = d.assignments.find((x) => x.id === assignmentId);
        a.submissions = a.submissions.filter((s) => s.studentId !== submission.studentId);
        a.submissions.push(submission);
      });
    },

    gradeSubmission(assignmentId, studentId, grade, feedback) {
      update((d) => {
        const a = d.assignments.find((x) => x.id === assignmentId);
        const s = a.submissions.find((x) => x.studentId === studentId);
        s.grade = grade;
        s.feedback = feedback;
        // lança automaticamente a nota na avaliação vinculada
        if (a.evaluationId) {
          const r = d.grades[a.disciplineId]?.[studentId];
          if (r) r.scores[a.evaluationId] = grade;
        }
      });
    },

    addLesson(lesson) {
      update((d) => {
        d.lessons.push(lesson);
      });
    },

    addAnnouncement(ann) {
      update((d) => {
        d.announcements.unshift(ann);
      });
    },

    resetDemo() {
      setData(createSeed());
    },
  };

  return <Ctx.Provider value={{ data, session, currentUser, ...actions }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
