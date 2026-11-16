import { useSyncExternalStore } from "react";
import { createSeed, SEED_VERSION } from "./seed";
import type {
  Exam,
  Material,
  Profile,
  SessionStatus,
  StudoraData,
  StudySession,
  Subject,
  Task,
  TaskStatus,
} from "./types";

/**
 * Local demo store, persisted in localStorage.
 *
 * Every mutation goes through the `actions` object below. To move to Supabase,
 * replace each action body with a query and keep the same signatures; the
 * components only use `useStudora(selector)` and `actions`.
 */

const STORAGE_KEY = "studora:data";

let state: StudoraData | null = null;
const listeners = new Set<() => void>();

function load(): StudoraData {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudoraData;
      if (parsed.version === SEED_VERSION) return parsed;
    }
  } catch {
    // Corrupt storage falls back to the seed.
  }
  return createSeed();
}

function getState(): StudoraData {
  if (!state) state = load();
  return state;
}

function setState(updater: (s: StudoraData) => StudoraData) {
  state = updater(getState());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or disabled; the session still works in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStudora<T>(selector: (s: StudoraData) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const actions = {
  // Subjects
  createSubject(input: Omit<Subject, "id" | "topics">) {
    const subject: Subject = { ...input, id: uid("sub"), topics: [] };
    setState((s) => ({ ...s, subjects: [...s.subjects, subject] }));
    return subject;
  },
  updateSubject(id: string, patch: Partial<Subject>) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  },
  deleteSubject(id: string) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((x) => x.id !== id),
      tasks: s.tasks.filter((x) => x.subjectId !== id),
      exams: s.exams.filter((x) => x.subjectId !== id),
      sessions: s.sessions.filter((x) => x.subjectId !== id),
      materials: s.materials.filter((x) => x.subjectId !== id),
    }));
  },
  toggleTopic(subjectId: string, topicId: string) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((x) =>
        x.id === subjectId
          ? {
              ...x,
              topics: x.topics.map((t) => (t.id === topicId ? { ...t, studied: !t.studied } : t)),
            }
          : x,
      ),
    }));
  },
  addTopic(subjectId: string, title: string) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((x) =>
        x.id === subjectId
          ? { ...x, topics: [...x.topics, { id: uid("tp"), title, studied: false }] }
          : x,
      ),
    }));
  },

  // Tasks
  createTask(input: Omit<Task, "id">) {
    const task: Task = { ...input, id: uid("t") };
    setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
    return task;
  },
  updateTask(id: string, patch: Partial<Task>) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  },
  setTaskStatus(id: string, status: TaskStatus) {
    actions.updateTask(id, { status });
  },
  deleteTask(id: string) {
    setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));
  },

  // Exams
  createExam(input: Omit<Exam, "id">) {
    const exam: Exam = { ...input, id: uid("e") };
    setState((s) => ({ ...s, exams: [...s.exams, exam] }));
    return exam;
  },
  updateExam(id: string, patch: Partial<Exam>) {
    setState((s) => ({
      ...s,
      exams: s.exams.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  },
  deleteExam(id: string) {
    setState((s) => ({ ...s, exams: s.exams.filter((x) => x.id !== id) }));
  },

  // Study sessions
  createSession(input: Omit<StudySession, "id">) {
    const session: StudySession = { ...input, id: uid("s") };
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }));
    return session;
  },
  setSessionStatus(id: string, status: SessionStatus) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, status } : x)),
    }));
  },
  deleteSession(id: string) {
    setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  },

  // Materials (metadata only; no file storage in the demo)
  addMaterial(input: Omit<Material, "id">) {
    const material: Material = { ...input, id: uid("m") };
    setState((s) => ({ ...s, materials: [material, ...s.materials] }));
    return material;
  },
  deleteMaterial(id: string) {
    setState((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== id) }));
  },

  // Profile
  updateProfile(patch: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },

  resetDemo() {
    setState(() => createSeed());
  },
};
