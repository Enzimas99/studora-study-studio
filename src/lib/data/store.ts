import { useSyncExternalStore } from "react";
import {
  authService,
  disciplinesService,
  examsService,
  isSupabaseConfigured,
  materialsService,
  profileService,
  studyService,
  tasksService,
} from "@/backend";
import { typeFromName } from "@/components/materials/FileIcon";
import { createSeed, SEED_VERSION } from "./seed";
import { dbMappers, fetchSupabaseWorkspace, mapDbExam, mapDbMaterial, mapDbSession, mapDbSubject, mapDbTask } from "./supabase-sync";
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

const STORAGE_KEY = "studora:data";

let state: StudoraData | null = null;
let remoteActive = false;
let syncing = false;
let booted = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

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
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be full or disabled; the session still works in memory.
    }
  }
  notify();
}

async function syncFromSupabase() {
  if (!isSupabaseConfigured || typeof window === "undefined") return;
  syncing = true;
  notify();
  try {
    const remote = await fetchSupabaseWorkspace();
    if (remote) {
      remoteActive = true;
      setState(() => remote);
    } else {
      remoteActive = false;
    }
  } catch (err) {
    console.error("[Studora] Falha ao sincronizar com Supabase:", err);
  } finally {
    syncing = false;
    notify();
  }
}

function ensureBooted() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  if (isSupabaseConfigured) {
    void syncFromSupabase();
    authService.onAuthChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void syncFromSupabase();
      } else if (event === "SIGNED_OUT") {
        remoteActive = false;
        notify();
      }
    });
  }
}

function subscribe(listener: () => void) {
  ensureBooted();
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

let cachedStatus = { isSupabaseConfigured, remoteActive: false, syncing: false };
function getStatusSnapshot() {
  if (
    cachedStatus.remoteActive !== remoteActive ||
    cachedStatus.syncing !== syncing
  ) {
    cachedStatus = { isSupabaseConfigured, remoteActive, syncing };
  }
  return cachedStatus;
}

export function useBackendStatus() {
  return useSyncExternalStore(subscribe, getStatusSnapshot, getStatusSnapshot);
}

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export const actions = {
  // Subjects
  createSubject(input: Omit<Subject, "id" | "topics">) {
    const tempId = uid("sub");
    const subject: Subject = { ...input, id: tempId, topics: [] };
    setState((s) => ({ ...s, subjects: [...s.subjects, subject] }));
    if (remoteActive) {
      void disciplinesService
        .create({
          name: input.name,
          code: input.code || null,
          professor: input.professor || null,
          semester: input.semester || null,
          color: dbMappers.colorToHex(input.color),
          schedule: input.schedule || null,
          room: input.room || null,
          workload_hours: input.workload,
          topics: [],
        })
        .then((created) => {
          const mapped = mapDbSubject(created);
          setState((s) => ({
            ...s,
            subjects: s.subjects.map((x) => (x.id === tempId ? mapped : x)),
          }));
        })
        .catch(console.error);
    }
    return subject;
  },
  updateSubject(id: string, patch: Partial<Subject>) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
    if (remoteActive) {
      const current = getState().subjects.find((x) => x.id === id);
      if (current) {
        const studiedCount = current.topics.filter((t) => t.studied).length;
        const progress = current.topics.length
          ? Math.round((studiedCount / current.topics.length) * 100)
          : 0;
        void disciplinesService
          .update(id, {
            name: current.name,
            code: current.code || null,
            professor: current.professor || null,
            semester: current.semester || null,
            color: dbMappers.colorToHex(current.color),
            schedule: current.schedule || null,
            room: current.room || null,
            workload_hours: current.workload,
            topics: current.topics,
            content_progress: progress,
          })
          .catch(console.error);
      }
    }
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
    if (remoteActive) {
      void disciplinesService.remove(id).catch(console.error);
    }
  },
  toggleTopic(subjectId: string, topicId: string) {
    const subject = getState().subjects.find((x) => x.id === subjectId);
    if (!subject) return;
    const topics = subject.topics.map((t) =>
      t.id === topicId ? { ...t, studied: !t.studied } : t,
    );
    actions.updateSubject(subjectId, { topics });
  },
  addTopic(subjectId: string, title: string) {
    const subject = getState().subjects.find((x) => x.id === subjectId);
    if (!subject) return;
    const topics = [...subject.topics, { id: uid("tp"), title, studied: false }];
    actions.updateSubject(subjectId, { topics });
  },
  deleteTopic(subjectId: string, topicId: string) {
    const subject = getState().subjects.find((x) => x.id === subjectId);
    if (!subject) return;
    const topics = subject.topics.filter((t) => t.id !== topicId);
    actions.updateSubject(subjectId, { topics });
  },

  // Tasks
  createTask(input: Omit<Task, "id">) {
    const tempId = uid("t");
    const task: Task = { ...input, id: tempId };
    setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
    if (remoteActive) {
      void tasksService
        .create({
          title: input.title,
          discipline_id: input.subjectId || null,
          due_at: input.due,
          priority: dbMappers.PRIO_TO_DB[input.priority],
          status: dbMappers.STATUS_TO_DB[input.status],
          description: input.notes ?? null,
        })
        .then((created) => {
          const mapped = mapDbTask(created, input.subjectId);
          setState((s) => ({
            ...s,
            tasks: s.tasks.map((x) => (x.id === tempId ? mapped : x)),
          }));
        })
        .catch(console.error);
    }
    return task;
  },
  updateTask(id: string, patch: Partial<Task>) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
    if (remoteActive) {
      const current = getState().tasks.find((x) => x.id === id);
      if (current) {
        void tasksService
          .update(id, {
            title: current.title,
            discipline_id: current.subjectId || null,
            due_at: current.due,
            priority: dbMappers.PRIO_TO_DB[current.priority],
            status: dbMappers.STATUS_TO_DB[current.status],
            description: current.notes ?? null,
          })
          .catch(console.error);
      }
    }
  },
  setTaskStatus(id: string, status: TaskStatus) {
    actions.updateTask(id, { status });
  },
  deleteTask(id: string) {
    setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));
    if (remoteActive) {
      void tasksService.remove(id).catch(console.error);
    }
  },

  // Exams
  createExam(input: Omit<Exam, "id">) {
    const tempId = uid("e");
    const exam: Exam = { ...input, id: tempId };
    setState((s) => ({ ...s, exams: [...s.exams, exam] }));
    if (remoteActive && input.subjectId) {
      void examsService
        .create({
          title: input.title,
          discipline_id: input.subjectId,
          exam_date: input.date,
          weight: input.weight,
          max_score: 10,
          score: input.grade,
          prep_progress: input.preparation,
          topics: input.topics,
          location: input.location ?? null,
        })
        .then((created) => {
          const mapped = mapDbExam(created);
          setState((s) => ({
            ...s,
            exams: s.exams.map((x) => (x.id === tempId ? mapped : x)),
          }));
        })
        .catch(console.error);
    }
    return exam;
  },
  updateExam(id: string, patch: Partial<Exam>) {
    setState((s) => ({
      ...s,
      exams: s.exams.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
    if (remoteActive) {
      const current = getState().exams.find((x) => x.id === id);
      if (current) {
        void examsService
          .update(id, {
            title: current.title,
            discipline_id: current.subjectId,
            exam_date: current.date,
            weight: current.weight,
            score: current.grade,
            prep_progress: current.preparation,
            topics: current.topics,
            location: current.location ?? null,
          })
          .catch(console.error);
      }
    }
  },
  deleteExam(id: string) {
    setState((s) => ({ ...s, exams: s.exams.filter((x) => x.id !== id) }));
    if (remoteActive) {
      void examsService.remove(id).catch(console.error);
    }
  },

  // Study sessions
  createSession(input: Omit<StudySession, "id">) {
    const tempId = uid("s");
    const session: StudySession = { ...input, id: tempId };
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }));
    if (remoteActive) {
      void studyService
        .create({
          title: input.topic,
          discipline_id: input.subjectId || null,
          starts_at: input.start,
          duration_minutes: input.durationMin,
          status: dbMappers.SESSION_TO_DB[input.status],
        })
        .then((created) => {
          const mapped = mapDbSession(created, input.subjectId);
          setState((s) => ({
            ...s,
            sessions: s.sessions.map((x) => (x.id === tempId ? mapped : x)),
          }));
        })
        .catch(console.error);
    }
    return session;
  },
  updateSession(id: string, patch: Partial<StudySession>) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
    if (remoteActive) {
      const current = getState().sessions.find((x) => x.id === id);
      if (current) {
        void studyService
          .update(id, {
            title: current.topic,
            discipline_id: current.subjectId || null,
            starts_at: current.start,
            duration_minutes: current.durationMin,
            status: dbMappers.SESSION_TO_DB[current.status],
          })
          .catch(console.error);
      }
    }
  },
  setSessionStatus(id: string, status: SessionStatus) {
    actions.updateSession(id, { status });
  },
  deleteSession(id: string) {
    setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
    if (remoteActive) {
      void studyService.remove(id).catch(console.error);
    }
  },

  // Materials
  addMaterial(input: Omit<Material, "id">) {
    const tempId = uid("m");
    const material: Material = { ...input, id: tempId };
    setState((s) => ({ ...s, materials: [material, ...s.materials] }));
    if (remoteActive && input.type === "link" && input.url) {
      void materialsService
        .addLink({
          title: input.name,
          url: input.url,
          disciplineId: input.subjectId || null,
          description: input.description,
        })
        .then((created) => {
          const mapped = mapDbMaterial(created, input.subjectId);
          setState((s) => ({
            ...s,
            materials: s.materials.map((x) => (x.id === tempId ? mapped : x)),
          }));
        })
        .catch(console.error);
    }
    return material;
  },
  async uploadMaterialFile(
    file: File,
    opts: { name?: string; subjectId: string; description?: string },
  ) {
    const displayName = opts.name?.trim() || file.name;
    if (remoteActive) {
      const created = await materialsService.uploadFile(file, {
        title: displayName,
        disciplineId: opts.subjectId || null,
        description: opts.description,
      });
      const mapped = mapDbMaterial(created, opts.subjectId);
      setState((s) => ({ ...s, materials: [mapped, ...s.materials] }));
      return mapped;
    }

    // In local/demo mode, store files <= 2.5 MB as Data URLs so real download works!
    let url: string | undefined;
    if (file.size <= 2.5 * 1024 * 1024) {
      url = await fileToDataUrl(file);
    } else {
      url = URL.createObjectURL(file);
    }
    return actions.addMaterial({
      name: displayName,
      type: typeFromName(file.name),
      subjectId: opts.subjectId,
      addedAt: new Date().toISOString(),
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      url,
      description: opts.description,
    });
  },
  async openOrDownloadMaterial(material: Material) {
    if (material.url?.startsWith("storage://")) {
      const storagePath = material.url.replace("storage://", "");
      const signed = await materialsService.getDownloadUrl({
        kind: "file",
        url: null,
        storage_path: storagePath,
      });
      window.open(signed, "_blank", "noopener,noreferrer");
      return;
    }
    if (material.type === "link" && material.url) {
      window.open(material.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (material.url) {
      const a = document.createElement("a");
      a.href = material.url;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    // Demo seed item fallback: generate a clean study reference sheet download
    const subject = getState().subjects.find((s) => s.id === material.subjectId);
    const content = [
      `STUDORA — Material de Estudo`,
      `========================================`,
      `Arquivo: ${material.name}`,
      `Disciplina: ${subject ? `${subject.name} (${subject.code})` : "Geral"}`,
      `Adicionado em: ${new Date(material.addedAt).toLocaleDateString("pt-BR")}`,
      ``,
      `Este item faz parte dos dados de demonstração do Studora.`,
      `Envie seus próprios PDFs, slides, planilhas ou links pela página Materiais!`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = material.name.includes(".") ? `${material.name}.txt` : `${material.name}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  },
  deleteMaterial(id: string) {
    const existing = getState().materials.find((x) => x.id === id);
    setState((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== id) }));
    if (remoteActive && existing) {
      const storagePath = existing.url?.startsWith("storage://")
        ? existing.url.replace("storage://", "")
        : null;
      void materialsService
        .remove({
          id,
          kind: existing.type === "link" ? "link" : "file",
          storage_path: storagePath,
        })
        .catch(console.error);
    }
  },

  // Profile
  updateProfile(patch: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    if (remoteActive) {
      const p = getState().profile;
      void profileService
        .update({
          full_name: p.name,
          course: p.course || null,
          university: p.university || null,
          current_period: p.period || null,
          student_id: p.studentId || null,
          avatar_url: p.avatarUrl || null,
          weekly_study_goal_minutes: p.weeklyGoalHours * 60,
          week_starts_on: p.weekStartsOn,
          notifications: p.notifications,
        })
        .catch(console.error);
    }
  },

  exportBackup(): string {
    return JSON.stringify(getState(), null, 2);
  },

  importBackup(rawJson: string) {
    const parsed = JSON.parse(rawJson) as StudoraData;
    if (!parsed || !parsed.profile || !Array.isArray(parsed.subjects)) {
      throw new Error("Arquivo de backup inválido.");
    }
    setState(() => ({ ...parsed, version: SEED_VERSION }));
  },

  resetDemo() {
    setState(() => createSeed());
  },
};

export const authActions = {
  async signIn(email: string, password: string) {
    if (isSupabaseConfigured) {
      await authService.signIn(email, password);
      await syncFromSupabase();
      return { mode: "supabase" as const };
    }
    actions.updateProfile({ email: email.trim() });
    return { mode: "demo" as const };
  },
  async signUp(input: { name: string; email: string; password: string; course?: string; university?: string; period?: string }) {
    if (isSupabaseConfigured) {
      const data = await authService.signUp(input.email, input.password, input.name);
      if (data.session) {
        await profileService.update({
          full_name: input.name,
          course: input.course || null,
          university: input.university || null,
          current_period: input.period || null,
        });
        await syncFromSupabase();
      }
      return { mode: "supabase" as const, needsConfirmation: !data.session };
    }
    actions.updateProfile({
      name: input.name.trim(),
      email: input.email.trim(),
      course: input.course?.trim() || getState().profile.course,
      university: input.university?.trim() || getState().profile.university,
      period: input.period?.trim() || getState().profile.period,
    });
    return { mode: "demo" as const, needsConfirmation: false };
  },
  async requestPasswordReset(email: string) {
    if (isSupabaseConfigured) {
      await authService.requestPasswordReset(email);
      return { mode: "supabase" as const };
    }
    return { mode: "demo" as const };
  },
  async updatePassword(newPassword: string) {
    if (isSupabaseConfigured) {
      await authService.updatePassword(newPassword);
      return { mode: "supabase" as const };
    }
    return { mode: "demo" as const };
  },
  async signOut() {
    if (isSupabaseConfigured) {
      try {
        await authService.signOut();
      } catch {
        // Ignore signOut errors if not signed in
      }
      remoteActive = false;
      notify();
    }
  },
};
