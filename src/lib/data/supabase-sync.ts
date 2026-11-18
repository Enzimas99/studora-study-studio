import {
  authService,
  disciplinesService,
  examsService,
  isSupabaseConfigured,
  materialsService,
  profileService,
  studyService,
  tasksService,
  type Discipline,
  type Exam as DbExam,
  type Material as DbMaterial,
  type Profile as DbProfile,
  type StudySession as DbStudySession,
  type Task as DbTask,
} from "@/backend";
import { typeFromName } from "@/components/materials/FileIcon";
import type {
  Exam,
  Material,
  Priority,
  Profile,
  SessionStatus,
  StudoraData,
  StudySession,
  Subject,
  SubjectColor,
  Task,
  TaskStatus,
} from "./types";
import { SEED_VERSION } from "./seed";

const COLOR_TO_HEX: Record<SubjectColor, string> = {
  cobalt: "#3B6FD4",
  teal: "#2C8C88",
  coral: "#D96A4B",
  amber: "#D29B38",
  plum: "#8358A6",
  sage: "#5E8B63",
};

const HEX_TO_COLOR: Record<string, SubjectColor> = Object.fromEntries(
  Object.entries(COLOR_TO_HEX).map(([k, v]) => [v.toUpperCase(), k as SubjectColor]),
);

export function colorToHex(color: SubjectColor): string {
  return COLOR_TO_HEX[color] ?? "#3B6FD4";
}

export function hexToColor(hex: string | null | undefined): SubjectColor {
  if (!hex) return "cobalt";
  return HEX_TO_COLOR[hex.toUpperCase()] ?? "cobalt";
}

const STATUS_TO_DB: Record<TaskStatus, DbTask["status"]> = {
  pendente: "todo",
  andamento: "in_progress",
  concluido: "done",
};

const DB_TO_STATUS: Record<DbTask["status"], TaskStatus> = {
  todo: "pendente",
  in_progress: "andamento",
  done: "concluido",
};

const PRIO_TO_DB: Record<Priority, DbTask["priority"]> = {
  baixa: "low",
  media: "medium",
  alta: "high",
};

const DB_TO_PRIO: Record<DbTask["priority"], Priority> = {
  low: "baixa",
  medium: "media",
  high: "alta",
};

const SESSION_TO_DB: Record<SessionStatus, DbStudySession["status"]> = {
  planejada: "planned",
  concluida: "done",
  perdida: "skipped",
};

const DB_TO_SESSION: Record<DbStudySession["status"], SessionStatus> = {
  planned: "planejada",
  done: "concluida",
  skipped: "perdida",
};

export function mapDbProfile(p: DbProfile, email: string): Profile {
  const n = p.notifications ?? {};
  return {
    name: p.full_name || email.split("@")[0] || "Estudante",
    email,
    course: p.course ?? "",
    university: p.university ?? "",
    period: p.current_period ?? "1º período",
    studentId: p.student_id ?? "",
    avatarUrl: p.avatar_url ?? undefined,
    weeklyGoalHours: Math.max(1, Math.round((p.weekly_study_goal_minutes ?? 600) / 60)),
    weekStartsOn: p.week_starts_on === 0 ? 0 : 1,
    notifications: {
      deadlines: n.deadlines ?? true,
      exams: n.exams ?? true,
      studyReminders: n.studyReminders ?? true,
      weeklyReport: n.weeklyReport ?? false,
      email: n.email ?? true,
    },
  };
}

export function mapDbSubject(d: Discipline): Subject {
  return {
    id: d.id,
    name: d.name,
    code: d.code ?? "",
    professor: d.professor ?? "",
    semester: d.semester ?? "2026.2",
    color: hexToColor(d.color),
    schedule: d.schedule ?? "",
    room: d.room ?? "",
    workload: d.workload_hours ?? 60,
    topics: Array.isArray(d.topics) ? d.topics : [],
  };
}

export function mapDbTask(t: DbTask, fallbackSubjectId: string): Task {
  return {
    id: t.id,
    title: t.title,
    subjectId: t.discipline_id ?? fallbackSubjectId,
    due: t.due_at ?? new Date().toISOString(),
    priority: DB_TO_PRIO[t.priority] ?? "media",
    status: DB_TO_STATUS[t.status] ?? "pendente",
    notes: t.description ?? undefined,
  };
}

export function mapDbExam(e: DbExam): Exam {
  return {
    id: e.id,
    title: e.title,
    subjectId: e.discipline_id,
    date: e.exam_date,
    weight: Number(e.weight),
    topics: Array.isArray(e.topics) ? e.topics : [],
    preparation: e.prep_progress ?? 0,
    grade: e.score === null ? null : Number(e.score),
    location: e.location ?? undefined,
  };
}

export function mapDbSession(s: DbStudySession, fallbackSubjectId: string): StudySession {
  return {
    id: s.id,
    subjectId: s.discipline_id ?? fallbackSubjectId,
    topic: s.title,
    start: s.starts_at,
    durationMin: s.duration_minutes,
    status: DB_TO_SESSION[s.status] ?? "planejada",
  };
}

export function mapDbMaterial(m: DbMaterial, fallbackSubjectId: string): Material {
  return {
    id: m.id,
    name: m.title,
    type: m.kind === "link" ? "link" : typeFromName(m.file_name || m.title),
    subjectId: m.discipline_id ?? fallbackSubjectId,
    addedAt: m.created_at,
    sizeKb: m.size_bytes ? Math.max(1, Math.round(m.size_bytes / 1024)) : 0,
    url: m.url ?? (m.storage_path ? `storage://${m.storage_path}` : undefined),
    description: m.description ?? undefined,
  };
}

export async function fetchSupabaseWorkspace(): Promise<StudoraData | null> {
  if (!isSupabaseConfigured) return null;
  const session = await authService.getSession();
  if (!session) return null;

  const [profile, disciplines, tasks, exams, sessions, materials] = await Promise.all([
    profileService.get(),
    disciplinesService.list(),
    tasksService.list(),
    examsService.list(),
    studyService.list(),
    materialsService.list(),
  ]);

  const subjects = disciplines.map(mapDbSubject);
  const fallbackSubjectId = subjects[0]?.id ?? "";

  return {
    version: SEED_VERSION,
    profile: mapDbProfile(profile, session.user.email ?? ""),
    subjects,
    tasks: tasks.map((t) => mapDbTask(t, fallbackSubjectId)),
    exams: exams.map(mapDbExam),
    sessions: sessions.map((s) => mapDbSession(s, fallbackSubjectId)),
    materials: materials.map((m) => mapDbMaterial(m, fallbackSubjectId)),
  };
}

export const dbMappers = {
  STATUS_TO_DB,
  PRIO_TO_DB,
  SESSION_TO_DB,
  colorToHex,
};
